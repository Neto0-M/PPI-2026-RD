// ==========================================
// CONFIG
// ==========================================

const API = {
    buscar: "app/api.php?acao=buscar",
    comparar: "app/api.php?acao=comparar",
    alternativas: "app/api.php?acao=alternativas",
    cadastro: "app/cadastro.php",
    login: "app/login.php",
    logout: "app/logout.php",
    sessao: "app/sessao.php",
    historico: "app/historico.php",
    favoritos: "app/favoritos.php",
    ranking: "app/ranking.php",
    ocr: "app/ocr.php",
};

const $ = (id) => document.getElementById(id);

const state = {
    csrf: null,
    user: null,
    abort: null,
    favs: new Set(),
    produtos: [],
    filtro: "todos",
    ordem: "padrao",
    comparar: [],
};

let cardExpandido = null;
let rankingCompleto = [];
let rankingTipo = "pessoal";
let stream = null;


// ==========================================
// HELPERS
// ==========================================

async function api(url, opts = {}) {
    const headers = { ...(opts.headers || {}) };

    if (opts.body && typeof opts.body === "object") {
        headers["Content-Type"] = "application/json";
        opts.body = JSON.stringify(opts.body);
    }

    if (state.csrf && opts.method && opts.method !== "GET") {
        headers["X-CSRF-Token"] = state.csrf;
    }

    const res = await fetch(url, { ...opts, headers, credentials: "include" });

    let data = null;
    try { data = await res.json(); } catch { }

    if (!res.ok) {
        throw new Error(data?.mensagem || data?.erro || `Erro ${res.status}`);
    }
    return data;
}

const abrir = (id) => $(id)?.classList.add("aberto");
const fechar = (id) => $(id)?.classList.remove("aberto");

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function escapeHtml(s) {
    return String(s ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

const ICONE_CORACAO = (preenchido) => `
    <svg viewBox="0 0 24 24" fill="${preenchido ? "currentColor" : "none"}"
         stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
`;

const ICONE_COMPARAR = (ativo) => `
    <svg viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="7" height="18" rx="1"/>
        <rect x="14" y="3" width="7" height="18" rx="1"/>
    </svg>
`;


// ==========================================
// INJEÇÃO DINÂMICA
// ==========================================

function injetarFiltros() {
    if ($("filtrosResultados")) return;

    const section = document.querySelector(".resultados-section");
    const grid = $("resultados");
    if (!section || !grid) return;

    const div = el("div", "filtros-resultados");
    div.id = "filtrosResultados";
    div.style.display = "none";
    div.innerHTML = `
        <button class="btn-voltar" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"/>
            </svg>
            Nova busca
        </button>
        <span class="filtros-titulo">Filtrar:</span>
        <button data-filtro="todos" class="ativo">Todos</button>
        <button data-filtro="saudavel">Saudáveis</button>
        <button data-filtro="moderado">Moderados</button>
        <button data-filtro="pouco">Pouco saudáveis</button>
        <select id="ordenarPor" class="ordenar-select">
            <option value="padrao">Ordenar: padrão</option>
            <option value="pontuacao">Mais saudável</option>
            <option value="preco">Mais barato</option>
            <option value="nome">Nome (A–Z)</option>
        </select>
    `;

    section.insertBefore(div, grid);
}

function injetarBotaoManual() {
    const acoes = document.querySelector(".acoes-imagem");
    if (!acoes || acoes.querySelector(".btn-manual")) return;

    const btn = el("button", "btn-manual", "Digitar nome do produto");
    btn.dataset.processarManual = "";
    acoes.after(btn);
}


// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    injetarFiltros();
    injetarBotaoManual();
    bindEventos();
    bindAbasTipoRanking();
    verificarSessao();
});

function bindEventos() {
    $("btnBuscar")?.addEventListener("click", buscar);
    $("campoBusca")?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); buscar(); }
    });

    document.querySelectorAll(".categorias-lista button").forEach((b) => {
        b.addEventListener("click", () => {
            document.querySelectorAll(".categorias-lista button")
                .forEach((x) => x.classList.remove("ativo"));
            b.classList.add("ativo");

            const cat = b.dataset.categoria;
            if (!cat) return;
            $("campoBusca").value = cat;
            buscar();
        });
    });

    document.querySelectorAll("[data-filtro]").forEach((b) => {
        b.addEventListener("click", () => {
            document.querySelectorAll("[data-filtro]")
                .forEach((x) => x.classList.remove("ativo"));
            b.classList.add("ativo");
            state.filtro = b.dataset.filtro;
            renderizarResultados();
        });
    });

    $("ordenarPor")?.addEventListener("change", (e) => {
        state.ordem = e.target.value;
        renderizarResultados();
    });

    $("btnLogin")?.addEventListener("click", () => abrir("area-login"));
    $("btnLogout")?.addEventListener("click", logout);

    document.querySelectorAll("[data-fechar-login]").forEach((b) =>
        b.addEventListener("click", () => fechar("area-login")));

    $("linkCadastro")?.addEventListener("click", (e) => {
        e.preventDefault();
        $("formLogin").style.display = "none";
        $("formCadastro").style.display = "flex";
        $("titulo-login").textContent = "Criar conta";
    });

    $("linkLogin")?.addEventListener("click", (e) => {
        e.preventDefault();
        $("formCadastro").style.display = "none";
        $("formLogin").style.display = "flex";
        $("titulo-login").textContent = "Entrar no PALADAR";
    });

    $("formLogin")?.addEventListener("submit", (e) => { e.preventDefault(); login(); });
    $("formCadastro")?.addEventListener("submit", (e) => { e.preventDefault(); cadastro(); });

    abrirComLogin("linkRanking", "modalRanking", carregarRanking);
    abrirComLogin("linkHistorico", "modalHistorico", carregarHistorico);
    abrirComLogin("linkFavoritos", "modalFavoritos", carregarFavoritos);

    fecharComClique("data-fechar-ranking", "modalRanking");
    fecharComClique("data-fechar-historico", "modalHistorico");
    fecharComClique("data-fechar-favoritos", "modalFavoritos");

    $("btnImagem")?.addEventListener("click", abrirModalImagem);
    fecharComClique("data-fechar-modal", "modalImagem");

    document.querySelector("[data-abrir-camera]")?.addEventListener("click", abrirCamera);
    document.querySelector("[data-abrir-arquivo]")?.addEventListener("click", abrirArquivo);
    document.querySelector("[data-capturar-foto]")?.addEventListener("click", capturarFoto);
    document.querySelector("[data-parar-camera]")?.addEventListener("click", pararCamera);
    document.querySelector("[data-processar-imagem]")?.addEventListener("click", processarImagem);
    document.querySelector("[data-cancelar-imagem]")?.addEventListener("click", cancelarImagem);
    document.querySelector("[data-processar-manual]")?.addEventListener("click", () => {
        fecharModalImagem();
        $("campoBusca").focus();
        $("campoBusca").scrollIntoView({ behavior: "smooth", block: "center" });
    });
    $("inputArquivo")?.addEventListener("change", onArquivo);

    document.querySelectorAll(".login-overlay, .modal").forEach((m) => {
        m.addEventListener("click", (e) => {
            if (e.target === m) { m.classList.remove("aberto"); pararCamera(); }
        });
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            document.querySelectorAll(".login-overlay.aberto, .modal.aberto")
                .forEach((m) => m.classList.remove("aberto"));
            pararCamera();
        }
    });

    document.addEventListener("click", (e) => {
        if (e.target.closest(".btn-voltar")) {
            sairModoResultados();
            $("campoBusca").value = "";
            $("resultados").innerHTML = `
                <div class="estado-vazio">
                    <span class="estado-vazio-icone">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
                            <path d="M7 2v20"/>
                            <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
                        </svg>
                    </span>
                    <p>Faça uma busca para encontrar alimentos.</p>
                </div>`;
            $("contadorResultados").textContent = "0 produtos";
            document.querySelectorAll(".categorias-lista button")
                .forEach((x) => x.classList.remove("ativo"));
        }
    });
}

function bindAbasTipoRanking() {
    document.querySelectorAll("[data-tipo]").forEach((btn) => {
        btn.addEventListener("click", () => {
            document.querySelectorAll("[data-tipo]").forEach((b) => b.classList.remove("ativo"));
            btn.classList.add("ativo");
            rankingTipo = btn.dataset.tipo;
            carregarRanking();
        });
    });
}

function abrirComLogin(linkId, modalId, onOpen) {
    $(linkId)?.addEventListener("click", (e) => {
        e.preventDefault();
        if (!state.user) return abrir("area-login");
        abrir(modalId);
        onOpen();
    });
}

function fecharComClique(dataAttr, modalId) {
    document.querySelectorAll(`[${dataAttr}]`).forEach((b) =>
        b.addEventListener("click", () => fechar(modalId)));
}


// ==========================================
// SESSÃO
// ==========================================

async function verificarSessao() {
    try {
        const d = await api(API.sessao);
        if (!d?.logado) return;

        state.user = { id: d.id, nome: d.nome, email: d.email };
        state.csrf = d.csrf_token;

        $("usuarioLogado").textContent = d.nome;
        $("usuarioLogado").style.display = "inline";
        $("btnLogin").style.display = "none";
        $("btnLogout").style.display = "inline";

        carregarRanking();
        carregarHistorico();
        carregarFavoritos();
    } catch { }
}


// ==========================================
// BUSCA
// ==========================================

async function buscar() {
    const termo = $("campoBusca").value.trim();
    if (!termo) return alert("Digite o nome de um produto.");

    if (state.abort) state.abort.abort();
    state.abort = new AbortController();

    $("contadorResultados").textContent = "Carregando...";
    renderizarSkeletonBusca();

    try {
        const url = `${API.buscar}&termo=${encodeURIComponent(termo)}`;
        const produtos = await api(url, { signal: state.abort.signal });
        mostrarResultados(produtos);
    } catch (e) {
        if (e.name === "AbortError") return;
        $("contadorResultados").textContent = "0 produtos";
        $("resultados").innerHTML = `
            <div class="estado-vazio">
                <p>Não foi possível consultar.</p>
                <small>Tente novamente.</small>
            </div>`;
    }
}

function renderizarSkeletonBusca() {
    $("resultados").innerHTML = `
        <div class="cartao-produto skeleton-card">
            <div class="skeleton-linha" style="height:28px;width:60%"></div>
            <div class="skeleton-linha" style="height:20px;width:100%"></div>
            <div class="skeleton-linha" style="height:20px;width:80%"></div>
            <div class="skeleton-linha" style="height:80px;width:100%"></div>
        </div>
        <div class="cartao-produto skeleton-card">
            <div class="skeleton-linha" style="height:28px;width:70%"></div>
            <div class="skeleton-linha" style="height:20px;width:100%"></div>
            <div class="skeleton-linha" style="height:20px;width:90%"></div>
            <div class="skeleton-linha" style="height:80px;width:100%"></div>
        </div>
    `;
}

function mostrarResultados(produtos) {
    state.produtos = produtos;
    state.filtro = "todos";
    state.ordem = "padrao";

    document.querySelectorAll("[data-filtro]").forEach((b) => {
        b.classList.toggle("ativo", b.dataset.filtro === "todos");
    });

    const select = $("ordenarPor");
    if (select) select.value = "padrao";

    const filtros = $("filtrosResultados");
    if (filtros) filtros.style.display = produtos.length ? "flex" : "none";

    renderizarResultados();

    if (produtos.length > 0) {
        focarResultados();
    }
}

function renderizarResultados() {
    let produtos = state.produtos.filter((p) =>
        state.filtro === "todos" || p.classificacao === state.filtro
    );

    if (state.ordem === "pontuacao") {
        produtos = [...produtos].sort((a, b) => (b.pontuacao ?? 0) - (a.pontuacao ?? 0));
    } else if (state.ordem === "preco") {
        produtos = [...produtos].sort((a, b) => {
            const pa = a.preco != null ? parseFloat(a.preco) : Infinity;
            const pb = b.preco != null ? parseFloat(b.preco) : Infinity;
            return pa - pb;
        });
    } else if (state.ordem === "nome") {
        produtos = [...produtos].sort((a, b) =>
            (a.nome || "").localeCompare(b.nome || "", "pt-BR")
        );
    }

    $("contadorResultados").textContent =
        `${produtos.length} ${produtos.length === 1 ? "produto" : "produtos"}`;

    const grid = $("resultados");
    grid.innerHTML = "";
    cardExpandido = null;

    if (!produtos.length) {
        grid.innerHTML = `
            <div class="estado-vazio">
                <p>Nenhum produto encontrado com esse filtro.</p>
            </div>`;
        return;
    }

    produtos.forEach((p) => grid.appendChild(criarCard(p)));
}

function focarResultados() {
    document.body.classList.add("modo-resultados");
    const alvo = document.querySelector(".resultados-section");
    if (alvo) alvo.scrollIntoView({ behavior: "smooth", block: "start" });
}

function sairModoResultados() {
    document.body.classList.remove("modo-resultados");
    window.scrollTo({ top: 0, behavior: "smooth" });
}


// ==========================================
// CARD
// ==========================================

function criarCard(p) {
    const card = el("article", "cartao-produto");
    card.dataset.id = p.id;

    if (typeof p.pontuacao === "number") {
        card.appendChild(criarBadge(p.pontuacao, p.classificacao));
    }

    card.appendChild(el("h3", null, p.nome || "Sem nome"));

    const nutrientes = [
        ["Calorias", p.calorias !== null && p.calorias !== undefined ? `${p.calorias} kcal` : "—"],
        ["Proteínas", p.proteinas !== null && p.proteinas !== undefined ? `${p.proteinas} g` : "—"],
        ["Carboidratos", p.carboidratos !== null && p.carboidratos !== undefined ? `${p.carboidratos} g` : "—"],
        ["Gorduras", p.gorduras !== null && p.gorduras !== undefined ? `${p.gorduras} g` : "—"],
        ["Fibras", p.fibras !== null && p.fibras !== undefined ? `${p.fibras} g` : "—"],
    ];

    nutrientes.forEach(([label, valor]) => {
        const info = el("p", "nutri-info");
        info.innerHTML = `<span>${label}</span><strong>${valor}</strong>`;
        card.appendChild(info);
    });

    card.appendChild(criarGraficoMacros(p));

    if (p.preco !== null && p.preco !== undefined && p.preco !== "") {
        const preco = el("p", "preco-produto");
        preco.innerHTML = `Preço <strong>R$ ${parseFloat(p.preco).toFixed(2).replace(".", ",")}</strong>`;
        card.appendChild(preco);
    }

    if (p.codigo_barras) {
        card.appendChild(el("small", null, `Código: ${p.codigo_barras}`));
    }

    if (state.user) {
        card.appendChild(criarAcoes(p));
        salvarHistorico(p.id).catch(() => { });
    }

    card.addEventListener("click", (e) => {
        if (e.target.closest("button")) return;
        alternarExpandido(card, p);
    });

    return card;
}

function criarBadge(pts, cls) {
    const mapa = {
        saudavel: "Saudável",
        moderado: "Moderado",
        pouco: "Pouco saudável",
    };
    const texto = mapa[cls] || mapa.pouco;

    const badge = el("div", `pontuacao ${cls}`);
    badge.title = "Baseado em: proteínas (+), fibras (+), açúcares (–), gorduras (–), calorias (–).";
    badge.innerHTML = `
        <span>${texto} · ${pts}/100</span>
        <span class="barra"><span style="width:${pts}%"></span></span>
    `;
    return badge;
}

function criarGraficoMacros(p) {
    const macros = [
        { nome: "Proteínas", valor: parseFloat(p.proteinas) || 0, classe: "proteinas" },
        { nome: "Carboidratos", valor: parseFloat(p.carboidratos) || 0, classe: "carboidratos" },
        { nome: "Gorduras", valor: parseFloat(p.gorduras) || 0, classe: "gorduras" },
        { nome: "Fibras", valor: parseFloat(p.fibras) || 0, classe: "fibras" },
    ];

    const max = Math.max(...macros.map((m) => m.valor), 1);

    const div = el("div", "grafico-macros");
    div.appendChild(el("h4", null, "Composição por 100g"));

    const container = el("div", "grafico-barras");

    macros.forEach((m) => {
        const barra = el("div", `grafico-barra ${m.classe}`);
        barra.appendChild(el("span", "label", m.nome));

        const track = el("div", "track");
        const fill = el("div", "fill");
        fill.style.width = `${(m.valor / max) * 100}%`;
        track.appendChild(fill);
        barra.appendChild(track);

        barra.appendChild(el("span", "valor", `${m.valor.toFixed(1)}g`));
        container.appendChild(barra);
    });

    div.appendChild(container);
    return div;
}

function criarAcoes(p) {
    const acoes = el("div", "cartao-acoes");

    // Botão favoritar
    const btnFav = el("button");
    const fav = state.favs.has(p.id);
    btnFav.innerHTML = `${ICONE_CORACAO(fav)} ${fav ? "Favoritado" : "Favoritar"}`;
    if (fav) btnFav.classList.add("favoritado");
    btnFav.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFav(p.id, btnFav);
    });
    acoes.appendChild(btnFav);

    // Botão comparar
    const btnComp = el("button", "btn-comparar");
    const selecionado = state.comparar.includes(p.id);
    btnComp.innerHTML = `${ICONE_COMPARAR(selecionado)} ${selecionado ? "Selecionado" : "Comparar"}`;
    if (selecionado) btnComp.classList.add("ativo");
    btnComp.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleComparar(p.id, btnComp);
    });
    acoes.appendChild(btnComp);

    return acoes;
}


// ==========================================
// EXPANDIR CARD
// ==========================================

async function alternarExpandido(card, produto) {
    const grid = $("resultados");

    if (cardExpandido === card) {
        card.classList.remove("expandido");

        if (card.dataset.posicaoOriginal !== undefined) {
            const ref = grid.children[parseInt(card.dataset.posicaoOriginal)];
            if (ref && ref !== card) {
                grid.insertBefore(card, ref);
            } else {
                grid.appendChild(card);
            }
        }

        card.querySelector(".card-alternativas")?.remove();
        cardExpandido = null;

        card.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
    }

    if (cardExpandido) {
        cardExpandido.classList.remove("expandido");
        cardExpandido.querySelector(".card-alternativas")?.remove();
    }

    if (card.dataset.posicaoOriginal === undefined) {
        card.dataset.posicaoOriginal = [...grid.children].indexOf(card);
    }

    grid.insertBefore(card, grid.firstChild);

    card.classList.add("expandido");
    cardExpandido = card;

    const coluna = el("div", "card-alternativas");
    coluna.innerHTML = `
        <h4>Alternativas melhores</h4>
        <div class="alternativas-lista">
            <div class="skeleton-linha"></div>
            <div class="skeleton-linha"></div>
        </div>
    `;
    card.appendChild(coluna);

    setTimeout(() => {
        card.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);

    if (!produto.id) {
        coluna.querySelector(".alternativas-lista").innerHTML =
            `<p class="alternativas-vazio">Produto sem ID.</p>`;
        return;
    }

    try {
        const dados = await api(`${API.alternativas}&id=${produto.id}`);
        const lista = coluna.querySelector(".alternativas-lista");
        lista.innerHTML = "";

        if (!dados?.alternativas?.length) {
            lista.innerHTML = `<p class="alternativas-vazio">Nenhuma alternativa encontrada.</p>`;
            return;
        }

        dados.alternativas.slice(0, 6).forEach((alt) => {
            const item = el("div", "alternativa-item");

            const badge = el("span", `badge-mini ${alt.classificacao || "moderado"}`);
            badge.textContent = alt.pontuacao;
            item.appendChild(badge);

            const info = el("div", "alternativa-info");
            info.appendChild(el("div", "alternativa-nome", alt.nome || "Sem nome"));

            if (alt.preco !== null && alt.preco !== undefined && alt.preco !== "") {
                info.appendChild(el("div", "alternativa-preco",
                    `R$ ${parseFloat(alt.preco).toFixed(2).replace(".", ",")}`));
            }
            item.appendChild(info);

            item.appendChild(el("span", "alternativa-score",
                `${alt.score_final ?? alt.pontuacao} pts`));

            lista.appendChild(item);
        });

    } catch (e) {
        coluna.querySelector(".alternativas-lista").innerHTML =
            `<p class="alternativas-vazio">Erro: ${e.message}</p>`;
    }
}


// ==========================================
// COMPARADOR
// ==========================================

function toggleComparar(id, botao) {
    if (state.comparar.includes(id)) {
        state.comparar = state.comparar.filter((x) => x !== id);
        botao.classList.remove("ativo");
        botao.innerHTML = `${ICONE_COMPARAR(false)} Comparar`;
    } else {
        if (state.comparar.length >= 2) {
            alert("Você só pode comparar 2 produtos por vez. Desmarque um primeiro.");
            return;
        }
        state.comparar.push(id);
        botao.classList.add("ativo");
        botao.innerHTML = `${ICONE_COMPARAR(true)} Selecionado`;
    }
    atualizarBarraComparar();
}

function atualizarBarraComparar() {
    let barra = document.querySelector(".barra-comparar");

    if (state.comparar.length === 0) {
        barra?.remove();
        return;
    }

    if (!barra) {
        barra = el("div", "barra-comparar");
        document.body.appendChild(barra);
    }

    barra.innerHTML = `
        <span>${state.comparar.length} de 2 selecionados</span>
        ${state.comparar.length === 2
            ? `<button class="btn-comparar-agora">Comparar agora</button>`
            : `<span class="dica">Selecione mais 1 produto</span>`}
        <button class="btn-limpar-comparar">Limpar</button>
    `;

    barra.querySelector(".btn-comparar-agora")?.addEventListener("click", abrirComparacao);
    barra.querySelector(".btn-limpar-comparar").addEventListener("click", limparComparacao);
}

function limparComparacao() {
    state.comparar = [];
    document.querySelectorAll(".btn-comparar.ativo").forEach((b) => {
        b.classList.remove("ativo");
        b.innerHTML = `${ICONE_COMPARAR(false)} Comparar`;
    });
    atualizarBarraComparar();
}

async function abrirComparacao() {
    if (state.comparar.length !== 2) return;

    const ids = state.comparar.join(",");
    const dados = await api(`${API.comparar}&ids=${ids}`);

    if (!dados?.length) return;

    mostrarModalComparacao(dados);
}

function mostrarModalComparacao(produtos) {
    document.querySelector(".modal-comparacao")?.remove();

    const modal = el("div", "modal-comparacao");
    const a = produtos[0];
    const b = produtos[1];

    const linha = (label, va, vb, unidade = "", menorMelhor = true) => {
        const na = va !== null && va !== undefined ? parseFloat(va) : null;
        const nb = vb !== null && vb !== undefined ? parseFloat(vb) : null;
        let classeA = "", classeB = "";

        if (na !== null && nb !== null && na !== nb) {
            const aMelhor = menorMelhor ? na < nb : na > nb;
            classeA = aMelhor ? "melhor" : "pior";
            classeB = aMelhor ? "pior" : "melhor";
        }

        return `
            <div class="comp-linha">
                <span class="comp-label">${label}</span>
                <span class="comp-valor ${classeA}">${va ?? "—"}${va !== null && va !== undefined ? unidade : ""}</span>
                <span class="comp-valor ${classeB}">${vb ?? "—"}${vb !== null && vb !== undefined ? unidade : ""}</span>
            </div>
        `;
    };

    modal.innerHTML = `
        <div class="modal-comparacao-conteudo">
            <button class="modal-comparacao-fechar">×</button>

            <h2>Comparação</h2>
            <p class="comp-sub">Analise os dois produtos lado a lado.</p>

            <div class="comp-header">
                <div class="comp-card">
                    <div class="comp-emoji">🥗</div>
                    <h3>${escapeHtml(a.nome)}</h3>
                    ${a.categoria ? `<small>${escapeHtml(a.categoria)}</small>` : ""}
                    ${a.pontuacao ? `
                        <div class="comp-pontuacao ${a.classificacao}">
                            ${a.pontuacao}/100 · ${a.classificacao}
                        </div>
                    ` : ""}
                </div>
                <div class="comp-vs">VS</div>
                <div class="comp-card">
                    <div class="comp-emoji">🥗</div>
                    <h3>${escapeHtml(b.nome)}</h3>
                    ${b.categoria ? `<small>${escapeHtml(b.categoria)}</small>` : ""}
                    ${b.pontuacao ? `
                        <div class="comp-pontuacao ${b.classificacao}">
                            ${b.pontuacao}/100 · ${b.classificacao}
                        </div>
                    ` : ""}
                </div>
            </div>

            <div class="comp-tabela">
                ${linha("Calorias", a.calorias, b.calorias, " kcal", true)}
                ${linha("Proteínas", a.proteinas, b.proteinas, " g", false)}
                ${linha("Carboidratos", a.carboidratos, b.carboidratos, " g", false)}
                ${linha("Gorduras", a.gorduras, b.gorduras, " g", true)}
                ${linha("Fibras", a.fibras, b.fibras, " g", false)}
                ${linha("Açúcares", a.acucares, b.acucares, " g", true)}
                ${a.preco || b.preco ? `
                    <div class="comp-linha comp-preco">
                        <span class="comp-label">Preço</span>
                        <span class="comp-valor">${a.preco ? `R$ ${parseFloat(a.preco).toFixed(2).replace(".", ",")}` : "—"}</span>
                        <span class="comp-valor">${b.preco ? `R$ ${parseFloat(b.preco).toFixed(2).replace(".", ",")}` : "—"}</span>
                    </div>
                ` : ""}
            </div>

            <div class="comp-vencedor">
                ${calcularVencedor(a, b)}
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector(".modal-comparacao-fechar").addEventListener("click", () => {
        modal.remove();
    });

    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.remove();
    });
}

function calcularVencedor(a, b) {
    const pa = a.pontuacao ?? 0;
    const pb = b.pontuacao ?? 0;

    if (pa > pb) return `<strong>${escapeHtml(a.nome)}</strong> tem melhor perfil nutricional (${pa} vs ${pb}).`;
    if (pb > pa) return `<strong>${escapeHtml(b.nome)}</strong> tem melhor perfil nutricional (${pb} vs ${pa}).`;
    return "Empate técnico — os dois têm pontuações próximas.";
}


// ==========================================
// HISTÓRICO
// ==========================================

async function salvarHistorico(id) {
    if (!state.user) return;
    await api(API.historico, { method: "POST", body: { alimento_id: id } });
    carregarHistorico();
    carregarRanking();
}

async function carregarHistorico() {
    if (!state.user) return;

    const lista = $("historico-modal-lista");
    if (!lista) return;

    try {
        const dados = await api(API.historico);

        if (!dados.length) {
            lista.innerHTML = "<p>Nenhuma pesquisa recente.</p>";
            return;
        }

        lista.innerHTML = "";

        // Botão "Limpar tudo" no topo
        const header = el("div", "lista-header");
        header.innerHTML = `
            <span>${dados.length} ${dados.length === 1 ? "item" : "itens"}</span>
            <button class="btn-limpar-historico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    <line x1="10" y1="11" x2="10" y2="17"/>
                    <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
                Limpar tudo
            </button>
        `;
        lista.appendChild(header);

        header.querySelector(".btn-limpar-historico").addEventListener("click", limparHistorico);

        // Itens
        dados.forEach((h) =>
            lista.appendChild(itemLista(h.nome, () => deletarHistorico(h.id))));

    } catch { }
}

async function limparHistorico() {
    if (!confirm("Tem certeza que quer apagar todo o histórico?")) return;

    try {
        await api(API.historico, {
            method: "DELETE",
            body: { acao: "limpar_tudo" },
        });
        carregarHistorico();
        carregarRanking();
    } catch (e) {
        alert("Erro ao limpar histórico: " + e.message);
    }
}


// ==========================================
// FAVORITOS
// ==========================================

async function carregarFavoritos() {
    if (!state.user) return;
    const lista = $("favoritos-modal-lista");
    if (!lista) return;

    try {
        const dados = await api(API.favoritos);
        state.favs = new Set(dados.map((f) => f.id));

        if (!dados.length) {
            lista.innerHTML = "<p>Seus alimentos favoritos aparecerão aqui.</p>";
            return;
        }
        lista.innerHTML = "";
        dados.forEach((f) =>
            lista.appendChild(itemLista(f.nome, () => toggleFav(f.id))));
    } catch { }
}

async function toggleFav(id, botao) {
    if (!state.user) return abrir("area-login");

    const acao = state.favs.has(id) ? "remover" : "adicionar";
    await api(API.favoritos, { method: "POST", body: { alimento_id: id, acao } });

    if (acao === "remover") state.favs.delete(id);
    else state.favs.add(id);

    if (botao) {
        const fav = state.favs.has(id);
        botao.innerHTML = `${ICONE_CORACAO(fav)} ${fav ? "Favoritado" : "Favoritar"}`;
        botao.classList.toggle("favoritado", fav);
    }
    carregarFavoritos();
}


// ==========================================
// RANKING (PÓDIO)
// ==========================================

async function carregarRanking() {
    const podio = $("rankingPodio");
    const rodape = $("rankingRodape");
    if (!podio) return;

    if (rankingTipo === "pessoal" && !state.user) {
        podio.innerHTML = `<p class="modal-ranking-vazio">Faça login para ver seu ranking pessoal.</p>`;
        if (rodape) rodape.innerHTML = "";
        return;
    }

    podio.innerHTML = `<p class="modal-ranking-vazio">Carregando...</p>`;

    try {
        const dados = await api(`${API.ranking}?tipo=${rankingTipo}`);

        if (!dados.length) {
            podio.innerHTML = `<p class="modal-ranking-vazio">
                ${rankingTipo === "pessoal"
                    ? "Você ainda não pesquisou nenhum produto."
                    : "Nenhum produto foi pesquisado ainda."}
            </p>`;
            if (rodape) rodape.innerHTML = "";
            return;
        }

        rankingCompleto = dados;
        atualizarAbasRanking(dados);
        renderizarPodio(dados.slice(0, 3));
        renderizarRodapeRanking(dados);

    } catch (e) {
        podio.innerHTML = `<p class="modal-ranking-vazio">Erro ao carregar ranking.</p>`;
    }
}

// ==========================================
// NORMALIZAÇÃO DE CATEGORIAS
// ==========================================

const GRUPOS_CATEGORIA = {
    "Verduras e Hortaliças": [
        "verdura", "verduras", "vegetal", "vegetais", "legume", "legumes",
        "hortaliça", "hortaliças", "alface", "rúcula", "couve", "espinafre",
        "brócolis", "couve-flor", "cenoura", "tomate", "pepino", "abóbora",
        "beterraba", "chuchu", "quiabo", "berinjela", "pimentão",
        "feijão", "feijões", "lentilha", "grão-de-bico", "soja",
        "ervilha", "amendoim"
    ],
    "Grãos e Cereais": [
        "cereal", "cereais", "arroz", "trigo", "aveia", "milho", "quinoa",
        "granola", "pão", "pães", "massa", "macarrão", "biscoito", "bolacha",
        "farinha", "grão", "pulsos", "snack", "cracker"
    ],
    "Carnes e Aves": [
        "carne", "bovina", "bovino", "suína", "suíno", "porco", "frango",
        "ave", "aves", "peru", "chester", "picanha", "alcatra", "coxão",
        "patinho", "acém", "costela", "linguiça", "salsicha", "presunto",
        "mortadela", "salame", "bacon", "peito", "coxa", "sobrecoxa",
        "embutido", "embutidos", "nuggets", "hambúrguer", "hamburguer"
    ],
    "Peixes e Frutos do Mar": [
        "peixe", "peixes", "tilápia", "salmão", "sardinha", "atum",
        "merluza", "tambaqui", "pintado", "bacalhau", "camarão",
        "lula", "frutos do mar"
    ],
    "Derivados do Leite": [
        "leite", "leites", "iogurte", "iogurtes", "queijo", "queijos",
        "requeijão", "manteiga", "margarina", "creme", "condensado",
        "lácteo", "lácteos", "uht"
    ],
    "Frutas": [
        "fruta", "frutas", "banana", "maçã", "laranja", "mamão", "manga",
        "abacaxi", "melancia", "melão", "uva", "morango", "kiwi", "pera",
        "goiaba", "maracujá", "limão", "acerola", "caju", "pêssego", "ameixa"
    ],
    "Bebidas": [
        "bebida", "bebidas", "café", "chá", "suco", "refrigerante",
        "água", "cerveja", "vinho", "smoothie", "energético", "isotônico"
    ],
    "Doces e Açúcares": [
        "açúcar", "açucares", "mel", "chocolate", "goiabada", "geleia",
        "doce", "doces", "marmelada", "marmeladas", "sobremesa",
        "gelatina", "sorvete"
    ],
    "Gorduras e Óleos": [
        "azeite", "óleo", "óleos", "gordura", "gorduras", "banha"
    ],
    "Ovos": ["ovo", "ovos", "clara", "gema"],
    "Pratos Prontos": [
        "prato", "pratos", "feijoada", "estrogonofe", "lasanha", "pizza",
        "coxinha", "cachorro-quente", "baião", "congelado", "congelados",
        "pronto", "prontos"
    ]
};

/**
 * Dado um texto de categoria, devolve o grupo amplo.
 * Ex.: "Feijões comuns, Feijões" → "Leguminosas"
 */
function normalizarCategoria(categoria) {
    if (!categoria) return null;

    const texto = categoria.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    for (const [grupo, palavras] of Object.entries(GRUPOS_CATEGORIA)) {
        for (const palavra of palavras) {
            const p = palavra.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if (texto.includes(p)) {
                return grupo;
            }
        }
    }

    return null;
}

// ==========================================
// ABAS DE CATEGORIA (NORMALIZADAS)
// ==========================================

function atualizarAbasRanking(dados) {
    const abas = $("rankingAbas");
    if (!abas) return;

    // Remove abas antigas (mantém só "Geral")
    abas.querySelectorAll("button:not([data-cat='geral'])").forEach((b) => b.remove());

    // Conta frequência dos grupos normalizados
    const contagem = new Map();

    dados.forEach((r) => {
        const grupo = normalizarCategoria(r.categoria);
        if (!grupo) return;
        contagem.set(grupo, (contagem.get(grupo) || 0) + 1);
    });

    // Ordena por frequência (mais produtos primeiro)
    const grupos = [...contagem.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)  // máximo 8 abas
        .map(([nome]) => nome);

    // Cria as abas
    grupos.forEach((cat) => {
        const btn = el("button");
        btn.dataset.cat = cat;
        btn.textContent = cat;
        abas.appendChild(btn);
    });

    // Bind de clique
    abas.querySelectorAll("button[data-cat]").forEach((btn) => {
        btn.onclick = () => {
            abas.querySelectorAll("button").forEach((b) => b.classList.remove("ativo"));
            btn.classList.add("ativo");

            const cat = btn.dataset.cat;
            const filtrados = cat === "geral"
                ? rankingCompleto
                : rankingCompleto.filter((r) => normalizarCategoria(r.categoria) === cat);

            renderizarPodio(filtrados.slice(0, 3));
            renderizarRodapeRanking(filtrados);
        };
    });
}

function renderizarPodio(top3) {
    const podio = $("rankingPodio");
    if (!podio) return;

    if (!top3.length) {
        podio.innerHTML = `<p class="modal-ranking-vazio">Nenhum produto nesta categoria.</p>`;
        return;
    }

    const ordem = [];
    if (top3[1]) ordem.push({ ...top3[1], pos: 2 });
    if (top3[0]) ordem.push({ ...top3[0], pos: 1 });
    if (top3[2]) ordem.push({ ...top3[2], pos: 3 });

    podio.innerHTML = "";

    ordem.forEach((p) => {
        const card = el("div", `podio-card pos-${p.pos}`);

        card.appendChild(el("div", "podio-badge", p.pos));

        const icone = el("div", "podio-produto-icone");
        icone.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
                <path d="M7 2v20"/>
                <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
            </svg>
        `;
        card.appendChild(icone);

        card.appendChild(el("div", "podio-nome", p.nome || "Sem nome"));

        if (p.categoria) {
            card.appendChild(el("div", "podio-categoria", p.categoria));
        }

        card.appendChild(el("div", "podio-score", p.pontuacao ?? 0));
        card.appendChild(el("div", "podio-score-max", "de 100"));

        if (p.preco) {
            card.appendChild(el("div", "podio-preco",
                `R$ ${parseFloat(p.preco).toFixed(2).replace(".", ",")}`));
        }

        card.appendChild(el("div", "podio-base"));
        podio.appendChild(card);
    });
}

function renderizarRodapeRanking(dados) {
    const rodape = $("rankingRodape");
    if (!rodape || !dados.length) {
        if (rodape) rodape.innerHTML = "";
        return;
    }

    const primeiro = dados[0];
    rodape.innerHTML = `
        <span><strong>${escapeHtml(primeiro.nome)}</strong> lidera com score ${primeiro.pontuacao}</span>
        <span class="rodape-sep">·</span>
        <span>${dados.length} ${dados.length === 1 ? "produto" : "produtos"} no ranking</span>
    `;
}


// ==========================================
// ITEM DE LISTA
// ==========================================

function itemLista(texto, onRemover) {
    const div = el("div", "lista-item");
    div.appendChild(el("span", null, texto));

    const btn = el("button", null, "×");
    btn.title = "Remover";
    btn.addEventListener("click", onRemover);
    div.appendChild(btn);

    return div;
}


// ==========================================
// LOGIN / CADASTRO / LOGOUT
// ==========================================

async function login() {
    const email = $("loginEmail").value.trim();
    const senha = $("loginSenha").value;
    if (!email || !senha) return alert("Preencha e-mail e senha.");

    try {
        await api(API.login, { method: "POST", body: { email, senha } });
        fechar("area-login");
        await verificarSessao();
    } catch (e) { alert(e.message); }
}

async function cadastro() {
    const nome = $("cadastroNome").value.trim();
    const email = $("cadastroEmail").value.trim();
    const senha = $("cadastroSenha").value;
    if (!nome || !email || !senha) return alert("Preencha todos os campos.");

    try {
        await api(API.cadastro, { method: "POST", body: { nome, email, senha } });
        fechar("area-login");
        await verificarSessao();
    } catch (e) { alert(e.message); }
}

async function logout() {
    await api(API.logout, { method: "POST" });
    location.reload();
}


// ==========================================
// IMAGEM
// ==========================================

function abrirModalImagem() {
    abrir("modalImagem");
    resetModal();
}

function fecharModalImagem() {
    fechar("modalImagem");
    cancelarImagem();
}

function resetModal() {
    $("modal-opcoes").style.display = "";
    $("camera-acoes").style.display = "none";
    $("preview-area").style.display = "none";
    $("videoCamera").style.display = "none";
    $("preview-imagem").src = "";
    $("inputArquivo").value = "";
}

function abrirArquivo() { $("inputArquivo")?.click(); }

function onArquivo(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Selecione uma imagem.");
        e.target.value = "";
        return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => preview(ev.target.result);
    reader.readAsDataURL(file);
}

function preview(src) {
    $("modal-opcoes").style.display = "none";
    $("preview-area").style.display = "block";
    $("preview-imagem").src = src;
}

function cancelarImagem() {
    resetModal();
    pararCamera();
}

async function abrirCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
        alert("Câmera não suportada.");
        return abrirArquivo();
    }
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
        });
        const video = $("videoCamera");
        video.srcObject = stream;
        video.style.display = "block";
        await video.play();
        $("modal-opcoes").style.display = "none";
        $("camera-acoes").style.display = "flex";
    } catch {
        pararCamera();
        alert("Não foi possível acessar a câmera.");
        abrirArquivo();
    }
}

function capturarFoto() {
    const video = $("videoCamera");
    const canvas = $("canvasCamera");
    if (!video.videoWidth) return alert("Câmera não pronta.");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    pararCamera();
    preview(canvas.toDataURL("image/jpeg", 0.9));
}

function pararCamera() {
    if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        stream = null;
    }
    const v = $("videoCamera");
    if (v) { v.srcObject = null; v.style.display = "none"; }
    $("camera-acoes").style.display = "none";
}


// ==========================================
// OCR
// ==========================================

function preProcessarImagem(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            const maxLado = 1600;
            let { width, height } = img;

            if (width > maxLado || height > maxLado) {
                const ratio = Math.min(maxLado / width, maxLado / height);
                width *= ratio;
                height *= ratio;
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                const contrast = 1.4;
                const fator = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));
                const v = Math.max(0, Math.min(255, fator * (gray - 128) + 128));
                data[i] = data[i + 1] = data[i + 2] = v;
            }

            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL("image/jpeg", 0.9));
        };

        img.onerror = () => resolve(src);
        img.src = src;
    });
}

async function processarImagem() {
    const img = $("preview-imagem");
    const src = img?.getAttribute("src");

    if (!src) return alert("Selecione ou tire uma foto primeiro.");

    if (typeof Tesseract === "undefined") {
        return alert("Biblioteca OCR não carregou.");
    }

    const btn = document.querySelector("[data-processar-imagem]");
    const textoOriginal = btn.textContent;

    btn.disabled = true;
    btn.textContent = "Preparando imagem...";

    try {
        const srcProcessada = await preProcessarImagem(src);
        btn.textContent = "Carregando OCR...";

        const worker = await Tesseract.createWorker(["por", "eng"], 1, {
            logger: (m) => {
                if (m.status === "recognizing text") {
                    const pct = Math.round(m.progress * 100);
                    btn.textContent = `Lendo rótulo... ${pct}%`;
                }
            },
        });

        const { data: { text } } = await worker.recognize(srcProcessada);
        await worker.terminate();

        if (!text || text.trim().length < 10) {
            alert("Não foi possível ler o texto. Tente uma foto mais nítida.");
            return;
        }

        const dados = await api(API.ocr, { method: "POST", body: { texto: text } });

        if (!dados?.resultados?.length) {
            alert("Nenhum produto encontrado.\n\nTermos: " + (dados?.termos?.join(", ") || "—"));
            return;
        }

        fecharModalImagem();
        $("contadorResultados").textContent = `${dados.resultados.length} produtos`;
        mostrarResultados(dados.resultados);
        $("resultados").scrollIntoView({ behavior: "smooth", block: "start" });

    } catch (e) {
        console.error(e);
        alert("Erro ao processar imagem: " + e.message);
    } finally {
        btn.disabled = false;
        btn.textContent = textoOriginal;
    }
}
