document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        window.location.href = '../../login/HTML/login.html';
        return;
    }

    const apiClient = axios.create({
        baseURL: 'https://www.japauniverse.com.br/api',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const pixDetailsContainer = document.getElementById('pix-details');
    const params = new URLSearchParams(window.location.search);
    const pedidoId = params.get('pedidoId');

    if (!pedidoId) {
        pixDetailsContainer.innerHTML = '<p>ID do pedido não encontrado.</p>';
        return;
    }

    const fetchPixData = async () => {
        try {
            const response = await apiClient.get(`/pedidos/${pedidoId}/pix`);
            const pixData = response.data;
            renderPixDetails(pixData);
        } catch (error) {
            console.error('Erro ao gerar PIX:', error);
            pixDetailsContainer.innerHTML = '<p>Não foi possível gerar os dados do PIX.</p>';
        }
    };

    const renderPixDetails = (pixData) => {
        pixDetailsContainer.innerHTML = `
            <img src="${pixData.qrCode}" alt="PIX QR Code" class="qr-code-img">
            <div class="copia-cola-container">
                <p class="copia-cola-text">${pixData.copiaECola}</p>
                <button class="btn btn-primary copy-btn" id="copy-btn">
                    <i class="fas fa-copy"></i> Copiar Código
                </button>
            </div>
        `;

        const copyBtn = document.getElementById('copy-btn');
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(pixData.copiaECola).then(() => {
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copiar Código';
                }, 2000);
            });
        });
    };

    fetchPixData();
});
