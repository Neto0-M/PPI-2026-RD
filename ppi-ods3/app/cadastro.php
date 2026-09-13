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
    json(['sucesso' => false, 'mensagem' => 'Todos os campos são obrigatórios'], 400);
}

if (mb_strlen($nome) > 100) {
    json(['sucesso' => false, 'mensagem' => 'Nome muito longo'], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json(['sucesso' => false, 'mensagem' => 'E-mail inválido'], 400);
}

if (strlen($senha) < 6) {
    json(['sucesso' => false, 'mensagem' => 'A senha deve ter pelo menos 6 caracteres'], 400);
}

if (strlen($senha) > 72) {
    json(['sucesso' => false, 'mensagem' => 'Senha muito longa'], 400);
}

try {
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        json(['sucesso' => false, 'mensagem' => 'Este e-mail já está cadastrado'], 409);
    }

    $pdo->prepare("INSERT INTO usuarios (nome, email, senha_hash) VALUES (?,?,?)")
        ->execute([$nome, $email, password_hash($senha, PASSWORD_DEFAULT)]);

    $id = (int) $pdo->lastInsertId();

    sessao();
    session_regenerate_id(true);
    $_SESSION['usuario_id']    = $id;
    $_SESSION['usuario_nome']  = $nome;
    $_SESSION['usuario_email'] = $email;

    json([
        'sucesso'  => true,
        'mensagem' => 'Cadastro realizado com sucesso!',
        'id'       => $id,
        'nome'     => $nome,
    ]);

} catch (PDOException $e) {
    error_log('Cadastro: ' . $e->getMessage());
    json(['sucesso' => false, 'mensagem' => 'Erro ao cadastrar'], 500);
}