<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';

/** Exige login ou aborta */
function exigirLogin(): array {
    sessao();
    if (empty($_SESSION['usuario_id'])) {
        json(['erro' => 'Não autorizado'], 401);
    }
    return [
        'id'    => (int) $_SESSION['usuario_id'],
        'nome'  => $_SESSION['usuario_nome']  ?? '',
        'email' => $_SESSION['usuario_email'] ?? '',
    ];
}

/** Gera/retorna token CSRF */
function csrf(): string {
    sessao();
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

/** Valida CSRF do header */
function validarCsrf(): void {
    sessao();
    $tok = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!hash_equals($_SESSION['csrf'] ?? '', $tok)) {
        json(['erro' => 'CSRF inválido'], 403);
    }
}