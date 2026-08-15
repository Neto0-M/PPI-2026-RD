<?php
header('Content-Type: application/json');
require_once 'config.php';

try {
    $stmt = $pdo->query("
        SELECT 
            nome,
            total_pesquisas,
            media_calorias,
            media_proteinas,
            pontuacao_saudavel as pontuacao
        FROM ranking_global
        ORDER BY pontuacao_saudavel DESC
        LIMIT 20
    ");
    $ranking = $stmt->fetchAll();
    
    echo json_encode($ranking);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro ao buscar ranking global: ' . $e->getMessage()]);
}
?>