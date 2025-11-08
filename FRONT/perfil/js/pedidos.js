document.addEventListener('DOMContentLoaded', () => {
    const ordersContainer = document.getElementById('orders-container');
    const token = localStorage.getItem("jwtToken");

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
            return `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-id">Pedido #${String(order.id).padStart(6, '0')}</span>
                    <span class="order-date">Data: ${new Date(order.dataPedido).toLocaleDateString()}</span>
                    <span class="order-total">Total: R$ ${order.valorTotal.toFixed(2).replace('.', ',')}</span>
                    <span class="order-status ${statusClass}">${order.status}</span>
                </div>
                <div class="order-body">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <img src="${item.produto.imagem}" alt="${item.produto.nome}" class="order-item-image">
                            <div class="order-item-details">
                                <h4>${item.produto.nome}</h4>
                                <p>Quantidade: ${item.quantidade}</p>
                                <p>Preço Unitário: R$ ${item.precoUnitario.toFixed(2).replace('.', ',')}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `}).join('');

        ordersContainer.innerHTML = ordersHTML;
    };

    fetchOrders();
});
