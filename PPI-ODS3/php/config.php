<?php
// Configuração do banco de dados
$host = 'localhost';
$dbname = 'nutriscan';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    die(json_encode(['erro' => 'Erro na conexão com o banco: ' . $e->getMessage()]));
}

// Configuração da API Open Food Facts
define('OPENFOODFACTS_URL', 'https://world.openfoodfacts.org/cgi/search.pl');
define('USER_AGENT', 'NutriScan/1.0');
?>