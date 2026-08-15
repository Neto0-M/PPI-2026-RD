<?php
/**
 * Busca produtos na API Open Food Facts
 */
function buscarNaAPIOpenFoodFacts($termo) {
    $url = OPENFOODFACTS_URL . '?search_terms=' . urlencode($termo) . 
           '&search_simple=1&action=process&json=1&page_size=10';
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_USERAGENT, USER_AGENT);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    $resposta = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200 || !$resposta) {
        return [];
    }
    
    $dados = json_decode($resposta, true);
    if (!isset($dados['products']) || empty($dados['products'])) {
        return [];
    }
    
    $produtos = [];
    foreach ($dados['products'] as $produto) {
        $produtos[] = [
            'nome' => $produto['product_name'] ?? $produto['generic_name'] ?? 'Produto sem nome',
            'codigo_barras' => $produto['code'] ?? '',
            'categoria' => $produto['categories'] ?? '',
            'calorias' => $produto['nutriments']['energy-kcal_100g'] ?? 0,
            'proteinas' => $produto['nutriments']['proteins_100g'] ?? 0,
            'carboidratos' => $produto['nutriments']['carbohydrates_100g'] ?? 0,
            'gorduras' => $produto['nutriments']['fat_100g'] ?? 0,
            'sodio' => $produto['nutriments']['sodium_100g'] ?? 0,
            'acucares' => $produto['nutriments']['sugars_100g'] ?? 0,
            'fibras' => $produto['nutriments']['fiber_100g'] ?? 0
        ];
    }
    return $produtos;
}

/**
 * Salva um alimento no banco de dados
 */
function salvarAlimentoNoBanco($pdo, $dados) {
    $sql = "INSERT INTO alimentos 
            (nome, codigo_barras, categoria, calorias, proteinas, carboidratos, gorduras, sodio, acucares, fibras) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            nome = VALUES(nome), 
            categoria = VALUES(categoria),
            calorias = VALUES(calorias),
            proteinas = VALUES(proteinas),
            carboidratos = VALUES(carboidratos),
            gorduras = VALUES(gorduras),
            sodio = VALUES(sodio),
            acucares = VALUES(acucares),
            fibras = VALUES(fibras)";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $dados['nome'],
        $dados['codigo_barras'],
        $dados['categoria'],
        $dados['calorias'],
        $dados['proteinas'],
        $dados['carboidratos'],
        $dados['gorduras'],
        $dados['sodio'],
        $dados['acucares'],
        $dados['fibras']
    ]);
    
    return $pdo->lastInsertId() ?: $pdo->query("SELECT id FROM alimentos WHERE codigo_barras = '{$dados['codigo_barras']}'")->fetchColumn();
}
?>