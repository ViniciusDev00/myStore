document.addEventListener('DOMContentLoaded', () => {
    const ordersContainer = document.getElementById('orders-container');
    const token = localStorage.getItem("jwtToken");
    let currentOrders = [];

    const detailsModal = document.getElementById('details-modal');
    const detailsModalBody = document.getElementById('details-modal-body');
    const updatesModal = document.getElementById('updates-modal');
    const updatesModalBody = document.getElementById('updates-modal-body');
    
    // 🌟 CORREÇÃO FINAL: Ajuste da BASE_URL. 
    // Como o JSON já inclui "uploads/...", usamos apenas a raiz do backend.
    const BASE_URL = 'http://localhost:8080/'; 

    const openDetailsModal = (orderId) => {
        const order = currentOrders.find(o => o.id == orderId);
        if (!order) return;

        const formattedDate = new Date(order.dataPedido).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const endereco = order.enderecoDeEntrega;
        const enderecoCompleto = endereco ? `${endereco.rua}, ${endereco.numero}${endereco.complemento ? `, ${endereco.complemento}` : ''} - ${endereco.cidade}, ${endereco.estado} - CEP: ${endereco.cep}` : 'Endereço não informado';

        detailsModalBody.innerHTML = `
            <div class="modal-section">
                <h4>Resumo do Pedido</h4>
                <p><strong>ID do Pedido:</strong> #${order.id}</p>
                <p><strong>Data do Pedido:</strong> ${formattedDate}</p>
                <p><strong>Status:</strong> <span class="order-status-modal ${order.status.toLowerCase()}">${order.status}</span></p>
                <p><strong>Valor Total:</strong> ${order.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            </div>

            <div class="modal-section">
                <h4>Endereço de Entrega</h4>
                <p><strong>Destinatário:</strong> ${order.nomeDestinatario}</p>
                <p><strong>CPF:</strong> ${order.cpfDestinatario}</p>
                <p><strong>Telefone:</strong> ${order.telefoneDestinatario}</p>
                <p><strong>Endereço:</strong> ${enderecoCompleto}</p>
                ${order.observacoes ? `<p><strong>Observações:</strong> ${order.observacoes}</p>` : ''}
            </div>

            <div class="modal-section">
                <h4>Pagamento</h4>
                <p><strong>PIX Copia e Cola:</strong></p>
                <textarea class="pix-code" readonly>${order.pixCopiaECola || 'Não disponível'}</textarea>
            </div>

            <div class="modal-section">
                <h4>Itens do Pedido</h4>
                ${order.itens.map(item => `
                    <div class="order-item-modal">
                        <img src="${BASE_URL}${item.produto.imagemUrl}" alt="${item.produto.nome}" class="order-item-image-modal">
                        <div class="order-item-details-modal">
                            <h5>${item.produto.nome}</h5>
                            <p>Tamanho: ${item.tamanho || 'N/A'}</p>
                            <p>Quantidade: ${item.quantidade}</p>
                            <p>Preço Unitário: ${item.precoUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        detailsModal.classList.add('active');
    };

    const openUpdatesModal = async (orderId) => {
        try {
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
                        <p>${aviso.mensagem}</p>
                        ${aviso.imagemUrl ? `<img src="${BASE_URL}${aviso.imagemUrl}" alt="Imagem do aviso" class="update-image">` : ''}
                    </div>
                `).join('');
            }

            await axios.post(`http://localhost:8080/api/pedidos/${orderId}/avisos/mark-as-read`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const orderCard = ordersContainer.querySelector(`.order-card[data-order-id='${orderId}']`);
            if (orderCard) {
                const badge = orderCard.querySelector('.notification-badge');
                if (badge) {
                    badge.classList.add('hidden');
                }
            }

            updatesModal.classList.add('active');
        } catch (error) {
            console.error('Erro ao buscar atualizações:', error);
            updatesModalBody.innerHTML = '<p>Não foi possível carregar as atualizações.</p>';
            updatesModal.classList.add('active');
        }
    };

    const checkUnreadAvisos = async (orderId) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/pedidos/${orderId}/avisos`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const avisos = response.data;
            const hasUnread = avisos.some(aviso => !aviso.lido);

            const orderCard = ordersContainer.querySelector(`.order-card[data-order-id='${orderId}']`);
            if (orderCard) {
                const badge = orderCard.querySelector('.notification-badge');
                if (badge && hasUnread) {
                    badge.classList.remove('hidden');
                }
            }
        } catch (error) {
            console.error('Erro ao checar avisos não lidos:', error);
        }
    };

    const fetchOrders = async () => {
        if (!token) {
            ordersContainer.innerHTML = '<p>Você precisa estar logado para ver seus pedidos.</p>';
            return;
        }

        ordersContainer.innerHTML = '<p>Carregando pedidos...</p>';

        try {
            const response = await axios.get('http://localhost:8080/api/pedidos', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            renderOrders(response.data);
        } catch (error) {
            console.error('Erro ao buscar pedidos:', error);
            ordersContainer.innerHTML = '<p>Não foi possível carregar seus pedidos. Tente novamente mais tarde.</p>';
        }
    };

    const renderOrders = async (orders) => {
        if (!orders || orders.length === 0) {
            ordersContainer.innerHTML = '<p>Você ainda não fez nenhum pedido.</p>';
            return;
        }

        currentOrders = orders;

        const ordersHTML = orders.map(order => {
            const statusClass = order.status ? order.status.toLowerCase() : '';
            
            // Formatação da data e valor
            const rawDate = new Date(order.dataPedido);
            const formattedDate = rawDate.toLocaleDateString('pt-BR'); 
            const formattedTotal = order.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

            return `
            <div class="order-card" data-order-id="${order.id}">
                <div class="order-header">
                    <span class="order-id">Pedido #${order.id}</span>
                    <span class="order-date">Data: ${formattedDate}</span> 
                    <span class="order-status ${statusClass}">${order.status}</span>
                </div>
                <div class="order-details-summary">
                    <strong>Valor Total: ${formattedTotal}</strong>
                </div>
                <div class="order-body">
                    ${order.itens ? order.itens.map(item => {
                        
                        // 🌟 CORREÇÃO FINAL: Acessando item.produto.imagemUrl
                        // A checagem robusta é mantida, mas a chave foi alterada
                        const imageFileName = item.produto && item.produto.imagemUrl && item.produto.imagemUrl.trim() !== '' ? item.produto.imagemUrl : null;
                        
                        // Cria o HTML da imagem
                        const imageHtml = imageFileName
                            ? `<img src="${BASE_URL}${imageFileName}" alt="${item.produto.nome}" class="order-item-image">`
                            : `<div class="order-item-placeholder" style="width: 80px; height: 80px; background-color: #eee; display: flex; align-items: center; justify-content: center; border-radius: 4px; font-size: 10px; text-align: center;">SEM IMAGEM</div>`;

                        return `
                        <div class="order-item">
                            ${imageHtml}
                            <div class="order-item-details">
                                <h4>${item.produto.nome}</h4>
                                <p>Tamanho: ${item.tamanho || 'N/A'}</p> 
                                <p>Quantidade: ${item.quantidade}</p>
                                <p>Preço Unitário: R$ ${item.precoUnitario.toFixed(2)}</p>
                            </div>
                        </div>
                    `;
                    }).join('') : '<p>Itens do pedido não disponíveis.</p>'}
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

        ordersContainer.innerHTML = ordersHTML;

        await Promise.all(orders.map(order => checkUnreadAvisos(order.id)));
    };

    fetchOrders();

    ordersContainer.addEventListener('click', async (event) => {
        const target = event.target;
        const orderCard = target.closest('.order-card');
        if (!orderCard) return;

        const orderId = orderCard.dataset.orderId;

        if (target.classList.contains('view-details-btn')) {
            openDetailsModal(orderId);
        }

        if (target.classList.contains('view-updates-btn')) {
            await openUpdatesModal(orderId);
        }
    });

    [detailsModal, updatesModal].forEach(modal => {
        modal.addEventListener('click', (event) => {
            if (event.target === modal || event.target.classList.contains('close-modal-btn')) {
                modal.classList.remove('active');
            }
        });
    });
});