<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/functions.php';

// ---------- CORS ----------
header('Access-Control-Allow-Origin: ' . ($_SERVER['HTTP_ORIGIN'] ?? '*'));
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
header('Access-Control-Allow-Credentials: true');
header('Vary: Origin');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ---------- Campos padrão ----------
const CAMPOS = "id, nome, codigo_barras, categoria, calorias, proteinas,
                carboidratos, gorduras, sodio, acucares, fibras";

$acao = $_GET['acao'] ?? 'buscar';

// ==========================================
// BUSCAR
// ==========================================
if ($acao === 'buscar') {
    $termo = trim((string) ($_GET['termo'] ?? ''));

    if (mb_strlen($termo) < 2) {
        json([]);
    }

    $resultados = buscarLocal($pdo, $termo);

    if (empty($resultados)) {
        $resultados = buscarExterno($pdo, $termo);
    }

    json(comPontuacao($resultados));
}

// ==========================================
// COMPARAR
// ==========================================
if ($acao === 'comparar') {
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
// DEBUG
// ==========================================
if ($acao === 'debug') {
    json([
        'php_version'     => PHP_VERSION,
        'method'          => $_SERVER['REQUEST_METHOD'],
        'pdo_drivers'     => PDO::getAvailableDrivers(),
        'curl'            => function_exists('curl_init'),
        'tabelas'         => $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN),
        'total_alimentos' => (int) $pdo->query("SELECT COUNT(*) FROM alimentos")->fetchColumn(),
    ]);
}

json(['erro' => 'Ação inválida', 'acao_recebida' => $acao], 400);


// ==========================================
// HELPERS INTERNOS
// ==========================================

/** Busca no banco local (FULLTEXT com fallback LIKE). */
function buscarLocal(PDO $pdo, string $termo): array {
    // FULLTEXT só compensa a partir de 4 letras
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
         WHERE nome LIKE ? OR categoria LIKE ?
         LIMIT 15"
    );
    $like = '%' . addcslashes($termo, '%_') . '%';
    $stmt->execute([$like, $like]);

    return $stmt->fetchAll();
}

/** Busca na API externa e salva no banco. */
function buscarExterno(PDO $pdo, string $termo): array {
    $resultados = [];

    try {
        foreach (buscarAPI($termo) as $item) {
            try {
                $id = salvarAlimento($pdo, $item);
                if ($id) {
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