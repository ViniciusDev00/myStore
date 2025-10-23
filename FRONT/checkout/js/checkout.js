document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryTotal = document.getElementById('summary-total');
    const checkoutButton = document.getElementById('checkout-button');
    
    // Elementos do formulário
    const addressSelectionContainer = document.getElementById('address-selection'); 
    const nomeDestinatarioEl = document.getElementById('nomeDestinatario');
    const cpfDestinatarioEl = document.getElementById('cpfDestinatario');
    const telefoneDestinatarioEl = document.getElementById('telefoneDestinatario');
    const observacoesEl = document.getElementById('observacoes');
    
    let selectedAddressId = null;

    // ============================================
    // CORREÇÃO CRÍTICA: Função para pegar token SEMPRE ATUALIZADO
    // ============================================
    const getApiClient = () => {
        const token = localStorage.getItem('jwtToken');
        
        if (!token) {
            console.error('❌ Token não encontrado no localStorage');
            alert('Sua sessão expirou. Redirecionando para login...');
            window.location.href = '../../login/HTML/login.html';
            return null;
        }

        console.log('🔑 Token atual:', token.substring(0, 30) + '...');
        
        return axios.create({
            baseURL: 'https://api.japauniverse.com.br/api',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    };

    // Verifica token inicial
    const initialToken = localStorage.getItem('jwtToken');
    if (!initialToken) {
        console.error('❌ Sem token inicial, redirecionando...');
        window.location.href = '../../login/HTML/login.html';
        return;
    }

    // ============================================
    // FUNÇÕES DO CARRINHO
    // ============================================
    const getCart = () => {
        return JSON.parse(localStorage.getItem('japaUniverseCart')) || [];
    };

    const saveCart = (cart) => {
        localStorage.setItem('japaUniverseCart', JSON.stringify(cart));
        renderCart();
        if (window.updateCartCounter) {
            window.updateCartCounter();
        }
    };

    // ============================================
    // BUSCAR ENDEREÇOS DO USUÁRIO
    // ============================================
    const fetchUserAddresses = async () => {
        try {
            console.log('📍 Buscando endereços do usuário...');
            const apiClient = getApiClient();
            if (!apiClient) return [];

            const response = await apiClient.get('/usuario/meus-dados');
            console.log('✅ Endereços carregados:', response.data.enderecos);
            return response.data.enderecos || [];
        } catch (error) {
            console.error('❌ Erro ao buscar endereços:', error);
            
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Dados:', error.response.data);
                
                if (error.response.status === 401 || error.response.status === 403) {
                    alert('Sua sessão expirou. Faça login novamente.');
                    localStorage.removeItem('jwtToken');
                    window.location.href = '../../login/HTML/login.html';
                }
            }
            return [];
        }
    };

    // ============================================
    // RENDERIZAR ENDEREÇOS
    // ============================================
    const renderAddressSelection = (addresses) => {
        if (!addressSelectionContainer) {
            console.error('❌ Container de endereços não encontrado');
            return;
        }

        if (!addresses || addresses.length === 0) {
            console.warn('⚠️ Nenhum endereço cadastrado');
            alert('Nenhum endereço cadastrado. Por favor, adicione um endereço para continuar.');
            window.location.href = '../../perfil/HTML/perfil.html#add-address';
            return;
        }

        addressSelectionContainer.innerHTML = `
            <div class="address-list">
                ${addresses.map((addr, index) => `
                    <label class="address-option">
                        <input type="radio" name="selectedAddress" value="${addr.id}" ${index === 0 ? 'checked' : ''}>
                        <div class="address-details">
                            <p><strong>${addr.rua}, ${addr.numero} ${addr.complemento || ''}</strong></p>
                            <p>${addr.cidade}, ${addr.estado} - CEP: ${addr.cep}</p>
                        </div>
                    </label>
                `).join('')}
            </div>
            <a href="../../perfil/HTML/perfil.html" class="add-address-link">Gerenciar Endereços</a>
        `;

        selectedAddressId = addresses[0].id;
        console.log('✅ Endereço inicial selecionado:', selectedAddressId);

        addressSelectionContainer.querySelectorAll('input[name="selectedAddress"]').forEach(radio => {
            radio.addEventListener('change', (event) => {
                selectedAddressId = event.target.value;
                console.log('📍 Novo endereço selecionado:', selectedAddressId);
            });
        });
    };

    // ============================================
    // RENDERIZAR CARRINHO
    // ============================================
    const renderCart = () => {
        const cart = getCart();
        if (!cartItemsContainer || !checkoutButton) return;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <h3>Seu carrinho está vazio.</h3>
                    <p>Adicione produtos do nosso catálogo.</p>
                    <a href="../../catalogo/HTML/catalogo.html" class="btn btn-primary">Ver produtos</a>
                </div>`;
            checkoutButton.disabled = true;
            updateSummary(0);
            return;
        }

        checkoutButton.disabled = false;
        cartItemsContainer.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="item-image">
                <div class="item-details">
                    <h3 class="item-name">${item.name}</h3>
                    <p class="item-size">Tamanho: ${item.size}</p>
                    <p class="item-price">R$ ${parseFloat(item.price).toFixed(2).replace('.', ',')}</p>
                </div>
                <div class="item-actions">
                    <div class="quantity-control">
                        <button class="quantity-btn decrease-qty" data-index="${index}" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                        <input type="number" value="${item.quantity}" class="item-quantity" data-index="${index}" readonly>
                        <button class="quantity-btn increase-qty" data-index="${index}">+</button>
                    </div>
                    <button class="remove-item" data-index="${index}" title="Remover item">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `).join('');

        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        updateSummary(subtotal);
        attachEventListeners();
    };

    const updateSummary = (subtotal) => {
        const total = subtotal;
        if (summarySubtotal) summarySubtotal.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
        if (summaryTotal) summaryTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    };

    const removeItemFromCart = (index) => {
        let cart = getCart();
        cart.splice(index, 1);
        saveCart(cart);
    };

    const updateQuantity = (index, change) => {
        let cart = getCart();
        if (cart[index]) {
            cart[index].quantity += change;
            if (cart[index].quantity <= 0) {
                cart[index].quantity = 1;
            }
            saveCart(cart);
        }
    };

    const attachEventListeners = () => {
        const oldListeners = cartItemsContainer.querySelectorAll('.quantity-btn, .remove-item');
        oldListeners.forEach(el => {
            const newEl = el.cloneNode(true);
            el.parentNode.replaceChild(newEl, el);
        });

        cartItemsContainer.addEventListener('click', (e) => {
            const target = e.target;
            const button = target.closest('button');

            if (!button) return;

            const index = button.dataset.index;
            if (index === undefined) return;

            const itemIndex = parseInt(index);

            if (button.classList.contains('remove-item')) {
                removeItemFromCart(itemIndex);
            } else if (button.classList.contains('decrease-qty')) {
                updateQuantity(itemIndex, -1);
            } else if (button.classList.contains('increase-qty')) {
                updateQuantity(itemIndex, 1);
            }
        });
    };

    // ============================================
    // PRÉ-PREENCHER DADOS DO DESTINATÁRIO
    // ============================================
    const preencherDadosDestinatario = async () => {
        try {
            console.log('📝 Pré-preenchendo dados do destinatário...');
            const apiClient = getApiClient();
            if (!apiClient) return;

            const response = await apiClient.get('/usuario/meus-dados');
            const usuario = response.data;
            
            if (usuario) {
                if (usuario.nome && nomeDestinatarioEl) {
                    nomeDestinatarioEl.value = usuario.nome;
                }
                if (usuario.cpf && cpfDestinatarioEl) {
                    cpfDestinatarioEl.value = usuario.cpf;
                }
                if (usuario.telefone && telefoneDestinatarioEl) {
                    telefoneDestinatarioEl.value = usuario.telefone;
                }
                console.log('✅ Dados pré-preenchidos com sucesso');
            }
        } catch (error) {
            console.warn('⚠️ Não foi possível pré-preencher dados:', error);
        }
    };

    // ============================================
    // FINALIZAR COMPRA
    // ============================================
    const handleCheckout = async () => {
        console.log('🛒 Iniciando processo de checkout...');
        
        const cart = getCart();
        if (cart.length === 0) {
            alert("Seu carrinho está vazio.");
            return;
        }

        // Validação do endereço
        if (!selectedAddressId) {
            alert('Por favor, selecione um endereço de entrega.');
            addressSelectionContainer?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        // Validação dos dados do destinatário
        const nomeDestinatario = nomeDestinatarioEl.value.trim();
        const cpfDestinatario = cpfDestinatarioEl.value.trim();
        const telefoneDestinatario = telefoneDestinatarioEl.value.trim();
        const observacoes = observacoesEl.value.trim();

        if (!nomeDestinatario) {
            alert('Por favor, preencha o Nome Completo do destinatário.');
            nomeDestinatarioEl.focus();
            return;
        }
        if (!cpfDestinatario) {
            alert('Por favor, preencha o CPF do destinatário.');
            cpfDestinatarioEl.focus();
            return;
        }
        if (!telefoneDestinatario) {
            alert('Por favor, preencha o Telefone do destinatário.');
            telefoneDestinatarioEl.focus();
            return;
        }

        // Preparação dos itens
        const pedidoItens = cart.map(item => ({
            produtoId: parseInt(item.id),
            quantidade: item.quantity,
            tamanho: item.size
        }));

        // Objeto de checkout completo
        const checkoutData = {
            itens: pedidoItens,
            enderecoEntregaId: parseInt(selectedAddressId),
            nomeDestinatario: nomeDestinatario,
            cpfDestinatario: cpfDestinatario,
            telefoneDestinatario: telefoneDestinatario,
            observacoes: observacoes
        };

        console.log('📦 Dados do checkout:', checkoutData);

        try {
            checkoutButton.disabled = true;
            checkoutButton.textContent = 'Processando...';

            // ============================================
            // CORREÇÃO CRÍTICA: Pega novo apiClient com token atualizado
            // ============================================
            const apiClient = getApiClient();
            if (!apiClient) {
                checkoutButton.disabled = false;
                checkoutButton.textContent = 'Finalizar Compra';
                return;
            }

            console.log('🚀 Enviando pedido para API...');
            const response = await apiClient.post('/pedidos', checkoutData);
            console.log('✅ Resposta da API:', response.data);

            const novoPedido = response.data;

            // Limpa o carrinho
            localStorage.removeItem('japaUniverseCart');
            if (window.updateCartCounter) {
                window.updateCartCounter();
            }

            // Salva dados na sessão
            sessionStorage.setItem('ultimoPedidoId', novoPedido.id);
            sessionStorage.setItem('ultimoPedidoValor', novoPedido.valorTotal);
            sessionStorage.setItem('ultimoPedidoPixCode', novoPedido.pixCopiaECola);

            console.log('✅ Redirecionando para pagamento...');
            window.location.href = `../../pagamento/HTML/pagamento.html`;

        } catch (error) {
            console.error('❌ Erro ao finalizar compra:', error);
            
            let errorMsg = 'Não foi possível processar seu pedido. Por favor, tente novamente.';
            
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Dados:', error.response.data);
                
                if (error.response.data && error.response.data.message) {
                    errorMsg = error.response.data.message;
                } else if (error.response.status === 401 || error.response.status === 403) {
                    errorMsg = 'Sua sessão expirou ou você não tem permissão. Faça login novamente.';
                    localStorage.removeItem('jwtToken');
                    setTimeout(() => {
                        window.location.href = '../../login/HTML/login.html';
                    }, 2000);
                }
            }
            
            alert(errorMsg);
            checkoutButton.disabled = false;
            checkoutButton.textContent = 'Finalizar Compra';
        }
    };

    // ============================================
    // INICIALIZAÇÃO
    // ============================================
    const initializeCheckoutPage = async () => {
        console.log('🚀 Inicializando página de checkout...');
        
        renderCart();
        
        if (getCart().length === 0) {
            if (addressSelectionContainer) {
                addressSelectionContainer.innerHTML = '<p>Adicione itens ao carrinho para continuar.</p>';
            }
            const recipientCard = document.getElementById('recipient-info')?.closest('.checkout-card');
            if (recipientCard) recipientCard.style.display = 'none';
            return;
        }

        const userAddresses = await fetchUserAddresses();
        renderAddressSelection(userAddresses);
        preencherDadosDestinatario();
    };

    // Event listener do botão
    if (checkoutButton) {
        checkoutButton.addEventListener('click', handleCheckout);
    }

    // Inicia
    initializeCheckoutPage();
});