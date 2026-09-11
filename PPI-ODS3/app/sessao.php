<?php
declare(strict_types=1);

require_once __DIR__ . '/functions.php';
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth.php';

sessao();

if (empty($_SESSION['usuario_id'])) {
    json(['logado' => false]);
}

json([
    'logado'     => true,
    'id'         => (int) $_SESSION['usuario_id'],
    'nome'       => $_SESSION['usuario_nome']  ?? '',
    'email'      => $_SESSION['usuario_email'] ?? '',
    'csrf_token' => csrf(),
]);