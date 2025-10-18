document.addEventListener('DOMContentLoaded', () => {
    // Pega os elementos da página
    const pixDetailsContainer = document.getElementById('pix-details');
    const pedidoIdEl = document.getElementById('pedido-id');
    const pedidoValorEl = document.getElementById('pedido-valor');

    // Pega os dados do pedido salvos na sessão pelo checkout.js
    const pedidoId = sessionStorage.getItem('ultimoPedidoId');
    const pedidoValor = sessionStorage.getItem('ultimoPedidoValor');
    const pixCode = sessionStorage.getItem('ultimoPedidoPixCode');

    // 1. Verifica se os dados existem
    if (!pedidoId || !pixCode || !pedidoValor) {
        // Se não achar, exibe um erro
        pixDetailsContainer.innerHTML = '<p style="color: red; font-weight: bold; padding: 20px 0;">Erro: Informações do pedido não encontradas. Por favor, volte ao carrinho e tente novamente.</p>';
        if(pedidoIdEl) pedidoIdEl.textContent = '#ERRO';
        if(pedidoValorEl) pedidoValorEl.textContent = 'R$ --,--';
        console.error("Dados do pedido não encontrados no sessionStorage.");
        return;
    }

    // 2. Atualiza as informações na tela
    try {
        if(pedidoIdEl) pedidoIdEl.textContent = `#${pedidoId.padStart(6, '0')}`;
        if(pedidoValorEl) pedidoValorEl.textContent = `R$ ${parseFloat(pedidoValor).toFixed(2).replace('.', ',')}`;
    } catch(e) {
        console.error("Erro ao formatar dados do pedido: ", e);
    }

    // 3. Insere o HTML do QR Code e do Copia/Cola
    pixDetailsContainer.innerHTML = `
        <canvas id="qr-code-canvas" class="qr-code-canvas"></canvas>
        
        <div class="copia-cola-container">
            <p>Se preferir, copie o código Pix:</p>
            <input type="text" id="pix-copia-cola-input" class="copia-cola-text" value="${pixCode}" readonly>
            <button class="btn btn-primary copy-btn" id="copy-btn">
                <i class="fas fa-copy"></i> Copiar Código
            </button>
        </div>
    `;

    // 4. Gera o QR Code
    try {
        const qrCanvas = document.getElementById('qr-code-canvas');
        if (qrCanvas && typeof QRious !== 'undefined') {
            new QRious({
                element: qrCanvas,
                value: pixCode,
                size: 250, // Tamanho em pixels
                level: 'H' // Nível de correção de erro (High)
            });
        } else {
             console.error("Elemento canvas ou biblioteca QRious não encontrada.");
             if(qrCanvas) qrCanvas.outerHTML = '<p style="color: red;">Erro ao gerar QR Code.</p>';
        }
    } catch (e) {
        console.error("Erro ao instanciar QRious: ", e);
        pixDetailsContainer.innerHTML = '<p style="color: red;">Erro fatal ao gerar QR Code.</p>';
    }

    // 5. Adiciona funcionalidade ao botão "Copiar"
    const copyBtn = document.getElementById('copy-btn');
    const pixInput = document.getElementById('pix-copia-cola-input');
    
    if (copyBtn && pixInput) {
        copyBtn.addEventListener('click', () => {
            // Seleciona o texto no input
            pixInput.select();
            pixInput.setSelectionRange(0, 99999); // Para funcionar em mobile

            try {
                // Tenta copiar para a área de transferência
                navigator.clipboard.writeText(pixCode).then(() => {
                    // Sucesso!
                    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
                    copyBtn.style.backgroundColor = '#28a745'; // Verde
                    copyBtn.style.borderColor = '#28a745';

                    setTimeout(() => {
                        copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copiar Código';
                        copyBtn.style.backgroundColor = ''; // Volta à cor original
                        copyBtn.style.borderColor = '';
                    }, 2500);

                }).catch(err => {
                    // Falha (acontece em conexões não-seguras http)
                    console.error('Falha ao copiar (navigator.clipboard): ', err);
                    showCopyError();
                });
            } catch (err) {
                 console.error('Falha ao copiar (try/catch): ', err);
                 showCopyError();
            }
        });
        
        function showCopyError() {
            copyBtn.innerHTML = '<i class="fas fa-times"></i> Falhou!';
            copyBtn.style.backgroundColor = '#dc3545'; // Vermelho
            copyBtn.style.borderColor = '#dc3545';
             setTimeout(() => {
                copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copiar Código';
                copyBtn.style.backgroundColor = '';
                copyBtn.style.borderColor = '';
            }, 2500);
        }
    }

    // Opcional: Limpar os dados da sessão para que o usuário não acesse esta página
    // com dados antigos se ele atualizar a página (F5).
    // Mas deixar comentado facilita os testes.
    /*
    sessionStorage.removeItem('ultimoPedidoId');
    sessionStorage.removeItem('ultimoPedidoValor');
    sessionStorage.removeItem('ultimoPedidoPixCode');
    */
});