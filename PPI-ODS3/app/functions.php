<?php
declare(strict_types=1);

/** Resposta JSON padronizada */
function json(mixed $d, int $s = 200): never {
    http_response_code($s);
    header('Content-Type: application/json; charset=utf-8');
    exit(json_encode($d, JSON_UNESCAPED_UNICODE));
}

/** Lê corpo JSON (ou $_POST como fallback) */
function body(): array {
    $raw = file_get_contents('php://input');
    $d = $raw ? json_decode($raw, true) : null;
    return is_array($d) ? $d : $_POST;
}

/** Busca produtos na API Open Food Facts */
function buscarAPI(string $termo): array {
    $url = OFF_URL . '?' . http_build_query([
        'search_terms'  => $termo,
        'search_simple' => 1,
        'action'        => 'process',
        'json'          => 1,
        'page_size'     => 10,
        'lc'            => 'pt',
        'cc'            => 'br',
    ]);

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_USERAGENT      => USER_AGENT,
        CURLOPT_TIMEOUT        => 10,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);
    $resp = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if (!$resp || $code !== 200) return [];

    $dados = json_decode($resp, true);
    if (empty($dados['products'])) return [];

    return array_map(function ($p) {
        $n = $p['nutriments'] ?? [];
        return [
            'nome'          => mb_substr($p['product_name'] ?? $p['product_name_pt'] ?? 'Sem nome', 0, 500),
            'codigo_barras' => (string) ($p['code'] ?? ''),
            'categoria'     => mb_substr((string) ($p['categories'] ?? ''), 0, 255),
            'calorias'      => isset($n['energy-kcal_100g'])   ? (float) $n['energy-kcal_100g']   : null,
            'proteinas'     => isset($n['proteins_100g'])      ? (float) $n['proteins_100g']      : null,
            'carboidratos'  => isset($n['carbohydrates_100g']) ? (float) $n['carbohydrates_100g'] : null,
            'gorduras'      => isset($n['fat_100g'])           ? (float) $n['fat_100g']           : null,
            'sodio'         => isset($n['sodium_100g'])        ? (float) $n['sodium_100g']        : null,
            'acucares'      => isset($n['sugars_100g'])        ? (float) $n['sugars_100g']        : null,
            'fibras'        => isset($n['fiber_100g'])         ? (float) $n['fiber_100g']         : null,
        ];
    }, $dados['products']);
}

/** Salva alimento e devolve ID */
function salvarAlimento(PDO $pdo, array $d): ?int {
    $pdo->prepare(
        "INSERT INTO alimentos
         (nome, codigo_barras, categoria, calorias, proteinas, carboidratos,
          gorduras, sodio, acucares, fibras)
         VALUES (?,?,?,?,?,?,?,?,?,?)
         ON DUPLICATE KEY UPDATE
          nome=VALUES(nome), categoria=VALUES(categoria), calorias=VALUES(calorias),
          proteinas=VALUES(proteinas), carboidratos=VALUES(carboidratos),
          gorduras=VALUES(gorduras), sodio=VALUES(sodio),
          acucares=VALUES(acucares), fibras=VALUES(fibras)"
    )->execute([
        $d['nome'],
        $d['codigo_barras'] ?: '',
        $d['categoria'] ?: null,
        $d['calorias'], $d['proteinas'], $d['carboidratos'],
        $d['gorduras'], $d['sodio'], $d['acucares'], $d['fibras'],
    ]);

    $id = (int) $pdo->lastInsertId();
    if ($id) return $id;

    $stmt = $pdo->prepare("SELECT id FROM alimentos WHERE codigo_barras = ? LIMIT 1");
    $stmt->execute([$d['codigo_barras'] ?: '']);
    $id = $stmt->fetchColumn();
    return $id !== false ? (int) $id : null;
}