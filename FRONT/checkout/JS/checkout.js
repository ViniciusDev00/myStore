document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        window.location.href = '../../login/HTML/login.html';
        return;
    }

    const apiClient = axios.create({
        baseURL: 'https://www.japauniverse.com.br/api',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const summaryItemsContainer = document.getElementById('summary-items');
    const summaryTotalPriceEl = document.getElementById('summary-total-price');
    const addressesContainer = document.getElementById('addresses-container');
    const finalizeBtn = document.getElementById('finalize-order-btn');
    const messageEl = document.getElementById('checkout-message');

    const cart = JSON.parse(localStorage.getItem("japaUniverseCart")) || [];

    const formatPrice = (price) => `R$ ${price.toFixed(2).replace('.', ',')}`;

    const renderSummary = () => {
        if (cart.length === 0) {
            summaryItemsContainer.innerHTML = '<p>Seu carrinho está vazio.</p>';
            finalizeBtn.disabled = true;
            finalizeBtn.textContent = 'Carrinho Vazio';
            return;
        }

        summaryItemsContainer.innerHTML = cart.map(item => `
            <div class="summary-item">
                <img src="${item.image}" alt="${item.name}" class="summary-item-img">
                <div class="summary-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.quantity} x ${formatPrice(item.price)}</p>
                    <p>Tamanho: ${item.size}</p>
                </div>
                <div class="summary-item-price">${formatPrice(item.quantity * item.price)}</div>
            </div>
        `).join('');

        const totalPrice = cart.reduce((total, item) => total + (item.quantity * item.price), 0);
        summaryTotalPriceEl.textContent = formatPrice(totalPrice);
    };

    const loadAddresses = async () => {
        try {
            const response = await apiClient.get('/usuario/meus-dados');
            const addresses = response.data.enderecos;

            if (!addresses || addresses.length === 0) {
                addressesContainer.innerHTML = '<p>Nenhum endereço cadastrado. Por favor, <a href="../../perfil/HTML/perfil.html">adicione um endereço no seu perfil</a> para continuar.</p>';
                finalizeBtn.disabled = true;
                return;
            }

            addressesContainer.innerHTML = addresses.map((addr) => `
                <div class="address-card" data-address-id="${addr.id}">
                    <p><strong>${addr.rua}, ${addr.numero}</strong></p>
                    <p>${addr.cidade}, ${addr.estado} - CEP: ${addr.cep}</p>
                </div>
            `).join('');
            
            // Adiciona evento de clique para seleção de endereço
            document.querySelectorAll('.address-card').forEach(card => {
                card.addEventListener('click', () => {
                    document.querySelectorAll('.address-card').forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                });
            });

        } catch (error) {
            console.error('Erro ao carregar endereços:', error);
            addressesContainer.innerHTML = '<p>Ocorreu um erro ao carregar seus endereços.</p>';
        }
    };

    const finalizeOrder = async () => {
        const selectedAddress = document.querySelector('.address-card.selected');
        if (!selectedAddress) {
            messageEl.textContent = 'Por favor, selecione um endereço de entrega.';
            messageEl.style.color = 'red';
            return;
        }
        
        messageEl.textContent = 'A processar o seu pedido...';
        messageEl.style.color = 'white';
        finalizeBtn.disabled = true;

        try {
            // Envia o pedido para o backend para ser criado
            const response = await apiClient.post('/pedidos', cart);
            const novoPedido = response.data;
            
            messageEl.textContent = 'Pedido realizado com sucesso! A redirecionar para pagamento...';
            messageEl.style.color = 'green';

            // Limpa o carrinho
            localStorage.removeItem('japaUniverseCart');
            
            // Redireciona para a página de pagamento com o ID do novo pedido
            setTimeout(() => {
                window.location.href = `../../pagamento/HTML/pagamento.html?pedidoId=${novoPedido.id}`;
            }, 2000);

        } catch (error) {
            console.error('Erro ao finalizar pedido:', error);
            messageEl.textContent = 'Ocorreu um erro ao finalizar o seu pedido. Tente novamente.';
            messageEl.style.color = 'red';
            finalizeBtn.disabled = false;
        }
    };

    renderSummary();
    loadAddresses();
    finalizeBtn.addEventListener('click', finalizeOrder);
});
