document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryTotal = document.getElementById('summary-total');
    const checkoutButton = document.getElementById('checkout-button');
    const token = localStorage.getItem('jwtToken');

    if (!token) {
        window.location.href = '../../login/HTML/login.html'; 
        return;
    }

    const apiClient = axios.create({
        baseURL: 'https://api.japauniverse.com.br/api',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const getCart = () => {
        return JSON.parse(localStorage.getItem('japaUniverseCart')) || [];
    };

    const saveCart = (cart) => {
        localStorage.setItem('japaUniverseCart', JSON.stringify(cart));
        renderCart();
        // Atualiza o contador do header globalmente
        if (window.updateCartCounter) {
            window.updateCartCounter();
        }
    };

    const renderCart = () => {
        const cart = getCart();

        if (!cartItemsContainer || !checkoutButton) return;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <h3>Seu carrinho está vazio.</h3>
                    <p>Adicione produtos do nosso catálogo para continuar.</p>
                    <a href="../../catalogo/HTML/catalogo.html" class="btn btn-primary">Ver produtos</a>
                </div>
            `;
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
        const total = subtotal; // Adicionar frete aqui se necessário
        if (summarySubtotal) summarySubtotal.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
        if (summaryTotal) summaryTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    };

    const attachEventListeners = () => {
        cartItemsContainer.addEventListener('click', (e) => {
            const target = e.target;
            
            // Botão de remover
            if (target.closest('.remove-item')) {
                const index = target.closest('.remove-item').dataset.index;
                removeItemFromCart(parseInt(index));
            }
            
            // Botão de diminuir quantidade
            if (target.classList.contains('decrease-qty')) {
                const index = target.dataset.index;
                updateQuantity(parseInt(index), -1);
            }

            // Botão de aumentar quantidade
            if (target.classList.contains('increase-qty')) {
                const index = target.dataset.index;
                updateQuantity(parseInt(index), 1);
            }
        });
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

    const handleCheckout = async () => {
        const cart = getCart();
        if (cart.length === 0) {
            alert("Seu carrinho está vazio.");
            return;
        }

        const pedidoItens = cart.map(item => ({
            produtoId: parseInt(item.id),
            quantidade: item.quantity,
            tamanho: item.size
        }));

        try {
            checkoutButton.disabled = true;
            checkoutButton.textContent = 'Processando...';

            const response = await apiClient.post('/pedidos', pedidoItens);
            
            const novoPedido = response.data;
            
            alert('Pedido criado com sucesso! Você será redirecionado para a página de detalhes do pedido.');
            localStorage.removeItem('japaUniverseCart');
            
            // Redireciona para a página de perfil ou uma página de sucesso do pedido
            window.location.href = `../../perfil/HTML/perfil.html`;

        } catch (error) {
            console.error('Erro ao finalizar a compra:', error);
            alert('Não foi possível processar seu pedido. Por favor, tente novamente.');
            checkoutButton.disabled = false;
            checkoutButton.textContent = 'Finalizar Compra';
        }
    };

    if(checkoutButton) {
        checkoutButton.addEventListener('click', handleCheckout);
    }

    renderCart();
});