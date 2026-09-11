<?php
declare(strict_types=1);

require_once __DIR__ . '/functions.php';
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth.php';

$tipo   = $_GET['tipo'] ?? 'pessoal';
$limite = min(50, max(1, (int) ($_GET['limite'] ?? 20)));

if ($tipo === 'global') {
    $stmt = $pdo->prepare(
        "SELECT alimento_id, nome, total_pesquisas, media_calorias,
                media_proteinas, pontuacao_saudavel AS pontuacao
         FROM ranking_global
         ORDER BY pontuacao_saudavel DESC
         LIMIT ?"
    );
    $stmt->bindValue(1, $limite, PDO::PARAM_INT);
    $stmt->execute();
    json($stmt->fetchAll());
}

$u = exigirLogin();

$stmt = $pdo->prepare(
    "SELECT alimento_id, nome, total_pesquisas, media_calorias,
            media_proteinas, pontuacao_saudavel AS pontuacao
     FROM ranking_pessoal
     WHERE usuario_id = ?
     ORDER BY pontuacao_saudavel DESC
     LIMIT ?"
);
$stmt->bindValue(1, $u['id'], PDO::PARAM_INT);
$stmt->bindValue(2, $limite,  PDO::PARAM_INT);
$stmt->execute();

json($stmt->fetchAll());