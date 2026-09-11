<?php
declare(strict_types=1);

// ==========================================
// CONFIGURAÇÕES
// ==========================================

const DB_HOST = 'localhost';
const DB_NAME = 'nutriscan';
const DB_USER = 'root';
const DB_PASS = '';

const APP_ENV = 'development';

// ==========================================
// CONEXÃO
// ==========================================

try {
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );
} catch (PDOException $e) {
    error_log('DB: ' . $e->getMessage());
    http_response_code(500);
    header('Content-Type: application/json');
    exit(json_encode(['erro' => 'Erro interno']));
}

// ==========================================
// SESSÃO
// ==========================================

function sessao(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;

    session_set_cookie_params([
        'httponly' => true,
        'secure'   => isset($_SERVER['HTTPS']),
        'samesite' => 'Strict',
    ]);
    session_start();
}

// ==========================================
// OPEN FOOD FACTSa
// ==========================================

const OFF_URL    = 'https://br.openfoodfacts.org/cgi/search.pl';
const USER_AGENT = 'NutriScan/1.0';