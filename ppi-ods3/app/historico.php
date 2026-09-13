<?php
declare(strict_types=1);

require_once __DIR__ . '/functions.php';
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth.php';

$u = exigirLogin();
$metodo = $_SERVER['REQUEST_METHOD'];

// ── GET: listar ──
if ($metodo === 'GET') {
    $limite = min(100, max(1, (int) ($_GET['limite'] ?? 30)));

    $stmt = $pdo->prepare(
        "SELECT h.id, h.data_pesquisa,
                a.id AS alimento_id, a.nome, a.calorias, a.proteinas
         FROM historico_pesquisas h
         JOIN alimentos a ON a.id = h.alimento_id
         WHERE h.usuario_id = ?
         ORDER BY h.data_pesquisa DESC
         LIMIT ?"
    );
    $stmt->bindValue(1, $u['id'], PDO::PARAM_INT);
    $stmt->bindValue(2, $limite,  PDO::PARAM_INT);
    $stmt->execute();

    json($stmt->fetchAll());
}

// ── POST: salvar ──
if ($metodo === 'POST') {
    validarCsrf();
    $id = (int) (body()['alimento_id'] ?? 0);

    if ($id <= 0) json(['erro' => 'ID inválido'], 400);

    $stmt = $pdo->prepare("SELECT id FROM alimentos WHERE id = ? LIMIT 1");
    $stmt->execute([$id]);
    if (!$stmt->fetch()) json(['erro' => 'Alimento não encontrado'], 404);

    $pdo->prepare("INSERT INTO historico_pesquisas (usuario_id, alimento_id) VALUES (?,?)")
        ->execute([$u['id'], $id]);

    json(['sucesso' => true]);
}

// ── DELETE: deletar um item ──
if ($metodo === 'DELETE') {
    validarCsrf();
    $in = body();

    // Se veio "limpar_tudo", apaga todos do usuário
    if (($in['acao'] ?? '') === 'limpar_tudo') {
        $pdo->prepare("DELETE FROM historico_pesquisas WHERE usuario_id = ?")
            ->execute([$u['id']]);
        json(['sucesso' => true, 'mensagem' => 'Histórico limpo']);
    }

    // Senão, apaga só o item pelo ID
    $id = (int) ($in['id'] ?? 0);
    if ($id <= 0) json(['erro' => 'ID inválido'], 400);

    $stmt = $pdo->prepare("DELETE FROM historico_pesquisas WHERE id = ? AND usuario_id = ?");
    $stmt->execute([$id, $u['id']]);
    if ($stmt->rowCount() === 0) json(['erro' => 'Não encontrado'], 404);

    json(['sucesso' => true]);
}