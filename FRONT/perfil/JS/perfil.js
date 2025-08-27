document.addEventListener('DOMContentLoaded', () => {
    const userInfoContainer = document.getElementById('user-info-container');
    const addressesContainer = document.getElementById('addresses-container');
    const ordersContainer = document.getElementById('orders-container');
    const token = localStorage.getItem('jwtToken');

    if (!token) {
        window.location.href = '../../login/HTML/login.html';
        return;
    }

    const apiClient = axios.create({
        baseURL: 'http://localhost:8080/api',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const renderUserInfo = (user) => {
        if (!user) return;
        userInfoContainer.innerHTML = `
            <p><strong>Nome:</strong> ${user.nome}</p>
            <p><strong>Email:</strong> ${user.email}</p>
        `;
    };

    const renderAddresses = (addresses) => {
        if (!addresses || addresses.length === 0) {
            addressesContainer.innerHTML = `<p>Nenhum endereço cadastrado.</p>`;
            return;
        }
        addressesContainer.innerHTML = addresses.map(addr => `
            <div class="address-card">
                <div class="address-details">
                    <p><strong>${addr.rua}, ${addr.numero} ${addr.complemento || ''}</strong></p>
                    <p>${addr.cidade}, ${addr.estado} - CEP: ${addr.cep}</p>
                </div>
                <div class="address-actions">
                    <a href="#">Editar</a>
                    <a href="#">Apagar</a>
                </div>
            </div>
        `).join('');
    };

    const renderOrders = (orders) => {
        if (!orders || orders.length === 0) {
            ordersContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <h3>Nenhuma compra feita ainda</h3>
                    <a href="../../catalogo/HTML/catalogo.html" class="btn btn-primary" style="margin-top: 1rem;">Faça seu primeiro pedido</a>
                </div>
            `;
            return;
        }
        ordersContainer.innerHTML = orders.map(order => {
             const firstItem = order.itens[0];
             return `
            <div class="order-card">
                <div class="order-header">
                    <div><strong>PEDIDO:</strong> #${String(order.id).padStart(6, '0')}</div>
                    <div><strong>DATA:</strong> ${new Date(order.dataPedido).toLocaleDateString()}</div>
                    <div><strong>TOTAL:</strong> R$ ${order.valorTotal.toFixed(2).replace('.', ',')}</div>
                </div>
            </div>
        `}).join('');
    };

    const loadProfileData = async () => {
        try {
            const response = await apiClient.get('/usuario/meus-dados');
            const userData = response.data;
            
            renderUserInfo(userData);
            renderAddresses(userData.enderecos);
            renderOrders(userData.pedidos);

        } catch (error) {
            console.error('Erro ao carregar dados do perfil:', error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                localStorage.removeItem('jwtToken');
                window.location.href = '../../login/HTML/login.html';
            }
        }
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

    loadProfileData();
});