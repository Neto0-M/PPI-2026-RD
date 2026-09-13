<?php
declare(strict_types=1);

const CAMPOS = "id, nome, codigo_barras, categoria, calorias, proteinas,
                carboidratos, gorduras, sodio, acucares, fibras, preco";


// ==========================================
// RESPOSTA E CORPO
// ==========================================

function json(mixed $d, int $s = 200): never {
    http_response_code($s);
    header('Content-Type: application/json; charset=utf-8');
    exit(json_encode($d, JSON_UNESCAPED_UNICODE));
}

function body(): array {
    $raw = file_get_contents('php://input');
    $d = $raw ? json_decode($raw, true) : null;
    return is_array($d) ? $d : $_POST;
}


// ==========================================
// CACHE
// ==========================================

function cacheGet(string $chave, int $ttl = 300): mixed {
    $arquivo = sys_get_temp_dir() . '/paladar_' . md5($chave) . '.cache';
    if (!file_exists($arquivo)) return null;
    if (time() - filemtime($arquivo) > $ttl) {
        @unlink($arquivo);
        return null;
    }
    return json_decode(file_get_contents($arquivo), true);
}

function cacheSet(string $chave, mixed $valor): void {
    $arquivo = sys_get_temp_dir() . '/paladar_' . md5($chave) . '.cache';
    file_put_contents($arquivo, json_encode($valor));
}


// ==========================================
// OPEN FOOD FACTS
// ==========================================

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
            'preco'         => null,
        ];
    }, $dados['products']);
}


// ==========================================
// BANCO
// ==========================================

function salvarAlimento(PDO $pdo, array $d): ?int {
    $pdo->prepare(
        "INSERT INTO alimentos
         (nome, codigo_barras, categoria, calorias, proteinas, carboidratos,
          gorduras, sodio, acucares, fibras, preco)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)
         ON DUPLICATE KEY UPDATE
          nome=VALUES(nome), categoria=VALUES(categoria), calorias=VALUES(calorias),
          proteinas=VALUES(proteinas), carboidratos=VALUES(carboidratos),
          gorduras=VALUES(gorduras), sodio=VALUES(sodio),
          acucares=VALUES(acucares), fibras=VALUES(fibras)"
    )->execute([
        $d['nome'],
        $d['codigo_barras'] ?: '',
        $d['categoria'] ?: null,
        $d['calorias'] ?? null,
        $d['proteinas'] ?? null,
        $d['carboidratos'] ?? null,
        $d['gorduras'] ?? null,
        $d['sodio'] ?? null,
        $d['acucares'] ?? null,
        $d['fibras'] ?? null,
        $d['preco'] ?? null,
    ]);

    $id = (int) $pdo->lastInsertId();
    if ($id) return $id;

    $stmt = $pdo->prepare("SELECT id FROM alimentos WHERE codigo_barras = ? LIMIT 1");
    $stmt->execute([$d['codigo_barras'] ?: '']);
    $id = $stmt->fetchColumn();
    return $id !== false ? (int) $id : null;
}


// ==========================================
// PONTUAÇÃO
// ==========================================

function calcularPontuacao(array $p): array {
    $cal  = (float) ($p['calorias']  ?? 0);
    $prot = (float) ($p['proteinas'] ?? 0);
    $fib  = (float) ($p['fibras']    ?? 0);
    $gord = (float) ($p['gorduras']  ?? 0);
    $acuc = (float) ($p['acucares']  ?? 0);

    $pts = 50
         + min(25, $prot * 2)
         + min(25, $fib  * 4)
         - min(25, $acuc * 0.5)
         - min(15, $gord * 0.6)
         - min(10, $cal  / 50);

    $pts = (int) max(0, min(100, round($pts)));
    $cls = $pts >= 70 ? 'saudavel' : ($pts >= 40 ? 'moderado' : 'pouco');

    return ['pontuacao' => $pts, 'classificacao' => $cls];
}

function comPontuacao(array $produtos): array {
    foreach ($produtos as &$p) {
        $p = array_merge($p, calcularPontuacao($p));
    }
    return $produtos;
}

function calcularPontuacaoPreco(?float $preco, float $min, float $max): int {
    if ($preco === null || $max <= $min) return 50;
    return (int) round((($max - $preco) / ($max - $min)) * 100);
}

function calcularScoreFinal(int $saudavel, int $preco): int {
    return (int) round($saudavel * 0.6 + $preco * 0.4);
}


// ==========================================
// EXPANSÃO DE TERMOS
// ==========================================

function expandirTermo(string $termo): array {
    $termo = mb_strtolower(trim($termo));

    $mapa = [
        'carne'        => ['carne', 'bovina', 'bovino', 'boi', 'bife', 'picanha', 'alcatra', 'coxão', 'patinho', 'acém', 'costela', 'músculo', 'contrafilé', 'filé', 'maminha'],
        'boi'          => ['bovina', 'bovino', 'picanha', 'alcatra', 'coxão', 'patinho', 'acém', 'costela'],
        'bife'         => ['bife', 'alcatra', 'contrafilé', 'coxão', 'patinho'],
        'picanha'      => ['picanha', 'bovina', 'bovino'],
        'churrasco'    => ['picanha', 'alcatra', 'costela', 'contrafilé', 'linguiça', 'salsicha', 'maminha'],
        'frango'       => ['frango', 'ave', 'aves', 'peito', 'coxa', 'sobrecoxa', 'asa', 'chester', 'peru'],
        'ave'          => ['frango', 'peru', 'chester'],
        'peru'         => ['peru', 'chester', 'ave'],
        'peixe'        => ['peixe', 'tilápia', 'salmão', 'sardinha', 'atum', 'merluza', 'tambaqui', 'pintado', 'bacalhau'],
        'porco'        => ['suína', 'suíno', 'porco', 'lombo', 'bisteca', 'pernil', 'bacon', 'linguiça'],
        'suino'        => ['suína', 'suíno', 'lombo', 'bisteca', 'pernil', 'bacon', 'linguiça'],
        'suíno'        => ['suína', 'suíno', 'lombo', 'bisteca', 'pernil', 'bacon', 'linguiça'],
        'embutido'     => ['embutido', 'presunto', 'mortadela', 'salsicha', 'salame', 'linguiça', 'nuggets', 'hambúrguer'],
        'linguica'     => ['linguiça', 'suína', 'salsicha'],
        'linguiça'     => ['linguiça', 'suína', 'salsicha'],
        'ovo'          => ['ovo', 'ovos', 'clara', 'gema'],
        'ovos'         => ['ovo', 'ovos', 'clara', 'gema'],
        'leite'        => ['leite', 'iogurte', 'queijo', 'requeijão', 'manteiga', 'margarina', 'creme', 'condensado'],
        'queijo'       => ['queijo', 'mussarela', 'prato', 'minas', 'parmesão', 'ricota', 'requeijão'],
        'iogurte'      => ['iogurte', 'leite'],
        'lactose'      => ['leite', 'iogurte', 'queijo'],
        'arroz'        => ['arroz', 'integral', 'branco', 'parboilizado'],
        'pao'          => ['pão', 'francês', 'forma', 'integral', 'queijo'],
        'pão'          => ['pão', 'francês', 'forma', 'integral', 'queijo'],
        'massa'        => ['macarrão', 'massa', 'lasanha', 'instantâneo'],
        'macarrao'     => ['macarrão', 'massa'],
        'macarrão'     => ['macarrão', 'massa'],
        'biscoito'     => ['biscoito', 'bolacha', 'cracker', 'recheado', 'arroz'],
        'bolacha'      => ['biscoito', 'bolacha', 'cracker'],
        'cereal'       => ['cereal', 'aveia', 'granola', 'matinal', 'quinoa'],
        'aveia'        => ['aveia', 'cereal', 'granola'],
        'milho'        => ['milho', 'fubá', 'cuscuz', 'pipoca'],
        'trigo'        => ['trigo', 'farinha', 'pão', 'macarrão'],
        'farinha'      => ['farinha', 'trigo', 'mandioca', 'fubá'],
        'mandioca'     => ['mandioca', 'tapioca', 'farinha'],
        'feijao'       => ['feijão', 'fradinho', 'carioca', 'preto', 'branco'],
        'feijão'       => ['feijão', 'fradinho', 'carioca', 'preto', 'branco'],
        'leguminosa'   => ['feijão', 'lentilha', 'grão', 'soja', 'ervilha', 'amendoim'],
        'grao'         => ['grão-de-bico', 'feijão', 'lentilha'],
        'grão'         => ['grão-de-bico', 'feijão', 'lentilha'],
        'verdura'      => ['alface', 'rúcula', 'couve', 'espinafre', 'brócolis', 'couve-flor'],
        'vegetal'      => ['alface', 'rúcula', 'couve', 'cenoura', 'tomate', 'pepino', 'abóbora', 'beterraba'],
        'legume'       => ['cenoura', 'tomate', 'pepino', 'abóbora', 'beterraba', 'chuchu', 'quiabo', 'berinjela'],
        'fruta'        => ['banana', 'maçã', 'laranja', 'mamão', 'manga', 'abacaxi', 'melancia', 'melão', 'uva', 'morango', 'kiwi', 'pera', 'goiaba', 'maracujá', 'limão', 'acerola', 'caju', 'pêssego', 'ameixa'],
        'banana'       => ['banana', 'prata', 'nanica'],
        'maca'         => ['maçã'],
        'maçã'         => ['maçã'],
        'bebida'       => ['café', 'chá', 'suco', 'refrigerante', 'água', 'cerveja', 'vinho'],
        'cafe'         => ['café', 'coado', 'expresso'],
        'café'         => ['café', 'coado', 'expresso'],
        'suco'         => ['suco', 'laranja', 'maracujá'],
        'refrigerante' => ['refrigerante', 'cola', 'guaraná'],
        'alcool'       => ['cerveja', 'vinho'],
        'álcool'       => ['cerveja', 'vinho'],
        'doce'         => ['açúcar', 'mel', 'chocolate', 'goiabada', 'geleia', 'doce de leite'],
        'acucar'       => ['açúcar', 'cristal', 'mascavo', 'mel'],
        'açúcar'       => ['açúcar', 'cristal', 'mascavo', 'mel'],
        'chocolate'    => ['chocolate', 'ao leite', 'meio amargo'],
        'gordura'      => ['azeite', 'óleo', 'manteiga', 'margarina', 'banha'],
        'oleo'         => ['óleo', 'soja', 'girassol', 'canola', 'coco'],
        'óleo'         => ['óleo', 'soja', 'girassol', 'canola', 'coco'],
        'azeite'       => ['azeite', 'oliva'],
        'prato'        => ['feijoada', 'estrogonofe', 'lasanha', 'pizza', 'coxinha', 'cachorro-quente', 'baião'],
        'comida'       => ['feijoada', 'estrogonofe', 'lasanha', 'pizza'],
        'lanche'       => ['coxinha', 'pão de queijo', 'cachorro-quente', 'hambúrguer'],
        'fast food'    => ['pizza', 'hambúrguer', 'coxinha', 'cachorro-quente'],
    ];

    return $mapa[$termo] ?? [$termo];
}