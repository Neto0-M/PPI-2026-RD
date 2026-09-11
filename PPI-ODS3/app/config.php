<?php
declare(strict_types=1);

require_once __DIR__ . '/functions.php';
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json(['erro' => 'Método inválido'], 405);

$in = body();
$nome  = trim((string) ($in['nome']  ?? ''));
$email = trim((string) ($in['email'] ?? ''));
$senha = (string) ($in['senha'] ?? '');

if ($nome === '' || $email === '' || $senha === '') {
    json(['sucesso' => false, 'mensagem' => 'Preencha todos os campos'], 400);
}
if (mb_strlen($nome) > 100) {
    json(['sucesso' => false, 'mensagem' => 'Nome muito longo'], 400);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json(['sucesso' => false, 'mensagem' => 'E-mail inválido'], 400);
}
if (strlen($senha) < 6 || strlen($senha) > 72) {
    json(['sucesso' => false, 'mensagem' => 'Senha deve ter entre 6 e 72 caracteres'], 400);
}

try {
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        json(['sucesso' => false, 'mensagem' => 'E-mail já cadastrado'], 409);
    }

    $stmt = $pdo->prepare("INSERT INTO usuarios (nome, email, senha_hash) VALUES (?,?,?)");
    $stmt->execute([$nome, $email, password_hash($senha, PASSWORD_DEFAULT)]);
    $id = (int) $pdo->lastInsertId();

    sessao();
    session_regenerate_id(true);
    $_SESSION['usuario_id']    = $id;
    $_SESSION['usuario_nome']  = $nome;
    $_SESSION['usuario_email'] = $email;

    json(['sucesso' => true, 'mensagem' => 'Cadastro realizado!', 'id' => $id, 'nome' => $nome]);

} catch (PDOException $e) {
    error_log($e->getMessage());
    json(['sucesso' => false, 'mensagem' => 'Erro ao cadastrar'], 500);
}