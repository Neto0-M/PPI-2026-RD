# 🥗 PALADAR

**Plataforma Automatizada de Leitura e Análise De Alimentos e Rótulos**

Sistema web que auxilia consumidores a escolherem alimentos mais saudáveis e economicamente viáveis, através da leitura de rótulos, análise nutricional e sugestão de alternativas melhores.

---

## 📖 Sobre o Projeto

O PALADAR nasceu da necessidade de combater o **déficit de letramento alimentar** no Brasil. A complexidade dos rótulos nutricionais e a assimetria informativa no varejo dificultam escolhas conscientes, contribuindo para o aumento de Doenças Crônicas Não Transmissíveis (DCNTs) como obesidade, hipertensão e diabetes.

A plataforma traduz **tabelas nutricionais complexas** em informações visuais simples e acessíveis, alinhadas às novas diretrizes da **ANVISA** (RDC 429/2020), devolvendo ao consumidor a autonomia sobre suas escolhas alimentares.

### 🎯 Objetivos

- **Decodificar** rótulos nutricionais de forma automática
- **Comparar** produtos por perfil nutricional e preço
- **Recomendar** alternativas mais saudáveis e econômicas
- **Promover** o letramento alimentar e o autocuidado

---

## 🌍 Alinhamento com a Agenda 2030

O projeto cumpre **duas metas dos Objetivos de Desenvolvimento Sustentável (ODS)** das Nações Unidas:

| ODS | Meta | Como o PALADAR contribui |
|-----|------|--------------------------|
| **ODS 3** — Saúde e Bem-Estar | Meta 3.4: reduzir mortalidade por DCNTs | Promove prevenção via escolhas alimentares conscientes |
| **ODS 9** — Indústria, Inovação e Infraestrutura | Meta 9.5: fortalecer inovação tecnológica | Desenvolve tecnologia social de acesso à informação nutricional |

---

## 🚀 Funcionalidades

### 🔍 Busca inteligente
- Busca por nome, marca ou categoria
- **Sinônimos automáticos**: "carne" encontra picanha, alcatra, coxão...
- Cache de buscas para resultados instantâneos
- Fallback para API Open Food Facts quando não encontra localmente

### 📷 OCR — Leitura de rótulos
- Captura por **câmera** ou **arquivo de imagem**
- Processamento com **Tesseract.js** (roda no navegador)
- Pré-processamento de imagem (cinza + contraste + binarização)
- Extração automática de termos relevantes (ignora stopwords)
- Fallback para busca manual se a leitura falhar

### 📊 Análise nutricional
- **Pontuação de saudabilidade** (0–100) baseada em:
  - Proteínas (+)
  - Fibras (+)
  - Açúcares (–)
  - Gorduras (–)
  - Calorias (–)
- Classificação visual: 🟢 Saudável · 🟡 Moderado · 🔴 Pouco saudável
- Gráfico de macronutrientes por 100g

### ⚖️ Comparador de produtos
- Seleção de até 2 produtos lado a lado
- Destaque automático do **melhor valor** em cada nutriente
- Veredito final com o produto vencedor

### 🔄 Alternativas melhores
- Sugestão de produtos similares com melhor perfil nutricional
- Filtro por categoria, nome e pontuação
- Ordenação por score final (60% saudabilidade + 40% preço)

### 🏆 Ranking de produtos
- **Ranking pessoal**: produtos mais pesquisados por você
- **Ranking global**: alimentos mais pesquisados por todos os usuários
- **Pódio visual** com 1º, 2º e 3º lugar
- Abas por categoria de alimento

### 👤 Área do usuário
- Cadastro e login com sessão segura
- **Histórico** de pesquisas com botão "Limpar tudo"
- **Favoritos** com toggle de adicionar/remover
- Rate limiting contra brute force no login

### 📱 Design responsivo
- Layout adaptado para **celular**
- Paleta de cores personalizada
- Ícones SVG (sem dependência de emojis)
- Acessibilidade básica (aria-labels, roles)

---

## 🛠️ Stack Tecnológica

### Frontend
| Tecnologia | Uso |
|------------|-----|
| **HTML5** | Estrutura semântica |
| **CSS3** | Layout responsivo (grid + flexbox) |
| **JavaScript (ES6+)** | Lógica de interação, sem frameworks |
| **Tesseract.js** | OCR executado no navegador |
| **Canvas API** | Pré-processamento de imagem |
| **Fetch API** | Comunicação com backend |

### Backend
| Tecnologia | Uso |
|------------|-----|
| **PHP 8+** | API REST e regras de negócio |
| **PDO** | Acesso ao banco (prepared statements) |
| **Sessões PHP** | Autenticação |
| **cURL** | Integração com API externa |

### Banco de Dados
| Tecnologia | Uso |
|------------|-----|
| **MySQL 5.7+ / MariaDB 10.4+** | Armazenamento |
| **FULLTEXT** | Busca textual otimizada |
| **Views** | Ranking pré-calculado |

### APIs Externas
| API | Uso |
|-----|-----|
| **Open Food Facts** | Base complementar de produtos |
| **Tesseract.js** (CDN) | Motor de OCR |

---

## 📁 Estrutura do Projeto
