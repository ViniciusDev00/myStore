document.addEventListener('DOMContentLoaded', () => {
    
    const token = localStorage.getItem('jwtToken');
    const baseImageUrl = 'http://localhost:8080/'; 
    
    // --- CONSTANTES DE PRAZOS DE ENTREGA ---
    const PRAZO_ENTREGA = {
        PRIORITARIA: {
            CORREIOS: '10-15 dias',
            RESIDENCIA: '18-23 dias'
        },
        PADRAO: {
            CORREIOS: '15-20 dias',
            RESIDENCIA: '23-28 dias'
        }
    };
    // ----------------------------------------

    if (!token) {
        window.location.href = '../../login/HTML/login.html';
        return;
    }
    
    // --- VARIÁVEIS DE ESTADO E REFERÊNCIA ---
    let selectedAddressId = null; 
    let currentSubtotal = 0; 

    // --- ELEMENTOS DO DOM (INCLUINDO ORIGINAIS E NOVOS) ---
    // Elementos originais
    const checkoutForm = document.getElementById('checkoutForm'); // Assume que existe no HTML
    const cartItemsContainer = document.getElementById('cart-items-container'); // Elemento para itens do carrinho (se usado fora do resumo)
    const summarySubtotal = document.getElementById('summary-subtotal'); // Original (pode ser o mesmo que summarySubtotalElement)
    const summaryTotal = document.getElementById('summary-total');     // Original (pode ser o mesmo que summaryTotalElement)
    const checkoutButton = document.getElementById('checkout-button'); // Botão principal de checkout

    // Elementos do Resumo do Pedido (Novos IDs ou renomeados)
    const summaryItemsContainer = document.getElementById('summaryItemsContainer');
    const summarySubtotalElement = document.getElementById('summarySubtotal');
    const summaryTotalElement = document.getElementById('summaryTotal');
    const taxaCaixaElement = document.getElementById('taxaCaixa');
    const taxaPrioritariaElement = document.getElementById('taxaPrioritaria');
    const comCaixaLine = document.querySelector('.com-caixa-line');
    const prioritariaLine = document.querySelector('.prioritaria-line');
    const prazoCorreiosElement = document.getElementById('prazoCorreios');
    const prazoResidenciaElement = document.getElementById('prazoResidencia');

    // Elementos de Endereço e Destinatário
    const addressSelectionContainer = document.getElementById('address-selection'); 
    const nomeDestinatarioEl = document.getElementById('nomeDestinatario');
    const cpfDestinatarioEl = document.getElementById('cpfDestinatario');
    const observacoesEl = document.getElementById('observacoes');
    
    // Elementos de Telefone e Validação
    const telefoneInput = document.getElementById('telefoneDestinatario'); // Campo Telefone principal
    const confirmacaoTelefoneInput = document.getElementById('confirmacaoTelefone'); // Campo de Confirmação
    const phoneMatchMessage = document.getElementById('phone-match-message');

    // Elementos de Opções
    const opcoesCaixa = document.querySelectorAll('input[name="opcaoCaixa"]');
    const opcoesPrioritaria = document.querySelectorAll('input[name="opcaoPrioritaria"]');


    // --- CONFIGURAÇÃO DO apiClient ---
    const apiClient = axios.create({
        baseURL: 'http://localhost:8080/api',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    // --- FUNÇÕES BÁSICAS DE CARRINHO ---
    const getCart = () => {
        return JSON.parse(localStorage.getItem('cart')) || []; 
    };

    const saveCart = (cart) => {
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
        if (window.updateCartCounter) {
            window.updateCartCounter();
        }
    };

    // Funções utilitárias
    const formatPrice = (price) => `R$ ${parseFloat(price).toFixed(2).replace('.', ',')}`;

    // --- FUNÇÃO DE CÁLCULO DE PREÇO E PRAZOS ---
    const updateOrderSummary = (subtotal) => {
        if (subtotal === undefined) subtotal = currentSubtotal;

        let finalTotal = subtotal;
        let taxaCaixaValor = 0;
        let taxaPrioritariaValor = 0;

        const comCaixa = document.getElementById('comCaixa')?.checked || false;
        const entregaPrioritaria = document.getElementById('entregaPrioritaria')?.checked || false;

        // 1. Cálculo da Taxa Caixa (5% do subtotal)
        if (comCaixa) {
            taxaCaixaValor = subtotal * 0.05;
            finalTotal += taxaCaixaValor;
            comCaixaLine?.classList.remove('hidden');
        } else {
            comCaixaLine?.classList.add('hidden');
        }

        // 2. Cálculo da Taxa Prioritária (5% do subtotal)
        if (entregaPrioritaria) {
            taxaPrioritariaValor = subtotal * 0.05;
            finalTotal += taxaPrioritariaValor;
            prioritariaLine?.classList.remove('hidden');
        } else {
            prioritariaLine?.classList.add('hidden');
        }
        
        finalTotal = parseFloat(finalTotal.toFixed(2));
        taxaCaixaValor = parseFloat(taxaCaixaValor.toFixed(2));
        taxaPrioritariaValor = parseFloat(taxaPrioritariaValor.toFixed(2));

        // 3. Atualizar elementos de resumo
        if (summarySubtotalElement) summarySubtotalElement.textContent = formatPrice(subtotal);
        if (taxaCaixaElement) taxaCaixaElement.textContent = formatPrice(taxaCaixaValor);
        if (taxaPrioritariaElement) taxaPrioritariaElement.textContent = formatPrice(taxaPrioritariaValor);
        if (summaryTotalElement) summaryTotalElement.textContent = formatPrice(finalTotal);

        // 4. Atualizar prazos de entrega
        const prazo = entregaPrioritaria ? PRAZO_ENTREGA.PRIORITARIA : PRAZO_ENTREGA.PADRAO;
        if (prazoCorreiosElement) prazoCorreiosElement.textContent = `Chegada no Brasil (Correios): ${prazo.CORREIOS}`;
        if (prazoResidenciaElement) prazoResidenciaElement.textContent = `Entrega na Residência: ${prazo.RESIDENCIA}`;
    };
    
    opcoesCaixa.forEach(input => input.addEventListener('change', () => updateOrderSummary(currentSubtotal)));
    opcoesPrioritaria.forEach(input => input.addEventListener('change', () => updateOrderSummary(currentSubtotal)));
    // ------------------------------------------------------------------


    // --- VALIDAÇÃO DE TELEFONE EM TEMPO REAL ---
    const validatePhoneMatch = () => {
        const tel1 = telefoneInput?.value?.replace(/\D/g, '') || '';
        const tel2 = confirmacaoTelefoneInput?.value?.replace(/\D/g, '') || '';

        if (tel1 && tel2) {
            if (tel1 === tel2) {
                phoneMatchMessage.textContent = 'Telefone confirmado.';
                phoneMatchMessage.style.color = 'var(--success-color, green)';
                return true;
            } else {
                phoneMatchMessage.textContent = 'Os telefones não coincidem.';
                phoneMatchMessage.style.color = 'var(--error-color, red)';
                return false;
            }
        }
        phoneMatchMessage.textContent = '';
        return false;
    };
    
    if(telefoneInput) telefoneInput.addEventListener('input', validatePhoneMatch);
    if(confirmacaoTelefoneInput) confirmacaoTelefoneInput.addEventListener('input', validatePhoneMatch);
    // -----------------------------------------------------

    // --- renderCart ---
     const renderCart = () => {
        const cart = getCart();
        if (!summaryItemsContainer || !checkoutButton) return;

        if (cart.length === 0) {
            summaryItemsContainer.innerHTML = `<div class="empty-cart"><h3>Seu carrinho está vazio.</h3><p>Adicione produtos do nosso catálogo.</p><a href="../../catalogo/HTML/catalogo.html" class="btn btn-primary">Ver produtos</a></div>`;
            checkoutButton.disabled = true;
            updateOrderSummary(0);
            return;
        }

        checkoutButton.disabled = false;
        summaryItemsContainer.innerHTML = cart.map((item, index) => `
             <div class="summary-item">
                <div class="summary-item-image">
                    <img src="${item.image.startsWith('http') ? item.image : baseImageUrl + item.image}" alt="${item.name}">
                </div>
                <div class="summary-item-details">
                    <h4>${item.name}</h4>
                    <p>Tamanho: ${item.size}</p>
                    <p>Qtd: ${item.quantity} x ${formatPrice(item.price)}</p>
                    <p>Total: ${formatPrice(item.price * item.quantity)}</p>
                </div>
            </div>
        `).join('');

        currentSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        updateOrderSummary(currentSubtotal);
    };

    // --- FUNÇÕES DE ENDEREÇO E PRÉ-PREENCHIMENTO ---
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

        selectedAddressId = addresses[0].id; 
        addressSelectionContainer.querySelectorAll('input[name="selectedAddress"]').forEach(radio => {
            radio.addEventListener('change', (event) => {
                selectedAddressId = event.target.value; 
            });
        });
    };
    
    const preencherDadosDestinatario = async () => {
        try {
            const response = await apiClient.get('/usuario/meus-dados');
            const usuario = response.data;
            if (usuario) {
                if (usuario.nome && nomeDestinatarioEl) {
                    nomeDestinatarioEl.value = usuario.nome;
                }
                if (usuario.cpf && cpfDestinatarioEl) {
                    cpfDestinatarioEl.value = usuario.cpf;
                }
                if (usuario.telefone && telefoneInput) {
                    telefoneInput.value = usuario.telefone;
                }
            }
        } catch (error) {
            console.warn("Não foi possível pré-preencher os dados do destinatário.", error);
        }
    };
    // --- FIM FUNÇÕES DE ENDEREÇO E PRÉ-PREENCHIMENTO ---


    // --- FUNÇÃO DE CHECKOUT PRINCIPAL ---
    const handleCheckout = async (e) => {
        e.preventDefault();

        const cart = getCart();
        if (cart.length === 0) {
            alert("Seu carrinho está vazio.");
            return;
        }

        if (!selectedAddressId) {
            alert('Por favor, selecione um endereço de entrega.');
            addressSelectionContainer?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return; 
        }

        const nomeDestinatario = nomeDestinatarioEl?.value?.trim() || '';
        const cpfDestinatario = cpfDestinatarioEl?.value?.trim() || '';
        const telefoneDestinatario = telefoneInput?.value?.trim() || ''; 
        const observacoes = observacoesEl?.value?.trim() || '';

        if (!nomeDestinatario || !cpfDestinatario) {
            alert('Por favor, preencha o Nome Completo e o CPF do destinatário.');
            nomeDestinatarioEl?.focus();
            return;
        }
        if (!validatePhoneMatch()) { 
            alert('Por favor, confirme seu telefone corretamente.');
            telefoneInput?.focus();
            return;
        }

        const pedidoItens = cart.map(item => ({
            produtoId: parseInt(item.id),
            quantidade: item.quantity,
            tamanho: item.size
        }));

        const comCaixa = document.getElementById('comCaixa')?.checked || false;
        const entregaPrioritaria = document.getElementById('entregaPrioritaria')?.checked || false;

        const checkoutData = {
            itens: pedidoItens,
            enderecoEntregaId: parseInt(selectedAddressId),
            // Campos esperados pelo backend
            nomeDestinatario: nomeDestinatario,
            cpfDestinatario: cpfDestinatario,
            telefoneDestinatario: telefoneDestinatario,
            observacoes: observacoes,
            
            comCaixa: comCaixa,
            entregaPrioritaria: entregaPrioritaria
        };

        try {
            if(checkoutButton) {
                checkoutButton.disabled = true;
                checkoutButton.textContent = 'Processando...';
            }

            const response = await apiClient.post('/pedidos', checkoutData);
            const novoPedido = response.data;

            localStorage.removeItem('cart'); 
            if (window.updateCartCounter) {
                window.updateCartCounter();
            }

            sessionStorage.setItem('ultimoPedidoId', novoPedido.id);
            sessionStorage.setItem('ultimoPedidoValor', novoPedido.valorTotal);
            sessionStorage.setItem('ultimoPedidoPixCode', novoPedido.pixCopiaECola);

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
            if(checkoutButton) {
                checkoutButton.disabled = false;
                checkoutButton.textContent = 'Finalizar Compra';
            }
        }
    };
    // --- FIM FUNÇÃO DE CHECKOUT PRINCIPAL ---


    // --- LÓGICA DE INICIALIZAÇÃO ---
     const initializeCheckoutPage = async () => {
        renderCart(); 
        
        if (getCart().length === 0) {
            if(addressSelectionContainer) addressSelectionContainer.innerHTML = '<p>Adicione itens ao carrinho para continuar.</p>';
            return; 
        }

        const userAddresses = await fetchUserAddresses(); 
        renderAddressSelection(userAddresses); 
        preencherDadosDestinatario();
    };
    // --- FIM INICIALIZAÇÃO ---

    if(checkoutButton) {
        checkoutButton.addEventListener('click', handleCheckout);
    }

    initializeCheckoutPage();
});