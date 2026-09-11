// ==========================================
// CONFIG
// ==========================================

const API = {
    buscar:     "app/api.php?acao=buscar",
    cadastro:   "app/cadastro.php",
    login:      "app/login.php",
    logout:     "app/logout.php",
    sessao:     "app/sessao.php",
    historico:  "app/historico.php",
    favoritos:  "app/favoritos.php",
    ranking:    "app/ranking.php",
};

const $ = (id) => document.getElementById(id);

const state = {
    csrf: null,
    user: null,
    abort: null,
    favs: new Set(),
};


// ==========================================
// API
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
    try { data = await res.json(); } catch {}

    if (!res.ok) {
        throw new Error(data?.mensagem || data?.erro || `Erro ${res.status}`);
    }
    return data;
}


// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    bindEventos();
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
        $("titulo-login").textContent = "Entrar no NutriScan";
    });

    $("formLogin")?.addEventListener("submit", (e) => { e.preventDefault(); login(); });
    $("formCadastro")?.addEventListener("submit", (e) => { e.preventDefault(); cadastro(); });

    $("btnImagem")?.addEventListener("click", abrirModalImagem);
    document.querySelectorAll("[data-fechar-modal]").forEach((b) =>
        b.addEventListener("click", fecharModalImagem));
    document.querySelector("[data-abrir-camera]")?.addEventListener("click", abrirCamera);
    document.querySelector("[data-abrir-arquivo]")?.addEventListener("click", abrirArquivo);
    document.querySelector("[data-capturar-foto]")?.addEventListener("click", capturarFoto);
    document.querySelector("[data-parar-camera]")?.addEventListener("click", pararCamera);
    document.querySelector("[data-processar-imagem]")?.addEventListener("click", processarImagem);
    document.querySelector("[data-cancelar-imagem]")?.addEventListener("click", cancelarImagem);
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
}

const abrir  = (id) => $(id)?.classList.add("aberto");
const fechar = (id) => $(id)?.classList.remove("aberto");


// ==========================================
// SESSÃO
// ==========================================

async function verificarSessao() {
    try {
        const d = await api(API.sessao);
        if (!d?.logado) return;

        state.user = { id: d.id, nome: d.nome, email: d.email };
        state.csrf = d.csrf_token;

        $("usuarioLogado").textContent = `👤 ${d.nome}`;
        $("usuarioLogado").style.display = "inline";
        $("btnLogin").style.display = "none";
        $("btnLogout").style.display = "inline";

        carregarRanking();
        carregarHistorico();
        carregarFavoritos();
    } catch {}
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
    $("resultados").innerHTML = `
        <div class="estado-vazio"><span>🔄</span><p>Buscando produtos...</p></div>`;

    try {
        const url = `${API.buscar}&termo=${encodeURIComponent(termo)}`;
        const produtos = await api(url, { signal: state.abort.signal });
        mostrarResultados(produtos);
    } catch (e) {
        if (e.name === "AbortError") return;
        $("contadorResultados").textContent = "0 produtos";
        $("resultados").innerHTML = `
            <div class="estado-vazio">
                <span>❌</span><p>Não foi possível consultar.</p>
                <small>Tente novamente.</small>
            </div>`;
    }
}

function mostrarResultados(produtos) {
    $("contadorResultados").textContent = `${produtos.length} produtos`;

    if (!produtos.length) {
        $("resultados").innerHTML = `
            <div class="estado-vazio">
                <span>🔎</span><p>Nenhum produto encontrado.</p>
            </div>`;
        return;
    }

    const grid = $("resultados");
    grid.innerHTML = "";

    produtos.forEach((p) => {
        const card = document.createElement("article");
        card.className = "cartao-produto";

        const h3 = document.createElement("h3");
        h3.textContent = p.nome || "Sem nome";
        card.appendChild(h3);

        [`🔥 ${p.calorias ?? "-"} kcal / 100g`,
         `🥩 Proteínas: ${p.proteinas ?? "-"}g`,
         `🍞 Carboidratos: ${p.carboidratos ?? "-"}g`,
         `🥑 Gorduras: ${p.gorduras ?? "-"}g`,
         `🌾 Fibras: ${p.fibras ?? "-"}g`
        ].forEach((txt) => {
            const el = document.createElement("p");
            el.className = "nutri-info";
            el.textContent = txt;
            card.appendChild(el);
        });

        if (p.codigo_barras) {
            const s = document.createElement("small");
            s.textContent = `Código: ${p.codigo_barras}`;
            card.appendChild(s);
        }

        if (state.user) {
            const acoes = document.createElement("div");
            acoes.className = "cartao-acoes";

            const btn = document.createElement("button");
            const fav = state.favs.has(p.id);
            btn.textContent = fav ? "♥ Favorito" : "♡ Favoritar";
            if (fav) btn.classList.add("favoritado");
            btn.addEventListener("click", () => toggleFav(p.id, btn));
            acoes.appendChild(btn);

            card.appendChild(acoes);

            salvarHistorico(p.id).catch(() => {});
        }

        grid.appendChild(card);
    });
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
    const lista = $("historico-lista");

    try {
        const dados = await api(API.historico);
        if (!dados.length) {
            lista.innerHTML = "<p>Nenhuma pesquisa recente.</p>";
            return;
        }
        lista.innerHTML = "";
        dados.forEach((h) => lista.appendChild(itemLista(h.nome, () => deletarHistorico(h.id))));
    } catch {}
}

async function deletarHistorico(id) {
    await api(API.historico, { method: "DELETE", body: { id } });
    carregarHistorico();
}

function itemLista(texto, onRemover) {
    const div = document.createElement("div");
    div.className = "lista-item";

    const span = document.createElement("span");
    span.textContent = texto;
    div.appendChild(span);

    const btn = document.createElement("button");
    btn.textContent = "×";
    btn.title = "Remover";
    btn.addEventListener("click", onRemover);
    div.appendChild(btn);

    return div;
}


// ==========================================
// FAVORITOS
// ==========================================

async function carregarFavoritos() {
    if (!state.user) return;
    const lista = $("favoritos-lista");

    try {
        const dados = await api(API.favoritos);
        state.favs = new Set(dados.map((f) => f.id));

        if (!dados.length) {
            lista.innerHTML = "<p>Seus alimentos favoritos aparecerão aqui.</p>";
            return;
        }
        lista.innerHTML = "";
        dados.forEach((f) => lista.appendChild(itemLista(f.nome, () => toggleFav(f.id))));
    } catch {}
}

async function toggleFav(id, botao) {
    if (!state.user) {
        abrir("area-login");
        return;
    }

    const acao = state.favs.has(id) ? "remover" : "adicionar";
    await api(API.favoritos, { method: "POST", body: { alimento_id: id, acao } });

    if (acao === "remover") state.favs.delete(id);
    else state.favs.add(id);

    if (botao) {
        const fav = state.favs.has(id);
        botao.textContent = fav ? "♥ Favorito" : "♡ Favoritar";
        botao.classList.toggle("favoritado", fav);
    }

    carregarFavoritos();
}


// ==========================================
// RANKING
// ==========================================

async function carregarRanking() {
    if (!state.user) return;
    const lista = $("ranking-lista");

    try {
        const dados = await api(`${API.ranking}?tipo=pessoal`);
        if (!dados.length) {
            lista.innerHTML = "<p>Nenhum produto pesquisado ainda.</p>";
            return;
        }

        const ul = document.createElement("ul");
        ul.className = "ranking-lista";

        dados.forEach((r, i) => {
            const li = document.createElement("li");
            li.innerHTML = `<span>${i + 1}º ${r.nome}</span><span>${r.pontuacao} pts</span>`;
            ul.appendChild(li);
        });

        lista.innerHTML = "";
        lista.appendChild(ul);
    } catch {}
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
    const nome  = $("cadastroNome").value.trim();
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

let stream = null;

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
    $("videoCamera").style.display  = "none";
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
    const video  = $("videoCamera");
    const canvas = $("canvasCamera");
    if (!video.videoWidth) return alert("Câmera não pronta.");

    canvas.width  = video.videoWidth;
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

function processarImagem() {
    if (!$("preview-imagem").getAttribute("src")) {
        return alert("Selecione ou tire uma foto primeiro.");
    }
    alert("Imagem pronta. OCR será implementado em breve.");
}