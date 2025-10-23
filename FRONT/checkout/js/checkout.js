document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DO DOM ---
    const cartItemsContainer = document.getElementById('cart-items-container');
    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryTotal = document.getElementById('summary-total');
    const checkoutButton = document.getElementById('checkout-button');
    const addressSelectionContainer = document.getElementById('address-selection');
    const nomeDestinatarioEl = document.getElementById('nomeDestinatario');
    const cpfDestinatarioEl = document.getElementById('cpfDestinatario');
    const telefoneDestinatarioEl = document.getElementById('telefoneDestinatario');
    const observacoesEl = document.getElementById('observacoes');
    
    // --- ESTADO ---
    let selectedAddressId = null; 
    let isSessionExpired = false; // Trava para evitar múltiplos alertas
    const token = localStorage.getItem('jwtToken');

    // --- VERIFICAÇÃO INICIAL DO TOKEN ---
    if (!token) {
        window.location.href = '../../login/HTML/login.html';
        return;
    }

    // --- CONFIGURAÇÃO DO CLIENTE API (AXIOS) ---
    const apiClient = axios.create({
        baseURL: 'https://api.japauniverse.com.br/api',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    // --- [MELHORIA] INTERCEPTOR GLOBAL DE AUTENTICAÇÃO ---
    // Isso captura erros 401/403 de QUALQUER requisição feita pelo apiClient
    apiClient.interceptors.response.use(
        (response) => response, // Se for sucesso, apenas continue
        (error) => {
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                // Evita múltiplos alertas se várias requisições falharem ao mesmo tempo
                if (!isSessionExpired) { 
                    isSessionExpired = true; // Marca que já estamos tratando
                    localStorage.removeItem('jwtToken');
                    alert('Sua sessão expirou ou você não tem permissão. Por favor, faça login novamente.');
                    window.location.href = '../../login/HTML/login.html';
                }
            }
            // Rejeita a promessa para que o .catch() local da função (ex: handleCheckout)
            // ainda possa tratar outros erros (ex: "produto sem estoque")
            return Promise.reject(error);
        }
    );
    // --- FIM DA MELHORIA ---


    // --- FUNÇÕES DO CARRINHO (LocalStorage) ---
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
    
    const clearCart = () => {
         localStorage.removeItem('japaUniverseCart');
         if (window.updateCartCounter) {
            window.updateCartCounter();
        }
    }
    // --- FIM FUNÇÕES DO CARRINHO ---


    // --- FUNÇÕES DA PÁGINA ---

    /**
     * [MELHORIA] Busca os endereços. Agora retorna 'null' em caso de erro,
     * para que 'renderAddressSelection' possa diferenciar "erro" de "lista vazia".
     */
    const fetchUserAddresses = async () => {
        try {
            const response = await apiClient.get('/usuario/meus-dados');
            return response.data.enderecos || []; // Retorna a lista (pode ser vazia)
        } catch (error) {
            // O interceptor já tratou o 401/403 e vai redirecionar.
            // Apenas logamos outros erros e retornamos 'null' para sinalizar falha.
            console.error('Erro ao buscar endereços:', error);
            return null; // Sinaliza que a busca FALHOU
        }
    };

    /**
     * [MELHORIA] Renderiza os endereços. Agora trata 3 casos:
     * 1. addresses === null (A API falhou)
     * 2. addresses.length === 0 (A API funcionou, mas não há endereços)
     * 3. addresses.length > 0 (A API funcionou e há endereços)
     */
    const renderAddressSelection = (addresses) => {
        if (!addressSelectionContainer) {
            console.error("Elemento 'address-selection' não encontrado no HTML.");
            return; 
        }

        // Caso 1: A busca de endereços falhou (ex: erro de rede, 500, etc.)
        if (addresses === null) {
            addressSelectionContainer.innerHTML = '<p class="checkout-error">Não foi possível carregar seus endereços. Tente recarregar a página.</p>';
            checkoutButton.disabled = true; // Desabilita a finalização
            return; 
        }

        // Caso 2: A busca funcionou, mas o usuário não tem endereços cadastrados
        if (addresses.length === 0) {
            // Não exibe mais o alerta aqui, pois o interceptor pode estar
            // redirecionando por 401. Se não for 401, o usuário verá a mensagem.
            if (!isSessionExpired) {
                 alert('Nenhum endereço cadastrado. Por favor, adicione um endereço para continuar.');
                 window.location.href = '../../perfil/HTML/perfil.html#add-address';
            }
            return; 
        }

        // Caso 3: Sucesso! Renderiza os endereços
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

        selectedAddressId = addresses[0].id; // Define o primeiro como padrão
        console.log("Endereço inicial selecionado:", selectedAddressId);

        addressSelectionContainer.querySelectorAll('input[name="selectedAddress"]').forEach(radio => {
            radio.addEventListener('change', (event) => {
                selectedAddressId = event.target.value; 
                console.log("Novo endereço selecionado:", selectedAddressId);
            });
        });
    };

     const renderCart = () => {
        const cart = getCart();
        if (!cartItemsContainer || !checkoutButton) return;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `<div class="empty-cart"><h3>Seu carrinho está vazio.</h3><p>Adicione produtos do nosso catálogo.</p><a href="../../catalogo/HTML/catalogo.html" class="btn btn-primary">Ver produtos</a></div>`;
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
                     <button class="remove-item" data-index="${index}" title="Remover item"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
        `).join('');

        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        updateSummary(subtotal);
        attachEventListeners(); 
    };

    const updateSummary = (subtotal) => {
        const total = subtotal; // Frete Grátis
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
        // Remove listeners antigos para evitar duplicação (boa prática)
        const oldContainer = cartItemsContainer;
        const newContainer = oldContainer.cloneNode(true);
        oldContainer.parentNode.replaceChild(newContainer, oldContainer);
        // Atualiza a referência da variável
        window.cartItemsContainer = newContainer; 

        newContainer.addEventListener('click', (e) => {
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

    /**
     * Tenta pré-preencher os dados do destinatário com os dados do usuário.
     * Não há problema se falhar, o interceptor cuidará do 401.
     */
    const preencherDadosDestinatario = async () => {
        try {
            const response = await apiClient.get('/usuario/meus-dados');
            const usuario = response.data;
            if (usuario) {
                if (usuario.nome && nomeDestinatarioEl) nomeDestinatarioEl.value = usuario.nome;
                if (usuario.cpf && cpfDestinatarioEl) cpfDestinatarioEl.value = usuario.cpf;
                if (usuario.telefone && telefoneDestinatarioEl) telefoneDestinatarioEl.value = usuario.telefone;
            }
        } catch (error) {
            // O interceptor já trata o 401. Outros erros são apenas logados.
            console.warn("Não foi possível pré-preencher os dados do destinatário.", error);
        }
    };

    // --- FUNÇÃO PRINCIPAL: FINALIZAR COMPRA ---
    const handleCheckout = async () => {
        const cart = getCart();
        if (cart.length === 0) {
            alert("Seu carrinho está vazio.");
            return;
        }

        // 1. Validação do Endereço
        if (!selectedAddressId) {
            alert('Por favor, selecione um endereço de entrega.');
            addressSelectionContainer?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return; 
        }

        // 2. Validação dos Dados do Destinatário
        const nomeDestinatario = nomeDestinatarioEl.value.trim();
        const cpfDestinatario = cpfDestinatarioEl.value.trim();
        const telefoneDestinatario = telefoneDestinatarioEl.value.trim();

        if (!nomeDestinatario || !cpfDestinatario || !telefoneDestinatario) {
            alert('Por favor, preencha todos os dados do destinatário (Nome, CPF e Telefone).');
            if (!nomeDestinatario) nomeDestinatarioEl.focus();
            else if (!cpfDestinatario) cpfDestinatarioEl.focus();
            else telefoneDestinatarioEl.focus();
            return;
        }
        
        // 3. Preparação dos Itens
        const pedidoItens = cart.map(item => ({
            produtoId: parseInt(item.id),
            quantidade: item.quantity,
            tamanho: item.size
        }));

        // 4. Objeto de Checkout completo
        const checkoutData = {
            itens: pedidoItens,
            enderecoEntregaId: parseInt(selectedAddressId),
            nomeDestinatario: nomeDestinatario,
            cpfDestinatario: cpfDestinatario,
            telefoneDestinatario: telefoneDestinatario,
            observacoes: observacoesEl.value.trim()
        };

        // 5. Envio para a API
        try {
            checkoutButton.disabled = true;
            checkoutButton.textContent = 'Processando...';

            const response = await apiClient.post('/pedidos', checkoutData);
            const novoPedido = response.data;

            clearCart();

            // Salva dados na sessão para a página de pagamento
            sessionStorage.setItem('ultimoPedidoId', novoPedido.id);
            sessionStorage.setItem('ultimoPedidoValor', novoPedido.valorTotal);
            sessionStorage.setItem('ultimoPedidoPixCode', novoPedido.pixCopiaECola);

            window.location.href = `../../pagamento/HTML/pagamento.html`;

        } catch (error) {
            // [MELHORIA] Bloco CATCH simplificado.
            // O interceptor já tratou o 401/403 (sessão expirada).
            // Só precisamos tratar outros erros (ex: "produto sem estoque").
            
            console.error('Erro ao finalizar a compra:', error);
            let errorMsg = 'Não foi possível processar seu pedido. Por favor, tente novamente.';
            
            if (error.response && error.response.data && error.response.data.message) {
                 errorMsg = error.response.data.message; 
            }
            
            // Só exibe o alerta se NÃO for um erro de sessão (que o interceptor já tratou)
            if (!isSessionExpired) {
                 alert(errorMsg);
            }
            
            checkoutButton.disabled = false;
            checkoutButton.textContent = 'Finalizar Compra';
        }
    };
    // --- FIM handleCheckout ---


     // --- INICIALIZAÇÃO DA PÁGINA ---
     const initializeCheckoutPage = async () => {
        renderCart(); // Renderiza o carrinho
        
        // Se o carrinho estiver vazio, não faz mais nada
        if (getCart().length === 0) {
            if(addressSelectionContainer) addressSelectionContainer.innerHTML = '<p>Adicione itens ao carrinho para continuar.</p>';
            const recipientCard = document.getElementById('recipient-info')?.closest('.checkout-card');
            if (recipientCard) recipientCard.style.display = 'none';
            return; 
        }

        // Se o carrinho não está vazio, busca dados
        const userAddresses = await fetchUserAddresses(); // Busca endereços
        
        // [MELHORIA] Se a busca de endereços falhou (userAddresses === null),
        // a função 'renderAddressSelection' já mostrou o erro e desabilitou o botão.
        // Só continuamos se a busca tiver sido bem-sucedida (mesmo que vazia).
        if (userAddresses !== null) {
            renderAddressSelection(userAddresses); 
            
            // Só preenchemos os dados se a API retornou endereços,
            // senão o 'renderAddressSelection' já redirecionou para o perfil.
            if (userAddresses.length > 0) {
                 preencherDadosDestinatario(); 
            }
        }
    };
    // --- FIM INICIALIZAÇÃO ---

    if(checkoutButton) {
        checkoutButton.addEventListener('click', handleCheckout);
    }

    // Chama a função de inicialização ao carregar a página
    initializeCheckoutPage();

});