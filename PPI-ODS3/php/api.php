<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'config.php';
require_once 'functions.php';

$acao = $_GET['acao'] ?? 'buscar';

if ($acao === 'buscar') {
    $termo = trim($_GET['termo'] ?? '');
    
    if (strlen($termo) < 2) {
        echo json_encode([]);
        exit;
    }
    
    // 1º - Buscar no banco local
    $stmt = $pdo->prepare("SELECT * FROM alimentos WHERE nome LIKE ? LIMIT 15");
    $stmt->execute(["%$termo%"]);
    $resultados = $stmt->fetchAll();
    
    // 2º - Se não encontrou, buscar na API externa
    if (empty($resultados)) {
        $apiResultados = buscarNaAPIOpenFoodFacts($termo);
        
        foreach ($apiResultados as $item) {
            $id = salvarAlimentoNoBanco($pdo, $item);
            $item['id'] = $id;
            $resultados[] = $item;
        }
    }
    
    echo json_encode($resultados);
    exit;
}

if ($acao === 'comparar') {
    $ids = $_GET['ids'] ?? '';
    if (empty($ids)) {
        echo json_encode([]);
        exit;
    }
    
    $idsArray = array_map('intval', explode(',', $ids));
    $placeholders = implode(',', array_fill(0, count($idsArray), '?'));
    
    $stmt = $pdo->prepare("SELECT * FROM alimentos WHERE id IN ($placeholders)");
    $stmt->execute($idsArray);
    $resultados = $stmt->fetchAll();
    
    echo json_encode($resultados);
    exit;
}

echo json_encode(['erro' => 'Ação inválida']);
?>