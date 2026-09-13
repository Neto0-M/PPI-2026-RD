<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/functions.php';

header('Access-Control-Allow-Origin: ' . ($_SERVER['HTTP_ORIGIN'] ?? '*'));
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json(['erro' => 'Método inválido'], 405);
}

$in    = body();
$texto = trim((string) ($in['texto'] ?? ''));

if ($texto === '') {
    json(['erro' => 'Texto vazio'], 400);
}

// ==========================================
// EXTRAI TERMOS RELEVANTES
// ==========================================

function extrairTermos(string $texto): array {
    $texto = mb_strtolower($texto, 'UTF-8');
    $texto = preg_replace('/[^\p{L}\p{N}\s]/u', ' ', $texto);

    $palavras = preg_split('/\s+/', $texto, -1, PREG_SPLIT_NO_EMPTY);

    $stopwords = [
        'ingredientes', 'informacao', 'informação', 'nutricional',
        'porcao', 'porção', 'valor', 'energetico', 'energético',
        'carboidratos', 'proteinas', 'proteínas', 'gorduras',
        'saturadas', 'trans', 'fibra', 'fibras', 'sodio', 'sódio',
        'acucares', 'açúcares', 'total', 'kcal', 'kj', 'mg',
        'sem', 'com', 'de', 'da', 'do', 'das', 'dos', 'e', 'ou',
        'nao', 'não', 'na', 'no', 'nas', 'nos', 'para', 'por',
        'valores', 'diarios', 'diários', 'referencia', 'referência',
        'percentual', 'dieta', 'baseada', '2000',
        'alimentos', 'contem', 'contém', 'produto', 'fabricado',
        'industria', 'indústria', 'brasileira', 'ltda', 'sa',
        'cnpj', 'rua', 'avenida', 'cep', 'telefone', 'sac',
        'peso', 'liquido', 'líquido', 'gramas', 'unidade',
        'sabor', 'tipo', 'marca', 'original', 'light', 'diet',
    ];

    $palavras = array_filter($palavras, function ($p) use ($stopwords) {
        return mb_strlen($p) >= 3 && !in_array($p, $stopwords, true);
    });

    $freq = array_count_values($palavras);
    arsort($freq);

    return array_slice(array_keys($freq), 0, 5);
}

$termos = extrairTermos($texto);

if (empty($termos)) {
    json([
        'erro' => 'Não foi possível extrair termos do texto',
        'texto_original' => mb_substr($texto, 0, 200),
    ], 400);
}

// ==========================================
// BUSCA PRODUTOS
// ==========================================

$resultados = [];

foreach ($termos as $termo) {
    $stmt = $pdo->prepare(
        "SELECT " . CAMPOS . " FROM alimentos
         WHERE nome LIKE ?
         LIMIT 5"
    );
    $stmt->execute(['%' . addcslashes($termo, '%_') . '%']);

    foreach ($stmt->fetchAll() as $produto) {
        $resultados[$produto['id']] = $produto;
    }
}

// Fallback: API externa
if (empty($resultados)) {
    foreach ($termos as $termo) {
        try {
            foreach (buscarAPI($termo) as $item) {
                try {
                    $id = salvarAlimento($pdo, $item);
                    if ($id) {
                        $item['id'] = $id;
                        $resultados[$id] = $item;
                    }
                } catch (PDOException $e) {
                    error_log($e->getMessage());
                }
            }
        } catch (Throwable $e) {
            error_log($e->getMessage());
        }
    }
}

$resultados = comPontuacao(array_values($resultados));

json([
    'termos'     => $termos,
    'resultados' => $resultados,
]);