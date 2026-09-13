<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/functions.php';

header('Access-Control-Allow-Origin: ' . ($_SERVER['HTTP_ORIGIN'] ?? '*'));
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
header('Access-Control-Allow-Credentials: true');
header('Vary: Origin');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$acao = $_GET['acao'] ?? 'buscar';

match ($acao) {
    'buscar'       => acaoBuscar($pdo),
    'comparar'     => acaoComparar($pdo),
    'alternativas' => acaoAlternativas($pdo),
    'debug'        => acaoDebug($pdo),
    default        => json(['erro' => 'Ação inválida', 'acao_recebida' => $acao], 400),
};


// ==========================================
// BUSCAR
// ==========================================
function acaoBuscar(PDO $pdo): never {
    $termo = trim((string) ($_GET['termo'] ?? ''));
    if (mb_strlen($termo) < 2) json([]);

    $chave = 'busca_v2_' . mb_strtolower($termo);
    if (($cache = cacheGet($chave)) !== null) json($cache);

    $resultados = [];
    foreach (expandirTermo($termo) as $t) {
        foreach (buscarLocal($pdo, $t) as $item) {
            $resultados[$item['id']] = $item;
        }
        if (count($resultados) >= 15) break;
    }

    if (empty($resultados)) {
        foreach (expandirTermo($termo) as $t) {
            foreach (buscarExterno($pdo, $t) as $item) {
                $resultados[$item['id']] = $item;
            }
            if (count($resultados) >= 15) break;
        }
    }

    $resultados = comPontuacao(array_values($resultados));
    cacheSet($chave, $resultados);

    json($resultados);
}


// ==========================================
// COMPARAR
// ==========================================
function acaoComparar(PDO $pdo): never {
    $ids = array_slice(array_filter(
        array_map('intval', explode(',', $_GET['ids'] ?? '')),
        fn($i) => $i > 0
    ), 0, 20);

    if (!$ids) json([]);

    $ph = implode(',', array_fill(0, count($ids), '?'));
    $stmt = $pdo->prepare("SELECT " . CAMPOS . " FROM alimentos WHERE id IN ($ph)");
    $stmt->execute($ids);

    json(comPontuacao($stmt->fetchAll()));
}


// ==========================================
// ALTERNATIVAS
// ==========================================
function acaoAlternativas(PDO $pdo): never {
    $id = (int) ($_GET['id'] ?? 0);
    if ($id <= 0) json(['erro' => 'ID inválido'], 400);

    $stmt = $pdo->prepare("SELECT " . CAMPOS . " FROM alimentos WHERE id = ? LIMIT 1");
    $stmt->execute([$id]);
    $base = $stmt->fetch();
    if (!$base) json(['erro' => 'Produto não encontrado'], 404);

    $base['pontuacao'] = calcularPontuacao($base)['pontuacao'];
    $alternativas = [];

    // 1) Mesma categoria
    $cat = trim((string) ($base['categoria'] ?? ''));
    if ($cat !== '') {
        $stmt = $pdo->prepare(
            "SELECT " . CAMPOS . " FROM alimentos
             WHERE id != ? AND categoria = ?
             LIMIT 10"
        );
        $stmt->execute([$id, $cat]);
        foreach ($stmt->fetchAll() as $a) {
            $alternativas[$a['id']] = $a;
        }
    }

    // 2) Categoria parecida
    if (count($alternativas) < 5 && $cat !== '') {
        $primeiraCat = trim(explode(',', $cat)[0] ?? '');
        $primeiraCat = trim(explode(' ', $primeiraCat)[0] ?? '');

        if (mb_strlen($primeiraCat) >= 3) {
            $stmt = $pdo->prepare(
                "SELECT " . CAMPOS . " FROM alimentos
                 WHERE id != ? AND categoria LIKE ?
                 LIMIT 10"
            );
            $stmt->execute([$id, '%' . $primeiraCat . '%']);
            foreach ($stmt->fetchAll() as $a) {
                $alternativas[$a['id']] = $a;
            }
        }
    }

    // 3) Palavras do nome (ignorando genéricas)
    if (count($alternativas) < 5) {
        $ignorar = ['cozido', 'cozida', 'assado', 'assada', 'grelhado', 'grelhada',
                    'frito', 'frita', 'cru', 'crua', 'integral', 'tipo', 'natural',
                    'com', 'sem', 'de', 'da', 'do', 'e', 'ou', 'à', 'ao'];

        $palavras = preg_split('/\s+/', $base['nome'], -1, PREG_SPLIT_NO_EMPTY);
        $palavras = array_filter($palavras, fn($p) =>
            mb_strlen($p) >= 4 && !in_array(mb_strtolower($p), $ignorar, true)
        );

        foreach ($palavras as $palavra) {
            $stmt = $pdo->prepare(
                "SELECT " . CAMPOS . " FROM alimentos
                 WHERE id != ? AND nome LIKE ?
                 LIMIT 5"
            );
            $stmt->execute([$id, '%' . $palavra . '%']);
            foreach ($stmt->fetchAll() as $a) {
                $alternativas[$a['id']] = $a;
            }
            if (count($alternativas) >= 8) break;
        }
    }

    // 4) Fallback: pontuação próxima
    if (count($alternativas) < 3) {
        $stmt = $pdo->prepare(
            "SELECT " . CAMPOS . " FROM alimentos
             WHERE id != ?
             ORDER BY ABS(
                (COALESCE(proteinas,0) * 2 + COALESCE(fibras,0) * 4
                 - COALESCE(acucares,0) * 0.5 - COALESCE(gorduras,0) * 0.6
                 - COALESCE(calorias,0) / 50) - ?
             ) ASC
             LIMIT 8"
        );
        $stmt->execute([$id, $base['pontuacao']]);
        foreach ($stmt->fetchAll() as $a) {
            $alternativas[$a['id']] = $a;
        }
    }

    if (empty($alternativas)) {
        json(['base' => $base, 'alternativas' => []]);
    }

    $base = array_merge($base, calcularPontuacao($base));
    foreach ($alternativas as &$a) {
        $a = array_merge($a, calcularPontuacao($a));
    }
    unset($a);

    $alternativas = array_values($alternativas);

    $precos = array_filter(
        array_column(array_merge([$base], $alternativas), 'preco'),
        fn($p) => $p !== null && $p !== ''
    );

    if (count($precos) >= 2) {
        $min = (float) min($precos);
        $max = (float) max($precos);

        $base['pontuacao_preco'] = calcularPontuacaoPreco(
            $base['preco'] !== null ? (float) $base['preco'] : null, $min, $max
        );
        $base['score_final'] = calcularScoreFinal($base['pontuacao'], $base['pontuacao_preco']);

        foreach ($alternativas as &$a) {
            $a['pontuacao_preco'] = calcularPontuacaoPreco(
                $a['preco'] !== null ? (float) $a['preco'] : null, $min, $max
            );
            $a['score_final'] = calcularScoreFinal($a['pontuacao'], $a['pontuacao_preco']);
        }
        unset($a);

        usort($alternativas, fn($x, $y) => ($y['score_final'] ?? 0) <=> ($x['score_final'] ?? 0));
    } else {
        usort($alternativas, fn($x, $y) => $y['pontuacao'] <=> $x['pontuacao']);
    }

    json([
        'base'         => $base,
        'alternativas' => array_slice($alternativas, 0, 6),
    ]);
}


// ==========================================
// DEBUG
// ==========================================
function acaoDebug(PDO $pdo): never {
    json([
        'php_version'     => PHP_VERSION,
        'method'          => $_SERVER['REQUEST_METHOD'],
        'pdo_drivers'     => PDO::getAvailableDrivers(),
        'curl'            => function_exists('curl_init'),
        'tabelas'         => $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN),
        'total_alimentos' => (int) $pdo->query("SELECT COUNT(*) FROM alimentos")->fetchColumn(),
    ]);
}


// ==========================================
// BUSCA LOCAL E EXTERNA
// ==========================================
function buscarLocal(PDO $pdo, string $termo): array {
    if (mb_strlen($termo) >= 4) {
        try {
            $stmt = $pdo->prepare(
                "SELECT " . CAMPOS . " FROM alimentos
                 WHERE MATCH(nome) AGAINST(? IN BOOLEAN MODE) LIMIT 15"
            );
            $stmt->execute([$termo . '*']);
            $r = $stmt->fetchAll();
            if ($r) return $r;
        } catch (PDOException $e) {
            error_log('FULLTEXT: ' . $e->getMessage());
        }
    }

    $stmt = $pdo->prepare(
        "SELECT " . CAMPOS . " FROM alimentos
         WHERE nome LIKE ? OR categoria LIKE ? LIMIT 15"
    );
    $like = '%' . addcslashes($termo, '%_') . '%';
    $stmt->execute([$like, $like]);

    return $stmt->fetchAll();
}

function buscarExterno(PDO $pdo, string $termo): array {
    $resultados = [];
    try {
        foreach (buscarAPI($termo) as $item) {
            try {
                if ($id = salvarAlimento($pdo, $item)) {
                    $item['id'] = $id;
                    $resultados[] = $item;
                }
            } catch (PDOException $e) {
                error_log('Salvar: ' . $e->getMessage());
            }
        }
    } catch (Throwable $e) {
        error_log('API externa: ' . $e->getMessage());
    }
    return $resultados;
}