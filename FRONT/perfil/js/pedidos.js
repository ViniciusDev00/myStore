document.addEventListener('DOMContentLoaded', () => {
    const ordersContainer = document.getElementById('orders-container');
    // REVERTIDO PARA A CHAVE CORRETA QUE MANTÉM O LOGIN
    const token = localStorage.getItem('jwtToken');
    
    // Elementos do DOM
    const detailsModal = document.getElementById('details-modal');
    const detailsModalBody = document.getElementById('details-modal-body');
    const updatesModal = document.getElementById('updates-modal');
    const updatesModalBody = document.getElementById('updates-modal-body');
    const imageLightboxModal = document.getElementById('image-lightbox-modal');
    const lightboxImage = document.getElementById('lightbox-image');
    const closeButtons = document.querySelectorAll('.close-modal-btn');

    // URL Base
    const BASE_URL = 'http://localhost:8080/';

    // Variável para armazenar pedidos carregados
    let currentOrders = [];

    // Formatação de texto (quebra de linha)
    const formatMessage = (text) => {
        if (!text) return '';
        return text.replace(/\n/g, '<br>');
    };

    // --- ABRIR MODAL DE DETALHES (ATUALIZADO) ---
    const openDetailsModal = (orderId) => {
        const order = currentOrders.find(o => o.id == orderId);
        if (!order) return;

        const formattedDate = new Date(order.dataPedido).toLocaleString('pt-BR');
        
        // Tratamento de endereço seguro
        let enderecoCompleto = 'Endereço não informado';
        if (order.enderecoDeEntrega) {
            const end = order.enderecoDeEntrega;
            enderecoCompleto = `${end.rua}, ${end.numero}${end.complemento ? ` - ${end.complemento}` : ''}<br>
                                ${end.bairro} - ${end.cidade}/${end.estado}<br>
                                CEP: ${end.cep}`;
        }

        // Lógica para mostrar Preferências de Envio
        const temCaixa = order.comCaixa 
            ? '<span style="color:var(--primary); font-weight:bold;">Sim (+5%)</span>' 
            : 'Não (Padrão)';
        
        const temPrioridade = order.entregaPrioritaria 
            ? '<span style="color:var(--primary); font-weight:bold;">Sim (+5%)</span>' 
            : 'Não (Padrão)';

        detailsModalBody.innerHTML = `
            <div class="modal-section">
                <h4>Resumo do Pedido</h4>
                <p><strong>ID do Pedido:</strong> #${order.id}</p>
                <p><strong>Data:</strong> ${formattedDate}</p>
                <p><strong>Status:</strong> <span class="order-status-modal ${order.status ? order.status.toLowerCase() : ''}">${order.status}</span></p>
                <p><strong>Total:</strong> ${order.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            </div>

            <div class="modal-section" style="border: 1px dashed var(--border-color);">
                <h4><i class="fas fa-truck-loading"></i> Preferências de Envio</h4>
                <p><strong>Embalagem com Caixa Original:</strong> ${temCaixa}</p>
                <p><strong>Entrega Prioritária:</strong> ${temPrioridade}</p>
            </div>

            <div class="modal-section">
                <h4>Endereço de Entrega</h4>
                <p><strong>Destinatário:</strong> ${order.nomeDestinatario || 'Não informado'}</p>
                <p><strong>Endereço:</strong><br>${enderecoCompleto}</p>
                ${order.observacoes ? `<p><strong>Observações:</strong> ${order.observacoes}</p>` : ''}
            </div>

            <div class="modal-section">
                <h4>Itens do Pedido</h4>
                ${order.itens.map(item => {
                    const imagePath = item.produto && item.produto.imagemUrl ? `${BASE_URL}${item.produto.imagemUrl}` : null;
                    return `
                    <div class="order-item-modal">
                        ${imagePath 
                            ? `<img src="${imagePath}" alt="${item.produto.nome}" class="order-item-image-modal">` 
                            : `<div style="width:80px;height:80px;background:#eee;"></div>`}
                        
                        <div class="order-item-details-modal">
                            <h5>${item.produto.nome}</h5>
                            <p>Tamanho: ${item.tamanho || 'N/A'}</p>
                            <p>Quantidade: ${item.quantidade}</p>
                            <p>Valor Unit.: ${item.precoUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                    </div>
                `}).join('')}
            </div>
        `;
        detailsModal.classList.add('active');
    };

    // --- ABRIR MODAL DE ATUALIZAÇÕES ---
    const openUpdatesModal = async (orderId) => {
        try {
            updatesModalBody.innerHTML = '<p>Carregando atualizações...</p>';
            updatesModal.classList.add('active');

            const response = await axios.get(`http://localhost:8080/api/pedidos/${orderId}/avisos`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const avisos = response.data;

            if (avisos.length === 0) {
                updatesModalBody.innerHTML = '<p>Nenhuma atualização para este pedido.</p>';
            } else {
                updatesModalBody.innerHTML = avisos.map(aviso => `
                    <div class="update-item">
                        <p><strong>${new Date(aviso.dataAviso).toLocaleString('pt-BR')}</strong></p>
                        <p>${formatMessage(aviso.mensagem)}</p>
                        ${aviso.imagemUrl ? `<img src="${BASE_URL}${aviso.imagemUrl}" alt="Imagem do aviso" class="update-image">` : ''}
                    </div>
                `).join('');
            }

            // Marca como lido
            await axios.post(`http://localhost:8080/api/pedidos/${orderId}/avisos/mark-as-read`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Remove badge visualmente
            const orderCard = ordersContainer.querySelector(`.order-card[data-order-id='${orderId}']`);
            if (orderCard) {
                const badge = orderCard.querySelector('.notification-badge');
                if (badge) badge.classList.add('hidden');
            }

        } catch (error) {
            console.error('Erro ao buscar atualizações:', error);
            updatesModalBody.innerHTML = '<p>Erro ao carregar atualizações.</p>';
        }
    };

    // --- CHECAR AVISOS NÃO LIDOS ---
    const checkUnreadAvisos = async (orderId) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/pedidos/${orderId}/avisos`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const hasUnread = response.data.some(aviso => !aviso.lido);
            
            if (hasUnread) {
                const badge = document.querySelector(`.order-card[data-order-id='${orderId}'] .notification-badge`);
                if (badge) badge.classList.remove('hidden');
            }
        } catch (e) { /* Silêncio em erro de check */ }
    };

    // --- BUSCAR PEDIDOS ---
    const fetchOrders = async () => {
        if (!token) {
            ordersContainer.innerHTML = '<p>Você precisa estar logado.</p>';
            return;
        }
        ordersContainer.innerHTML = '<p>Carregando pedidos...</p>';

        try {
            const response = await axios.get('http://localhost:8080/api/pedidos', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            renderOrders(response.data);
        } catch (error) {
            console.error('Erro ao buscar pedidos:', error);
            ordersContainer.innerHTML = '<p>Não foi possível carregar seus pedidos.</p>';
        }
    };

    // --- RENDERIZAR LISTA DE PEDIDOS ---
    const renderOrders = async (orders) => {
        if (!orders || orders.length === 0) {
            ordersContainer.innerHTML = '<p>Você ainda não fez nenhum pedido.</p>';
            return;
        }

        currentOrders = orders;

        ordersContainer.innerHTML = orders.map(order => {
            const statusClass = order.status ? order.status.toLowerCase() : '';
            const formattedDate = new Date(order.dataPedido).toLocaleDateString('pt-BR');
            const formattedTotal = order.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

            return `
            <div class="order-card" data-order-id="${order.id}">
                <div class="order-header">
                    <span class="order-id">Pedido #${order.id}</span>
                    <span class="order-date">Data: ${formattedDate}</span>
                    <span class="order-status ${statusClass}">${order.status}</span>
                </div>
                <div class="order-details-summary">
                    <strong>Total: ${formattedTotal}</strong>
                </div>
                <div class="order-body">
                    ${order.itens ? order.itens.map(item => {
                        const imgUrl = item.produto && item.produto.imagemUrl ? `${BASE_URL}${item.produto.imagemUrl}` : null;
                        return `
                        <div class="order-item">
                            ${imgUrl 
                                ? `<img src="${imgUrl}" class="order-item-image">` 
                                : `<div class="order-item-placeholder">SEM FOTO</div>`}
                            <div class="order-item-details">
                                <h4>${item.produto.nome}</h4>
                                <p>Tamanho: ${item.tamanho || 'N/A'}</p>
                                <p>Qtd: ${item.quantidade}</p>
                            </div>
                        </div>`;
                    }).join('') : '<p>Itens indisponíveis.</p>'}
                </div>
                <div class="order-footer">
                    <button class="btn btn-secondary view-details-btn">Ver Detalhes</button>
                    <button class="btn btn-primary view-updates-btn">
                        Ver Atualizações
                        <span class="notification-badge hidden"></span>
                    </button>
                </div>
            </div>
        `}).join('');

        // Checa notificações para cada pedido
        orders.forEach(order => checkUnreadAvisos(order.id));
    };

    // Listeners de Clique (Delegação)
    ordersContainer.addEventListener('click', (event) => {
        const target = event.target;
        const orderCard = target.closest('.order-card');
        if (!orderCard) return;
        
        const orderId = orderCard.dataset.orderId;

        if (target.classList.contains('view-details-btn')) {
            openDetailsModal(orderId);
        }
        if (target.classList.contains('view-updates-btn') || target.closest('.view-updates-btn')) {
            openUpdatesModal(orderId);
        }
    });

    // Fechar Modais
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            detailsModal.classList.remove('active');
            updatesModal.classList.remove('active');
            imageLightboxModal.classList.remove('active');
        });
    });

    // Lightbox de imagem
    updatesModalBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('update-image')) {
            lightboxImage.src = e.target.src;
            imageLightboxModal.classList.add('active');
        }
    });

    // Inicializa
    fetchOrders();
});