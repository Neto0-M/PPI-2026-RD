<?php
declare(strict_types=1);

ini_set('display_errors', '1');
error_reporting(E_ALL);

require_once __DIR__ . '/functions.php';
require_once __DIR__ . '/config.php';

// CORS
header('Access-Control-Allow-Origin: ' . ($_SERVER['HTTP_ORIGIN'] ?? '*'));
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
header('Access-Control-Allow-Credentials: true');
header('Vary: Origin');

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$acao   = $_GET['acao'] ?? 'buscar';
$campos = "id, nome, codigo_barras, categoria, calorias, proteinas,
           carboidratos, gorduras, sodio, acucares, fibras";

// ── DEBUG ──
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

// ── BUSCAR ──
if ($acao === 'buscar') {
    $termo = trim((string) ($_GET['termo'] ?? ''));

    if (mb_strlen($termo) < 2) {
        json([]);
    }

    $resultados = [];

    // Tenta FULLTEXT (só se termo tiver 4+ letras)
    if (mb_strlen($termo) >= 4) {
        try {
            $stmt = $pdo->prepare(
                "SELECT $campos FROM alimentos
                 WHERE MATCH(nome) AGAINST(? IN BOOLEAN MODE) LIMIT 15"
            );
            $stmt->execute([$termo . '*']);
            $resultados = $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log('FULLTEXT falhou: ' . $e->getMessage());
        }
    }

    // Fallback: LIKE
    if (empty($resultados)) {
        $stmt = $pdo->prepare(
            "SELECT $campos FROM alimentos
             WHERE nome LIKE ? OR categoria LIKE ?
             LIMIT 15"
        );
        $like = '%' . addcslashes($termo, '%_') . '%';
        $stmt->execute([$like, $like]);
        $resultados = $stmt->fetchAll();
    }

    // API externa se nada encontrado
    if (empty($resultados)) {
        try {
            foreach (buscarAPI($termo) as $item) {
                try {
                    $id = salvarAlimento($pdo, $item);
                    if ($id) {
                        $item['id'] = $id;
                        $resultados[] = $item;
                    }
                } catch (PDOException $e) {
                    error_log('Erro ao salvar: ' . $e->getMessage());
                }
            }
        } catch (Throwable $e) {
            error_log('Erro API externa: ' . $e->getMessage());
        }
    }

    json($resultados);
}

// ── COMPARAR ──
if ($acao === 'comparar') {
    $ids = array_slice(array_filter(
        array_map('intval', explode(',', $_GET['ids'] ?? '')),
        fn($i) => $i > 0
    ), 0, 20);

    if (!$ids) json([]);

    $ph = implode(',', array_fill(0, count($ids), '?'));
    $stmt = $pdo->prepare("SELECT $campos FROM alimentos WHERE id IN ($ph)");
    $stmt->execute($ids);

    json($stmt->fetchAll());
}

json(['erro' => 'Ação inválida', 'acao_recebida' => $acao], 400);