<?php
declare(strict_types=1);

require_once __DIR__ . '/functions.php';
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json(['erro' => 'Método inválido'], 405);

$in = body();
$email = trim((string) ($in['email'] ?? ''));
$senha = (string) ($in['senha'] ?? '');

if ($email === '' || $senha === '') {
    json(['sucesso' => false, 'mensagem' => 'E-mail e senha obrigatórios'], 400);
}

sessao();

// Rate limiting: 5 tentativas / 60s
if (($_SESSION['bloqueado_ate'] ?? 0) > time()) {
    json(['sucesso' => false, 'mensagem' => 'Muitas tentativas. Aguarde.'], 429);
}

try {
    $stmt = $pdo->prepare("SELECT id, nome, email, senha_hash FROM usuarios WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $u = $stmt->fetch();

    if ($u && password_verify($senha, $u['senha_hash'])) {
        session_regenerate_id(true);
        $_SESSION['usuario_id']    = (int) $u['id'];
        $_SESSION['usuario_nome']  = $u['nome'];
        $_SESSION['usuario_email'] = $u['email'];
        unset($_SESSION['tentativas'], $_SESSION['bloqueado_ate']);

        json(['sucesso' => true, 'mensagem' => 'Login OK', 'id' => $u['id'], 'nome' => $u['nome']]);
    }

    $_SESSION['tentativas'] = ($_SESSION['tentativas'] ?? 0) + 1;
    if ($_SESSION['tentativas'] >= 5) {
        $_SESSION['bloqueado_ate'] = time() + 60;
        $_SESSION['tentativas']    = 0;
    }

    usleep(random_int(150000, 400000));
    json(['sucesso' => false, 'mensagem' => 'E-mail ou senha incorretos'], 401);

} catch (PDOException $e) {
    error_log($e->getMessage());
    json(['sucesso' => false, 'mensagem' => 'Erro ao fazer login'], 500);
}