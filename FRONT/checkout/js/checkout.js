document.addEventListener('DOMContentLoaded', () => {
    // --- MANTENHA AS VARIÁVEIS EXISTENTES ---
    const cartItemsContainer = document.getElementById('cart-items-container');
    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryTotal = document.getElementById('summary-total');
    const checkoutButton = document.getElementById('checkout-button');
    const token = localStorage.getItem('jwtToken');

    // --- NOVA VARIÁVEL E ELEMENTO ---
    const addressSelectionContainer = document.getElementById('address-selection'); // Adicione esta linha
    let selectedAddressId = null; // Para guardar o ID do endereço selecionado
    // --- FIM NOVAS VARIÁVEIS ---

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

    // --- NOVA FUNÇÃO: Buscar Endereços ---
    const fetchUserAddresses = async () => {
        try {
            // Usa o endpoint que já existe no seu UsuarioController
            const response = await apiClient.get('/usuario/meus-dados');
            // Retorna a lista de endereços do DTO (ou um array vazio se não houver)
            return response.data.enderecos || [];
        } catch (error) {
            console.error('Erro ao buscar endereços:', error);
            // Lida com erro de autenticação (sessão expirada)
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                 alert('Sua sessão expirou. Faça login novamente.');
                 localStorage.removeItem('jwtToken');
                 window.location.href = '../../login/HTML/login.html'; // Corrigido para caminho absoluto
            }
            return []; // Retorna array vazio em caso de outros erros
        }
    };
    // --- FIM Buscar Endereços ---

    // --- NOVA FUNÇÃO: Renderizar Seleção de Endereço ou Redirecionar ---
    const renderAddressSelection = (addresses) => {
        if (!addressSelectionContainer) {
            console.error("Elemento 'address-selection' não encontrado no HTML.");
            return; // Sai se o container não existir no HTML
        }

        // Verifica se a lista de endereços está vazia ou não existe
        if (!addresses || addresses.length === 0) {
            // Alerta o usuário e redireciona para a página de perfil
            alert('Nenhum endereço cadastrado. Por favor, adicione um endereço para continuar.');
            // Redireciona para a página de perfil, idealmente para uma seção específica de adicionar endereço
            // Ajuste '#add-address' se o ID da seção for diferente no seu perfil.html
            window.location.href = '../../perfil/HTML/perfil.html#add-address';
            return; // Interrompe a execução aqui
        }

        // Se houver endereços, monta o HTML para exibição
        addressSelectionContainer.innerHTML = `
            <h2 class="address-title">Selecione o Endereço de Entrega</h2>
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

        // Define o primeiro endereço como selecionado por padrão
        selectedAddressId = addresses[0].id;
        console.log("Endereço inicial selecionado:", selectedAddressId);


        // Adiciona listeners para atualizar 'selectedAddressId' quando o usuário mudar a seleção
        addressSelectionContainer.querySelectorAll('input[name="selectedAddress"]').forEach(radio => {
            radio.addEventListener('change', (event) => {
                selectedAddressId = event.target.value; // Pega o ID do endereço do 'value' do radio
                console.log("Novo endereço selecionado:", selectedAddressId);
            });
        });
    };
    // --- FIM Renderizar Seleção ---

    // --- MANTENHA renderCart, updateSummary, attachEventListeners, removeItemFromCart, updateQuantity ---
     const renderCart = () => {
        const cart = getCart();
        if (!cartItemsContainer || !checkoutButton) return;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `<div class="empty-cart"><h3>Seu carrinho está vazio.</h3><p>Adicione produtos do nosso catálogo.</p><a href="../../catalogo/HTML/catalogo.html" class="btn btn-primary">Ver produtos</a></div>`;
            checkoutButton.disabled = true;
            updateSummary(0);
            // Se o carrinho esvaziar, talvez esconder ou limpar a seção de endereço? (Opcional)
            // if(addressSelectionContainer) addressSelectionContainer.innerHTML = '';
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
        attachEventListeners(); // Reanexa listeners após renderizar
    };

    const updateSummary = (subtotal) => {
        const total = subtotal; // Frete Grátis
        if (summarySubtotal) summarySubtotal.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
        if (summaryTotal) summaryTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    };

    const removeItemFromCart = (index) => {
        let cart = getCart();
        cart.splice(index, 1);
        saveCart(cart); // Salvar e re-renderizar
    };

    const updateQuantity = (index, change) => {
        let cart = getCart();
        if (cart[index]) {
            cart[index].quantity += change;
            if (cart[index].quantity <= 0) {
                cart[index].quantity = 1; // Não permite quantidade 0 ou negativa
            }
            saveCart(cart); // Salvar e re-renderizar
        }
    };

    const attachEventListeners = () => {
        // Remove listeners antigos para evitar duplicação (se houver)
        const currentListeners = cartItemsContainer.querySelectorAll('.quantity-btn, .remove-item');
        currentListeners.forEach(el => {
            const newEl = el.cloneNode(true);
            el.parentNode.replaceChild(newEl, el);
        });

        // Adiciona novos listeners
        cartItemsContainer.addEventListener('click', (e) => {
            const target = e.target;
            const button = target.closest('button'); // Pega o botão mais próximo

            if (!button) return; // Sai se não clicou em um botão

            const index = button.dataset.index;
            if (index === undefined) return; // Sai se o botão não tem data-index

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

    // --- AJUSTE NA FUNÇÃO handleCheckout ---
    const handleCheckout = async () => {
        const cart = getCart();
        if (cart.length === 0) {
            alert("Seu carrinho está vazio.");
            return;
        }

        // <<< ADICIONADO: Verificação se um endereço foi selecionado >>>
        if (!selectedAddressId) {
            alert('Por favor, selecione um endereço de entrega.');
            // Opcional: Rolar a página para a seção de endereços
            addressSelectionContainer?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return; // Impede o prosseguimento
        }
        // <<< FIM ADIÇÃO >>>

        const pedidoItens = cart.map(item => ({
            produtoId: parseInt(item.id),
            quantidade: item.quantity,
            tamanho: item.size
        }));

        // <<< ADICIONADO: Novo objeto para enviar ao backend >>>
        const checkoutData = {
            itens: pedidoItens,
            enderecoEntregaId: parseInt(selectedAddressId) // Inclui o ID do endereço selecionado
        };
        // <<< FIM ADIÇÃO >>>

        try {
            checkoutButton.disabled = true;
            checkoutButton.textContent = 'Processando...';

            // <<< MODIFICADO: Envia 'checkoutData' em vez de apenas 'pedidoItens' >>>
            const response = await apiClient.post('/pedidos', checkoutData);
            // <<< FIM MODIFICAÇÃO >>>

            const novoPedido = response.data;

            localStorage.removeItem('japaUniverseCart');
            if (window.updateCartCounter) {
                window.updateCartCounter();
            }

            // --- MANTENHA O ARMAZENAMENTO NA SESSÃO ---
            sessionStorage.setItem('ultimoPedidoId', novoPedido.id);
            sessionStorage.setItem('ultimoPedidoValor', novoPedido.valorTotal);
            sessionStorage.setItem('ultimoPedidoPixCode', novoPedido.pixCopiaECola);
            // --- FIM MANTER ---

            window.location.href = `../../pagamento/HTML/pagamento.html`;

        } catch (error) {
            // --- MANTENHA O TRATAMENTO DE ERROS ---
            console.error('Erro ao finalizar a compra:', error);
            let errorMsg = 'Não foi possível processar seu pedido. Por favor, tente novamente.';
            if (error.response && error.response.data && error.response.data.message) {
                 errorMsg = error.response.data.message; // Ex: Endereço inválido
            } else if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                errorMsg = 'Sua sessão expirou ou você não tem permissão. Faça login novamente.';
                localStorage.removeItem('jwtToken');
                window.location.href = '../../login/HTML/login.html'; // Corrigido para caminho absoluto
            }
            alert(errorMsg);
            checkoutButton.disabled = false;
            checkoutButton.textContent = 'Finalizar Compra';
            // --- FIM MANTER ---
        }
    };
    // --- FIM handleCheckout ---

     // --- NOVA LÓGICA DE INICIALIZAÇÃO ---
     const initializeCheckoutPage = async () => {
        renderCart(); // Renderiza o carrinho primeiro
        const userAddresses = await fetchUserAddresses(); // Depois busca os endereços
        // Só tenta renderizar os endereços se o carrinho não estiver vazio E houver endereços
        if (getCart().length > 0) {
             renderAddressSelection(userAddresses); // Renderiza a seleção ou redireciona
        }
    };
    // --- FIM INICIALIZAÇÃO ---

    if(checkoutButton) {
        checkoutButton.addEventListener('click', handleCheckout);
    }

    // Chama a função de inicialização ao carregar a página
    initializeCheckoutPage();

});