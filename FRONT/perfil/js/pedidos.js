document.addEventListener('DOMContentLoaded', () => {
    const ordersContainer = document.getElementById('orders-container');
    const token = localStorage.getItem("jwtToken");
    
    // 🌟 CORREÇÃO FINAL: Ajuste da BASE_URL. 
    // Como o JSON já inclui "uploads/...", usamos apenas a raiz do backend.
    const BASE_URL = 'http://localhost:8080/'; 

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

    const renderOrders = (orders) => {
        if (!orders || orders.length === 0) {
            ordersContainer.innerHTML = '<p>Você ainda não fez nenhum pedido.</p>';
            return;
        }

        const ordersHTML = orders.map(order => {
            const statusClass = order.status ? order.status.toLowerCase() : '';
            
            // Formatação da data e valor
            const rawDate = new Date(order.dataPedido);
            const formattedDate = rawDate.toLocaleDateString('pt-BR'); 
            const formattedTotal = order.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

            return `
            <div class="order-card">
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
            </div>
        `}).join('');

        ordersContainer.innerHTML = ordersHTML;
    };

    fetchOrders();
});