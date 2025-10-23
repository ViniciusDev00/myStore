document.addEventListener('DOMContentLoaded', () => {
    // --- MANTENHA AS VARIÁVEIS EXISTENTES ---
    const cartItemsContainer = document.getElementById('cart-items-container');
    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryTotal = document.getElementById('summary-total');
    const checkoutButton = document.getElementById('checkout-button');
    const token = localStorage.getItem('jwtToken');

    // --- VARIÁVEL E ELEMENTO DE ENDEREÇO ---
    const addressSelectionContainer = document.getElementById('address-selection'); 
    let selectedAddressId = null; // Para guardar o ID do endereço selecionado
    
    // --- NOVOS ELEMENTOS DO FORMULÁRIO DE DESTINATÁRIO ---
    const nomeDestinatarioEl = document.getElementById('nomeDestinatario');
    const cpfDestinatarioEl = document.getElementById('cpfDestinatario');
    const telefoneDestinatarioEl = document.getElementById('telefoneDestinatario');
    const observacoesEl = document.getElementById('observacoes');
    // --- FIM NOVOS ELEMENTOS ---

    if (!token) {
        window.location.href = '../../login/HTML/login.html';
        return;
    }

    // --- MANTENHA A CONFIGURAÇÃO DO apiClient ---
    const apiClient = axios.create({
        baseURL: 'https://api.japauniverse.com.br/api',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    // --- MANTENHA getCart, saveCart ---
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
    // --- FIM getCart, saveCart ---

    // --- MANTENHA A FUNÇÃO: Buscar Endereços ---
    const fetchUserAddresses = async () => {
        try {
            const response = await apiClient.get('/usuario/meus-dados');
            return response.data.enderecos || [];
        } catch (error) {
            console.error('Erro ao buscar endereços:', error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                 alert('Sua sessão expirou. Faça login novamente.');
                 localStorage.removeItem('jwtToken');
                 window.location.href = '../../login/HTML/login.html'; 
            }
            return []; 
        }
    };
    // --- FIM Buscar Endereços ---

    // --- MANTENHA A FUNÇÃO: Renderizar Seleção de Endereço ---
    const renderAddressSelection = (addresses) => {
        if (!addressSelectionContainer) {
            console.error("Elemento 'address-selection' não encontrado no HTML.");
            return; 
        }

        if (!addresses || addresses.length === 0) {
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

        selectedAddressId = addresses[0].id; // Define o primeiro como padrão
        console.log("Endereço inicial selecionado:", selectedAddressId);

        addressSelectionContainer.querySelectorAll('input[name="selectedAddress"]').forEach(radio => {
            radio.addEventListener('change', (event) => {
                selectedAddressId = event.target.value; 
                console.log("Novo endereço selecionado:", selectedAddressId);
            });
        });
    };
    // --- FIM Renderizar Seleção ---

    // --- MANTENHA renderCart, updateSummary, removeItemFromCart, updateQuantity, attachEventListeners ---
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
        // Remove listeners antigos para evitar duplicação
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
    // --- FIM MANTER ---

    // --- NOVA FUNÇÃO: Pré-preencher dados do destinatário ---
    const preencherDadosDestinatario = async () => {
        try {
            // Busca os dados do usuário logado
            const response = await apiClient.get('/usuario/meus-dados');
            const usuario = response.data;
            if (usuario) {
                // Preenche os campos do novo formulário com os dados do usuário
                if (usuario.nome && nomeDestinatarioEl) {
                    nomeDestinatarioEl.value = usuario.nome;
                }
                if (usuario.cpf && cpfDestinatarioEl) {
                    cpfDestinatarioEl.value = usuario.cpf;
                }
                if (usuario.telefone && telefoneDestinatarioEl) {
                    telefoneDestinatarioEl.value = usuario.telefone;
                }
            }
        } catch (error) {
            console.warn("Não foi possível pré-preencher os dados do destinatário.", error);
        }
    };
    // --- FIM NOVA FUNÇÃO ---

    // --- ATUALIZAÇÃO DA FUNÇÃO handleCheckout ---
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

        // --- 2. NOVO: Validação dos Dados do Destinatário ---
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
        // --- FIM DA NOVA VALIDAÇÃO ---

        // 3. Preparação dos Itens
        const pedidoItens = cart.map(item => ({
            produtoId: parseInt(item.id),
            quantidade: item.quantity,
            tamanho: item.size
        }));

        // --- 4. NOVO: Objeto de Checkout completo ---
        const checkoutData = {
            itens: pedidoItens,
            enderecoEntregaId: parseInt(selectedAddressId),
            // Adiciona os novos campos
            nomeDestinatario: nomeDestinatario,
            cpfDestinatario: cpfDestinatario,
            telefoneDestinatario: telefoneDestinatario,
            observacoes: observacoes
        };
        // --- FIM NOVO OBJETO ---

        // 5. Envio para a API
        try {
            checkoutButton.disabled = true;
            checkoutButton.textContent = 'Processando...';

            // Envia o 'checkoutData' completo
            const response = await apiClient.post('/pedidos', checkoutData);

            const novoPedido = response.data;

            // Limpa o carrinho e atualiza o contador do header
            localStorage.removeItem('japaUniverseCart');
            if (window.updateCartCounter) {
                window.updateCartCounter();
            }

            // Salva dados na sessão para a página de pagamento
            sessionStorage.setItem('ultimoPedidoId', novoPedido.id);
            sessionStorage.setItem('ultimoPedidoValor', novoPedido.valorTotal);
            sessionStorage.setItem('ultimoPedidoPixCode', novoPedido.pixCopiaECola);

            // Redireciona para o pagamento
            window.location.href = `../../pagamento/HTML/pagamento.html`;

        } catch (error) {
            console.error('Erro ao finalizar a compra:', error);
            let errorMsg = 'Não foi possível processar seu pedido. Por favor, tente novamente.';
            if (error.response && error.response.data && error.response.data.message) {
                 errorMsg = error.response.data.message; 
            } else if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                errorMsg = 'Sua sessão expirou ou você não tem permissão. Faça login novamente.';
                localStorage.removeItem('jwtToken');
                window.location.href = '../../login/HTML/login.html'; 
            }
            alert(errorMsg);
            checkoutButton.disabled = false;
            checkoutButton.textContent = 'Finalizar Compra';
        }
    };
    // --- FIM handleCheckout ---

     // --- ATUALIZAÇÃO DA LÓGICA DE INICIALIZAÇÃO ---
     const initializeCheckoutPage = async () => {
        renderCart(); // Renderiza o carrinho
        
        // Se o carrinho estiver vazio, não faz mais nada
        if (getCart().length === 0) {
            if(addressSelectionContainer) addressSelectionContainer.innerHTML = '<p>Adicione itens ao carrinho para continuar.</p>';
            // Esconde o formulário de destinatário se o carrinho estiver vazio
            const recipientCard = document.getElementById('recipient-info')?.closest('.checkout-card');
            if (recipientCard) recipientCard.style.display = 'none';
            return; 
        }

        // Se o carrinho não está vazio, busca dados
        const userAddresses = await fetchUserAddresses(); // Busca endereços
        renderAddressSelection(userAddresses); // Renderiza endereços (ou redireciona)
        preencherDadosDestinatario(); // Pré-preenche o novo formulário
    };
    // --- FIM INICIALIZAÇÃO ---

    if(checkoutButton) {
        checkoutButton.addEventListener('click', handleCheckout);
    }

    // Chama a função de inicialização ao carregar a página
    initializeCheckoutPage();

});