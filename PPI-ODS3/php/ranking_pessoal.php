<?php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['erro' => 'Usuário não logado']);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT 
            nome,
            total_pesquisas,
            media_calorias,
            media_proteinas,
            pontuacao_saudavel as pontuacao
        FROM ranking_pessoal
        WHERE usuario_id = ?
        ORDER BY pontuacao_saudavel DESC
        LIMIT 20
    ");
    $stmt->execute([$_SESSION['usuario_id']]);
    $ranking = $stmt->fetchAll();
    
    echo json_encode($ranking);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro ao buscar ranking: ' . $e->getMessage()]);
}
?>