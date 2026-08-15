<?php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? $_POST['email'] ?? '';
$senha = $input['senha'] ?? $_POST['senha'] ?? '';

if (empty($email) || empty($senha)) {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Email e senha são obrigatórios']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    $usuario = $stmt->fetch();
    
    if ($usuario && password_verify($senha, $usuario['senha_hash'])) {
        $_SESSION['usuario_id'] = $usuario['id'];
        $_SESSION['usuario_nome'] = $usuario['nome'];
        $_SESSION['usuario_email'] = $usuario['email'];
        
        echo json_encode([
            'sucesso' => true,
            'mensagem' => 'Login realizado com sucesso!',
            'nome' => $usuario['nome'],
            'id' => $usuario['id']
        ]);
    } else {
        echo json_encode(['sucesso' => false, 'mensagem' => 'Email ou senha incorretos']);
    }
} catch (PDOException $e) {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Erro ao fazer login: ' . $e->getMessage()]);
}
?>