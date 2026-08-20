// ============================================
// CÂMERA / ARQUIVO DO DISPOSITIVO
// ============================================

btnCamera.addEventListener('click', async () => {

    // Verifica se o navegador possui suporte à câmera
    if (
        'mediaDevices' in navigator &&
        'getUserMedia' in navigator.mediaDevices
    ) {

        mostrarNotificacao('📷 Tentando abrir a câmera...');

        try {

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: 'environment' }
                }
            });

            abrirCamera(stream);

        } catch (erro) {

            console.log('Câmera indisponível:', erro);

            mostrarNotificacao(
                '📁 Não foi possível usar a câmera. Selecione uma imagem do dispositivo.'
            );

            abrirSeletorArquivo();
        }

    } else {

        // Navegador/dispositivo sem suporte à câmera
        mostrarNotificacao(
            '📁 Câmera não disponível. Selecione uma imagem do dispositivo.'
        );

        abrirSeletorArquivo();
    }
});


// ============================================
// ABRIR CÂMERA
// ============================================

function abrirCamera(stream) {

    const video = document.createElement('video');

    video.srcObject = stream;
    video.style.position = 'fixed';
    video.style.top = '0';
    video.style.left = '0';
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.zIndex = '1000';
    video.style.objectFit = 'cover';
    video.autoplay = true;
    video.playsInline = true;


    const overlay = document.createElement('div');

    overlay.style.position = 'fixed';
    overlay.style.bottom = '30px';
    overlay.style.left = '50%';
    overlay.style.transform = 'translateX(-50%)';
    overlay.style.zIndex = '1001';
    overlay.style.display = 'flex';
    overlay.style.gap = '15px';


    // BOTÃO CAPTURAR
    const btnCapturar = document.createElement('button');

    btnCapturar.textContent = '📸 Capturar';

    btnCapturar.style.cssText = `
        padding: 12px 30px;
        background: #2c7be5;
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: bold;
        cursor: pointer;
    `;


    // BOTÃO USAR ARQUIVO
    const btnArquivo = document.createElement('button');

    btnArquivo.textContent = '📁 Arquivo';

    btnArquivo.style.cssText = `
        padding: 12px 30px;
        background: #6c5ce7;
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: bold;
        cursor: pointer;
    `;


    // BOTÃO FECHAR
    const btnFechar = document.createElement('button');

    btnFechar.textContent = '✕ Fechar';

    btnFechar.style.cssText = `
        padding: 12px 30px;
        background: #e74c3c;
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: bold;
        cursor: pointer;
    `;


    overlay.appendChild(btnCapturar);
    overlay.appendChild(btnArquivo);
    overlay.appendChild(btnFechar);

    document.body.appendChild(video);
    document.body.appendChild(overlay);


    // ============================================
    // FECHAR CÂMERA
    // ============================================

    btnFechar.addEventListener('click', () => {

        stream.getTracks().forEach(track => track.stop());

        video.remove();
        overlay.remove();

    });


    // ============================================
    // ABRIR ARQUIVO
    // ============================================

    btnArquivo.addEventListener('click', () => {

        stream.getTracks().forEach(track => track.stop());

        video.remove();
        overlay.remove();

        abrirSeletorArquivo();

    });


    // ============================================
    // CAPTURAR FOTO
    // ============================================

    btnCapturar.addEventListener('click', () => {

        const canvas = document.createElement('canvas');

        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        const contexto = canvas.getContext('2d');

        contexto.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
        );

        const imagem = canvas.toDataURL('image/png');

        stream.getTracks().forEach(track => track.stop());

        video.remove();
        overlay.remove();

        processarImagem(imagem);

    });

}


// ============================================
// SELETOR DE ARQUIVOS DO DISPOSITIVO
// ============================================

function abrirSeletorArquivo() {

    const input = document.createElement('input');

    input.type = 'file';

    input.accept = 'image/*';

    // Permite selecionar foto da câmera em dispositivos compatíveis
    input.capture = 'environment';

    input.style.display = 'none';

    document.body.appendChild(input);


    input.addEventListener('change', () => {

        const arquivo = input.files[0];

        if (!arquivo) {
            input.remove();
            return;
        }


        // Verifica se é uma imagem
        if (!arquivo.type.startsWith('image/')) {

            mostrarNotificacao(
                '❌ Selecione um arquivo de imagem.'
            );

            input.remove();

            return;
        }


        const leitor = new FileReader();


        leitor.onload = function (evento) {

            const imagem = evento.target.result;

            processarImagem(imagem);

        };


        leitor.onerror = function () {

            mostrarNotificacao(
                '❌ Não foi possível carregar a imagem.'
            );

        };


        leitor.readAsDataURL(arquivo);

        input.remove();

    });


    // Abre o explorador de arquivos/galeria
    input.click();

}


// ============================================
// PROCESSAR IMAGEM
// ============================================

function processarImagem(imagem) {

    mostrarNotificacao(
        '📸 Imagem carregada! Analisando...'
    );


    // Mostra a imagem selecionada
    resultadosDiv.innerHTML = `
        <div style="
            width:100%;
            text-align:center;
            padding:20px;
        ">

            <h3>📸 Imagem selecionada</h3>

            <img
                src="${imagem}"
                style="
                    max-width:100%;
                    max-height:300px;
                    margin-top:15px;
                    border-radius:12px;
                    box-shadow:0 2px 10px rgba(0,0,0,0.15);
                "
            >

            <p style="
                margin-top:15px;
                color:#666;
            ">
                🔍 Analisando imagem...
            </p>

        </div>
    `;


    /*
     * Aqui posteriormente podemos colocar:
     *
     * - Leitura do código de barras
     * - OCR do nome do alimento
     * - Identificação do produto
     * - Busca automática na Open Food Facts
     *
     */


    mostrarNotificacao(
        '✅ Imagem carregada com sucesso!'
    );

}