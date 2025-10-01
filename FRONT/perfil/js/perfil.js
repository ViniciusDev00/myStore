document.addEventListener('DOMContentLoaded', () => {
    const addressesContainer = document.getElementById('addresses-container');
    const ordersContainer = document.getElementById('orders-container');
    const token = localStorage.getItem('jwtToken');

    const addressModal = document.getElementById('address-modal');
    const modalOverlay = document.getElementById('address-modal-overlay');
    const openModalBtn = document.querySelector('.btn.btn-primary');
    const closeModalBtn = document.getElementById('close-address-modal');
    const addressForm = document.getElementById('address-form');

    if (!token) {
        window.location.href = '/FRONT/login/HTML/login.html';
        return;
    }

    // --- CORREÇÃO APLICADA AQUI ---
    const apiClient = axios.create({
        baseURL: 'https://api.japauniverse.com.br/api',
    });

    apiClient.interceptors.request.use(config => {
        const currentToken = localStorage.getItem('jwtToken');
        if (currentToken) {
            config.headers.Authorization = `Bearer ${currentToken}`;
        }
        return config;
    }, error => {
        return Promise.reject(error);
    });
    // --- FIM DA CORREÇÃO ---

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
            </div>
        `).join('');
    };

    const renderOrders = (orders) => {
        if (!orders || orders.length === 0) {
            ordersContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <h3>Nenhuma compra feita ainda</h3>
                    <a href="/FRONT/catalogo/HTML/catalogo.html" class="btn btn-primary" style="margin-top: 1rem;">Faça seu primeiro pedido</a>
                </div>
            `;
            return;
        }
        ordersContainer.innerHTML = orders.map(order => {
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
            
            renderAddresses(userData.enderecos);
            renderOrders(userData.pedidos);

        } catch (error) {
            console.error('Erro ao carregar dados do perfil:', error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                localStorage.removeItem('jwtToken');
                window.location.href = '/FRONT/login/HTML/login.html';
            }
        }
    };
    
    const toggleModal = (show) => {
        if (show) {
            addressModal.classList.add('active');
            modalOverlay.classList.add('active');
        } else {
            addressModal.classList.remove('active');
            modalOverlay.classList.remove('active');
        }
    };

    openModalBtn.addEventListener('click', () => toggleModal(true));
    closeModalBtn.addEventListener('click', () => toggleModal(false));
    modalOverlay.addEventListener('click', () => toggleModal(false));

    addressForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const newAddress = {
            cep: document.getElementById('cep').value,
            rua: document.getElementById('rua').value,
            numero: document.getElementById('numero').value,
            complemento: document.getElementById('complemento').value,
            cidade: document.getElementById('cidade').value,
            estado: document.getElementById('estado').value,
        };

        try {
            await apiClient.post('/enderecos', newAddress);
            
            toggleModal(false); 
            loadProfileData(); 
            addressForm.reset(); 

        } catch (error) {
            console.error('Erro ao adicionar endereço:', error);
            alert('Não foi possível salvar o endereço. Tente novamente.');
        }
    });

    loadProfileData();
});