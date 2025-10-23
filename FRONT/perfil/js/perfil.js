document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DO DOM ---
    const addressesContainer = document.getElementById('addresses-container');
    const ordersContainer = document.getElementById('orders-container');
    const addressModal = document.getElementById('address-modal');
    const modalOverlay = document.getElementById('address-modal-overlay');
    const openModalBtn = document.querySelector('.btn.btn-primary[data-action="add-address"]'); // Seletor mais específico
    const closeModalBtn = document.getElementById('close-address-modal');
    const addressForm = document.getElementById('address-form');

    // --- ESTADO ---
    let isSessionExpired = false;
    const token = localStorage.getItem('jwtToken');

    if (!token) {
        window.location.href = '/FRONT/login/HTML/login.html';
        return;
    }

    // --- CLIENTE API (AXIOS) ---
    const apiClient = axios.create({
        baseURL: 'https://api.japauniverse.com.br/api',
    });

    // Interceptor de REQUISIÇÃO (Adiciona o token)
    apiClient.interceptors.request.use(config => {
        const currentToken = localStorage.getItem('jwtToken');
        if (currentToken) {
            config.headers.Authorization = `Bearer ${currentToken}`;
        }
        return config;
    }, error => {
        return Promise.reject(error);
    });

    // --- [MELHORIA] INTERCEPTOR DE RESPOSTA (Trata erros 401/403) ---
    apiClient.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                if (!isSessionExpired) {
                    isSessionExpired = true;
                    localStorage.removeItem('jwtToken');
                    alert('Sua sessão expirou ou você não tem permissão. Por favor, faça login novamente.');
                    window.location.href = '/FRONT/login/HTML/login.html';
                }
            }
            return Promise.reject(error);
        }
    );
    // --- FIM DA MELHORIA ---


    // --- FUNÇÕES DE RENDERIZAÇÃO ---

    const renderAddresses = (addresses) => {
        if (!addressesContainer) return;
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
        if (!ordersContainer) return;
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

    // --- CARREGAMENTO INICIAL ---
    const loadProfileData = async () => {
        try {
            // O interceptor de resposta tratará o 401/403 se falhar
            const response = await apiClient.get('/usuario/meus-dados');
            const userData = response.data;
            
            renderAddresses(userData.enderecos);
            renderOrders(userData.pedidos);

        } catch (error) {
            // Se o erro NÃO for 401/403, o interceptor o repassará para cá
            if (!isSessionExpired) {
                console.error('Erro ao carregar dados do perfil:', error);
                // Exibe uma mensagem de erro genérica na página
                if (addressesContainer) addressesContainer.innerHTML = '<p class="error-message">Erro ao carregar endereços. Tente recarregar a página.</p>';
                if (ordersContainer) ordersContainer.innerHTML = '<p class="error-message">Erro ao carregar pedidos. Tente recarregar a página.</p>';
            }
        }
    };
    
    // --- MODAL DE ENDEREÇO ---
    const toggleModal = (show) => {
        if (addressModal && modalOverlay) {
            if (show) {
                addressModal.classList.add('active');
                modalOverlay.classList.add('active');
            } else {
                addressModal.classList.remove('active');
                modalOverlay.classList.remove('active');
            }
        }
    };

    if(openModalBtn) openModalBtn.addEventListener('click', () => toggleModal(true));
    if(closeModalBtn) closeModalBtn.addEventListener('click', () => toggleModal(false));
    if(modalOverlay) modalOverlay.addEventListener('click', () => toggleModal(false));

    // --- FORMULÁRIO DE ENDEREÇO ---
    if(addressForm) {
        addressForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitButton = addressForm.querySelector('button[type="submit"]');
            
            const newAddress = {
                cep: document.getElementById('cep').value,
                rua: document.getElementById('rua').value,
                numero: document.getElementById('numero').value,
                complemento: document.getElementById('complemento').value,
                cidade: document.getElementById('cidade').value,
                estado: document.getElementById('estado').value,
            };
    
            try {
                if (submitButton) submitButton.disabled = true;

                // O interceptor tratará o 403 (que será corrigido no backend)
                // ou o 401 se o token expirar
                await apiClient.post('/enderecos', newAddress);
                
                toggleModal(false); 
                loadProfileData(); // Recarrega os dados para mostrar o novo endereço
                addressForm.reset(); 
    
            } catch (error) {
                // Se o erro não for 401/403 (tratado pelo interceptor),
                // exibe um alerta de erro genérico.
                if (!isSessionExpired) {
                    console.error('Erro ao adicionar endereço:', error);
                    alert('Não foi possível salvar o endereço. Verifique os dados e tente novamente.');
                }
            } finally {
                 if (submitButton) submitButton.disabled = false;
            }
        });
    }

    // --- INICIALIZAÇÃO ---
    loadProfileData();
});