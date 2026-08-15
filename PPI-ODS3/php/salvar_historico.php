<?php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['erro' => 'Usuário não logado']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$alimento_id = $input['alimento_id'] ?? null;

if (!$alimento_id) {
    http_response_code(400);
    echo json_encode(['erro' => 'ID do alimento não informado']);
    exit;
}

try {
    // Verificar se o alimento existe
    $stmt = $pdo->prepare("SELECT id FROM alimentos WHERE id = ?");
    $stmt->execute([$alimento_id]);
    if (!$stmt->fetch()) {
        http_response_code(404);
        echo json_encode(['erro' => 'Alimento não encontrado']);
        exit;
    }
    
    // Inserir no histórico
    $stmt = $pdo->prepare("INSERT INTO historico_pesquisas (usuario_id, alimento_id) VALUES (?, ?)");
    $stmt->execute([$_SESSION['usuario_id'], $alimento_id]);
    
    echo json_encode(['sucesso' => true, 'mensagem' => 'Pesquisa salva no histórico']);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro ao salvar histórico: ' . $e->getMessage()]);
}
?>