document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryTotal = document.getElementById('summary-total');
    const checkoutButton = document.getElementById('checkout-button');
    const token = localStorage.getItem('jwtToken');

    // Redireciona para o login se não houver token
    if (!token) {
        // --- CORREÇÃO APLICADA AQUI ---
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
        return JSON.parse(localStorage.getItem('cart')) || [];
    };

    const saveCart = (cart) => {
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart(); 
    };

    const renderCart = () => {
        const cart = getCart();

        // Redireciona para o catálogo se o carrinho estiver vazio
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
                    <p class="item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</p>
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
        summarySubtotal.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
        summaryTotal.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
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
            // Outros detalhes do pedido podem ser adicionados aqui se necessário
        };

        try {
            checkoutButton.disabled = true;
            checkoutButton.textContent = 'Processando...';

            await apiClient.post('/pedidos', pedido);
            
            alert('Pedido realizado com sucesso!');
            localStorage.removeItem('cart');
            
            // --- CORREÇÃO APLICADA AQUI ---
            window.location.href = '../../perfil/HTML/perfil.html';

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