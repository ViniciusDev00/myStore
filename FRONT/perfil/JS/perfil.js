document.addEventListener('DOMContentLoaded', () => {
    const ordersContainer = document.getElementById('orders-container');
    const token = localStorage.getItem('jwtToken');

    // Redireciona para o login se não houver token
    if (!token) {
        window.location.href = '../../login/HTML/login.html';
        return;
    }

    // Configuração do Axios com o token de autorização
    const apiClient = axios.create({
        baseURL: 'http://localhost:8080/api',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const fetchOrders = async () => {
        try {
            const response = await apiClient.get('/usuario/meus-pedidos');
            renderOrders(response.data);
        } catch (error) {
            console.error('Erro ao buscar pedidos:', error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                // Token inválido, redireciona para o login
                localStorage.removeItem('jwtToken');
                window.location.href = '../../login/HTML/login.html';
            } else {
                ordersContainer.innerHTML = '<p>Não foi possível carregar seus pedidos.</p>';
            }
        }
    };

    const renderOrders = (orders) => {
        if (!orders || orders.length === 0) {
            ordersContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <h3>Nenhuma compra feita</h3>
                    <p>Você ainda não fez nenhum pedido conosco.</p>
                    <br>
                    <a href="../../catalogo/HTML/catalogo.html" class="btn btn-primary">Faça sua primeira compra</a>
                </div>
            `;
            return;
        }

        ordersContainer.innerHTML = orders.map(order => {
            const firstItem = order.itens[0];
            return `
            <div class="order-card">
                <div class="order-header">
                    <div>Pedido realizado em ${new Date(order.dataPedido).toLocaleDateString()}</div>
                    <div class="order-id">PEDIDO #${String(order.id).padStart(6, '0')}</div>
                    <div>Total: R$ ${order.valorTotal.toFixed(2).replace('.', ',')}</div>
                </div>
                <div class="order-body">
                    <div class="item">
                        <img src="../../${firstItem.produto.imagemUrl}" alt="${firstItem.produto.nome}" class="item-img">
                        <div class="item-details">
                             <h4>${firstItem.produto.nome}</h4>
                             <p>${order.itens.length > 1 ? `e mais ${order.itens.length - 1} item(ns)` : ''}</p>
                        </div>
                    </div>
                </div>
            </div>
        `}).join('');
    };

    // Logout do botão na sidebar
    const sidebarLogout = document.getElementById('sidebar-logout');
    if(sidebarLogout) {
        sidebarLogout.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('jwtToken');
            window.location.href = '../../index.html';
        });
    }

    fetchOrders();
});