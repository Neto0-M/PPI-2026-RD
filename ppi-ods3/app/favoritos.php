<?php
declare(strict_types=1);

require_once __DIR__ . '/functions.php';
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth.php';

$u = exigirLogin();

// ── GET: listar ──
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->prepare(
        "SELECT a.id, a.nome, a.calorias, a.proteinas
         FROM favoritos f
         JOIN alimentos a ON a.id = f.alimento_id
         WHERE f.usuario_id = ?
         ORDER BY f.data_favorito DESC"
    );
    $stmt->execute([$u['id']]);
    json($stmt->fetchAll());
}

// ── POST: adicionar / remover ──
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    validarCsrf();
    $in = body();
    $id = (int) ($in['alimento_id'] ?? 0);
    $acao = $in['acao'] ?? 'adicionar';

    if ($id <= 0) json(['erro' => 'ID inválido'], 400);

    if ($acao === 'remover') {
        $pdo->prepare("DELETE FROM favoritos WHERE usuario_id = ? AND alimento_id = ?")
            ->execute([$u['id'], $id]);
        json(['sucesso' => true]);
    }

    $stmt = $pdo->prepare("SELECT id FROM alimentos WHERE id = ? LIMIT 1");
    $stmt->execute([$id]);
    if (!$stmt->fetch()) json(['erro' => 'Alimento não encontrado'], 404);

    $pdo->prepare("INSERT IGNORE INTO favoritos (usuario_id, alimento_id) VALUES (?,?)")
        ->execute([$u['id'], $id]);

    json(['sucesso' => true]);
}

json(['erro' => 'Método inválido'], 405);