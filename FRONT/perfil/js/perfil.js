document.addEventListener('DOMContentLoaded', () => {
    const addressesContainer = document.getElementById('addresses-container');
    const ordersContainer = document.getElementById('orders-container');
    
    // REVERTIDO PARA A CHAVE CORRETA QUE MANTÉM O LOGIN
    const token = localStorage.getItem('jwtToken'); 
    
    const addressModal = document.getElementById('address-modal');
    const modalOverlay = document.getElementById('address-modal-overlay');
    const openModalBtn = document.querySelector('.btn.btn-primary');
    const closeModalBtn = document.getElementById('close-address-modal');
    const addressForm = document.getElementById('address-form');

    // Elementos do Formulário (Obrigatório ter estes IDs no HTML do formulário)
    const cepInput = document.getElementById('cep');
    const ruaInput = document.getElementById('rua');
    const cidadeInput = document.getElementById('cidade');
    const estadoInput = document.getElementById('estado');

    if (!token) {
        window.location.href = '/FRONT/login/HTML/login.html';
        return;
    }

    const apiClient = axios.create({
        baseURL: 'http://localhost:8080/api',
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

    // --- NOVA FUNÇÃO: CONSULTA CEP E PREENCHIMENTO ---
    const fillAddressByCep = async () => {
        let cep = cepInput.value.replace(/\D/g, ''); // Remove caracteres não numéricos
        
        // Verifica se o CEP tem 8 dígitos
        if (cep.length !== 8) {
            return;
        }

        // Limpa os campos de endereço enquanto espera
        ruaInput.value = '...';
        cidadeInput.value = '...';
        estadoInput.value = '...';
        
        try {
            const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
            const data = response.data;

            if (!data.erro) {
                // Preenche os campos com os dados da API
                ruaInput.value = data.logradouro;
                cidadeInput.value = data.localidade;
                estadoInput.value = data.uf;
                
                // Move o foco para o campo 'Número'
                document.getElementById('numero').focus();
                
            } else {
                // Se o CEP não for encontrado
                alert('CEP não encontrado. Por favor, preencha o endereço manualmente.');
                ruaInput.value = '';
                cidadeInput.value = '';
                estadoInput.value = '';
            }

        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            alert('Erro ao comunicar com o serviço de CEP. Tente novamente.');
            ruaInput.value = '';
            cidadeInput.value = '';
            estadoInput.value = '';
        }
    };
    // --- FIM DA NOVA FUNÇÃO ---

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
        const recentOrders = orders.slice(0, 3);
        ordersContainer.innerHTML = recentOrders.map(order => {
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
            const [userDataResponse, ordersResponse] = await Promise.all([
                apiClient.get('/usuario/meus-dados'),
                apiClient.get('/pedidos')
            ]);

            const userData = userDataResponse.data;
            const ordersData = ordersResponse.data;
            
            renderAddresses(userData.enderecos);
            renderOrders(ordersData);

        } catch (error) {
            console.error('Erro ao carregar dados do perfil:', error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                localStorage.removeItem('jwtToken'); 
                window.location.href = '/FRONT/login/HTML/login.html';
            }
        }
    };
    
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

    // --- NOVO LISTENER: Chama a consulta quando o CEP perde o foco ---
    if (cepInput) {
        cepInput.addEventListener('blur', fillAddressByCep);
    }
    // --- FIM NOVO LISTENER ---

    if(addressForm) {
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
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                     alert('Não foi possível salvar o endereço. Sua sessão pode ter expirado ou você não tem permissão.');
                     localStorage.removeItem('jwtToken');
                     window.location.href = '/FRONT/login/HTML/login.html';
                } else {
                     alert('Não foi possível salvar o endereço. Tente novamente.');
                }
            }
        });
    }

    loadProfileData();
});