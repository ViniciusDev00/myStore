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
        // --- CORREÇÃO APLICADA AQUI: Usando a chave correta do carrinho ---
        return JSON.parse(localStorage.getItem('japaUniverseCart')) || [];
    };

    const saveCart = (cart) => {
        // --- CORREÇÃO APLICADA AQUI: Usando a chave correta do carrinho ---
        localStorage.setItem('japaUniverseCart', JSON.stringify(cart));
        renderCart(); 
    };

    const renderCart = () => {
        const cart = getCart();

        if (!cartItemsContainer || !checkoutButton) return;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <p>Seu carrinho está vazio.</p>
                    <a href="../../catalogo/HTML/catalogo.html" class="btn btn-primary">Ver produtos</a>
                </div>
            `;
            checkoutButton.disabled = true;
            updateSummary(0);
            return;
        }

        cartItemsContainer.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="item-image">
                <div class="item-details">
                    <h3 class="item-name">${item.name}</h3>
                    <p class="item-size">Tamanho: ${item.size}</p>
                    <p class="item-price">R$ ${parseFloat(item.price).toFixed(2).replace('.', ',')}</p>
                </div>
                <div class="item-actions">
                    <input type="number" value="${item.quantity}" min="1" class="item-quantity" data-index="${index}" readonly>
                    <button class="remove-item" data-index="${index}"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
        `).join('');

        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        updateSummary(subtotal);
        attachEventListeners();
    };

    const updateSummary = (subtotal) => {
        if (summarySubtotal) summarySubtotal.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
        if (summaryTotal) summaryTotal.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    };

    const attachEventListeners = () => {
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.currentTarget.dataset.index;
                removeItemFromCart(index);
            });
        });
    };

    const removeItemFromCart = (index) => {
        let cart = getCart();
        cart.splice(index, 1);
        saveCart(cart);
    };

    const handleCheckout = async () => {
        const cart = getCart();
        if (cart.length === 0) {
            alert("Seu carrinho está vazio.");
            return;
        }

        const pedido = {
            itens: cart.map(item => ({
                produtoId: item.id,
                quantidade: item.quantity,
                tamanho: item.size
            })),
        };

        try {
            checkoutButton.disabled = true;
            checkoutButton.textContent = 'Processando...';

            // ATENÇÃO: A lógica aqui foi alterada para criar o pedido e redirecionar para o pagamento
            const response = await apiClient.post('/pedidos', cart.map(item => ({
                id: item.id,
                quantity: item.quantity,
                size: item.size
            })));
            
            const novoPedido = response.data;
            
            alert('Pedido realizado com sucesso! Você será redirecionado para o pagamento.');
            localStorage.removeItem('japaUniverseCart');
            
            window.location.href = `../pagamento/HTML/pagamento.html?pedidoId=${novoPedido.id}`;

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