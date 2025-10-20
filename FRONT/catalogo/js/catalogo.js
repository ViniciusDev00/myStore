document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://api.japauniverse.com.br/api/produtos';
    const grid = document.getElementById('products-grid');

    if (grid) {
        let allProducts = [];
        let displayedProducts = 8;
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        
        // Variáveis e elementos do Modal
        let selectedProductId = null;
        let selectedSize = null;
        const modalOverlay = document.getElementById('sizeSelectionModal');
        const closeButton = document.getElementById('closeSizeModalBtn');
        const sizeOptionsContainer = document.getElementById('sizeOptions');
        const addToCartModalBtn = document.getElementById('addToCartModalBtn');
        const modalProductName = document.getElementById('modalProductName');
        const modalError = document.getElementById('modalError');

        // Funções de Controle do Modal
        const openSizeSelectionModal = (productId, productName, availableSizes) => {
            if (!modalOverlay) return; 

            selectedProductId = productId;
            selectedSize = null; 
            modalError.style.display = 'none';

            modalProductName.textContent = `Selecione o Tamanho para: ${productName}`;
            sizeOptionsContainer.innerHTML = '';
            
            const sortedSizes = Object.keys(availableSizes).sort((a, b) => parseInt(a) - parseInt(b));

            if (sortedSizes.length === 0) {
                sizeOptionsContainer.innerHTML = `<p style="color: var(--text-secondary); text-align: center;">Nenhum tamanho em estoque.</p>`;
                addToCartModalBtn.disabled = true;
            } else {
                addToCartModalBtn.disabled = false;
                sortedSizes.forEach(size => {
                    const quantity = availableSizes[size];
                    const sizeBtn = document.createElement('span');
                    sizeBtn.classList.add('size-option');
                    sizeBtn.textContent = size;
                    sizeBtn.dataset.size = size;

                    // Ajuste: Apenas desabilita se a quantidade for 0
                    if (quantity <= 0) {
                        sizeBtn.classList.add('disabled');
                        sizeBtn.title = 'Esgotado';
                    } else {
                        sizeBtn.addEventListener('click', () => {
                            // Limpar seleção anterior
                            sizeOptionsContainer.querySelectorAll('.size-option').forEach(btn => {
                                btn.classList.remove('selected');
                            });
                            // Marcar novo selecionado
                            sizeBtn.classList.add('selected');
                            selectedSize = size;
                            modalError.style.display = 'none'; 
                        });
                    }
                    sizeOptionsContainer.appendChild(sizeBtn);
                });
            }
            modalOverlay.classList.add('active');
        };

        const closeSizeSelectionModal = () => {
            if (!modalOverlay) return;
            modalOverlay.classList.remove('active');
            selectedProductId = null;
            selectedSize = null;
        };

        // Event Listeners do Modal
        if (closeButton) closeButton.addEventListener('click', closeSizeSelectionModal);
        if (modalOverlay) modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeSizeSelectionModal();
        });

        // Lógica final de adição ao carrinho
        if (addToCartModalBtn) addToCartModalBtn.addEventListener('click', () => {
            if (!selectedSize) {
                modalError.textContent = "Selecione um tamanho antes de adicionar.";
                modalError.style.display = 'block';
                return;
            }
            
            // ATENÇÃO: Depende da função window.addToCart existir no escopo global (Ex: main.js)
            if (typeof window.addToCart === 'function') {
                // Simula os dados do produto para o módulo do carrinho
                const productDetails = allProducts.find(p => p.id === parseInt(selectedProductId));
                if (productDetails) {
                    const productToAdd = {
                        id: productDetails.id.toString(),
                        name: productDetails.nome,
                        price: productDetails.preco,
                        image: getImageUrl(productDetails.imagemUrl),
                        size: selectedSize,
                        quantity: 1
                    };
                    window.addToCart(productToAdd); 
                    closeSizeSelectionModal();
                    // REMOVIDO: alert(`Produto (Tam: ${selectedSize}) adicionado ao carrinho!`);
                } else {
                     // Caso o produto não seja encontrado
                     alert("Erro ao encontrar detalhes do produto.");
                }
            } else {
                console.error("Função window.addToCart não encontrada. Adicionando ao carrinho simuladamente.");
                // REMOVIDO: alert(`Produto ${selectedProductId} (Tam: ${selectedSize}) adicionado ao carrinho! (SIMULADO)`); 
                closeSizeSelectionModal();
            }
        });
        // FIM NOVO: Funções de Controle do Modal

        const getImageUrl = (path) => {
            if (!path) return '';
            if (path.startsWith('http')) {
                return path;
            }
            return `https://api.japauniverse.com.br/${path}`;
        };

        const renderGrid = (productsToRender) => {
            grid.innerHTML = productsToRender.slice(0, displayedProducts).map(product => `
                <div class="product-card" data-id="${product.id}">
                    <a href="/FRONT/produto/HTML/produto.html?id=${product.id}" class="product-card-link">
                        <div class="product-image-wrapper">
                            <img src="${getImageUrl(product.imagemUrl)}" alt="${product.nome}">
                        </div>
                        <div class="product-info">
                            <span class="product-brand">${product.marca.nome}</span>
                            <h3 class="product-name">${product.nome}</h3>
                            <div class="shipping-tag">Frete Grátis</div>
                            <p class="product-price">R$ ${product.preco.toFixed(2).replace('.', ',')}</p>
                        </div>
                    </a>
                    <button class="btn btn-primary add-to-cart-btn" 
                            data-product-id="${product.id}" 
                            data-product-name="${product.nome}">Adicionar ao Carrinho</button>
                </div>
            `).join('');

            if (loadMoreBtn) {
                loadMoreBtn.style.display = (displayedProducts >= productsToRender.length) ? 'none' : 'inline-flex';
            }
            
            // NOVO: Chamar o listener após a renderização
            addCartButtonListeners(); 
        };
        
        // NOVO: Função para adicionar listeners aos botões
        const addCartButtonListeners = () => {
            document.querySelectorAll('.product-card .add-to-cart-btn').forEach(button => {
                if (button.dataset.listenerAdded) return; 

                button.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const productId = e.target.dataset.productId;
                    const productName = e.target.dataset.productName;

                    // Busca o produto completo da lista allProducts
                    const productDetails = allProducts.find(p => p.id === parseInt(productId));

                    if (!productDetails || productDetails.estoque <= 0) {
                        alert("Produto esgotado ou detalhes de estoque não encontrados.");
                        return;
                    }

                    // *** SIMULAÇÃO DE ESTOQUE POR TAMANHO ***
                    // Cria uma lista de tamanhos fixos e assume que todos têm 10 em estoque, 
                    // SE o estoque geral for maior que zero.
                    const sizes = ['38', '39', '40', '41', '42', '43'];
                    const availableSizes = {};
                    
                    // Se o estoque geral > 0, assume que todos os tamanhos estão disponíveis.
                    sizes.forEach(size => {
                        availableSizes[size] = productDetails.estoque > 0 ? 10 : 0; 
                    });
                    // *** FIM SIMULAÇÃO ***

                    openSizeSelectionModal(productId, productName, availableSizes);

                });
                button.dataset.listenerAdded = 'true'; // Marca como processado
            });
        }
        // FIM NOVO: Função para adicionar listeners aos botões

        const applyFiltersAndRender = () => {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const brandFilterValue = document.getElementById('brandFilter').value;
            const sortOrder = document.getElementById('sortFilter').value;
            let filtered = [...allProducts];

            if (searchTerm) {
                filtered = filtered.filter(p => p.nome.toLowerCase().includes(searchTerm));
            }
            if (brandFilterValue !== 'all') {
                filtered = filtered.filter(p => p.marca.nome === brandFilterValue);
            }
            if (sortOrder === 'price-asc') {
                filtered.sort((a, b) => a.preco - b.preco);
            } else if (sortOrder === 'price-desc') {
                filtered.sort((a, b) => b.preco - a.preco);
            }
            renderGrid(filtered);
        };

        const fetchProducts = async () => {
            try {
                // Requisição inicial, que traz os dados básicos, incluindo 'estoque'
                const response = await axios.get(API_URL);
                allProducts = response.data;
                window.allProducts = allProducts;
                applyFiltersAndRender();
            } catch (error) {
                console.error('Falha na requisição com Axios:', error);
                grid.innerHTML = `<p style="color: var(--text-secondary); grid-column: 1 / -1; text-align: center;">Não foi possível carregar os produtos.</p>`;
            }
        };

        document.getElementById('searchInput').addEventListener('input', () => { displayedProducts = 8; applyFiltersAndRender(); });
        document.getElementById('brandFilter').addEventListener('change', () => { displayedProducts = 8; applyFiltersAndRender(); });
        document.getElementById('sortFilter').addEventListener('change', () => { displayedProducts = 8; applyFiltersAndRender(); });
        
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                displayedProducts += 8;
                applyFiltersAndRender();
            });
        }

        fetchProducts();
    }
});