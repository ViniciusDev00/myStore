document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://api.japauniverse.com.br/api/produtos';
    const grid = document.getElementById('products-grid');

    if (grid) {
        let allProducts = [];
        let displayedProducts = 8;
        const loadMoreBtn = document.getElementById('loadMoreBtn');

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
                    <button class="btn btn-primary add-to-cart-btn" data-product-id="${product.id}">Adicionar ao Carrinho</button>
                </div>
            `).join('');

            if (loadMoreBtn) {
                loadMoreBtn.style.display = (displayedProducts >= productsToRender.length) ? 'none' : 'inline-flex';
            }
            
            // NOVO: Adiciona listeners após a renderização
            addCartButtonListeners();
        };

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
                const response = await axios.get(API_URL);
                allProducts = response.data;
                window.allProducts = allProducts;
                applyFiltersAndRender();
            } catch (error) {
                console.error('Falha na requisição com Axios:', error);
                grid.innerHTML = `<p style="color: var(--text-secondary); grid-column: 1 / -1; text-align: center;">Não foi possível carregar os produtos.</p>`;
            }
        };

        // NOVO: Função para adicionar listeners aos botões de 'Adicionar ao Carrinho'
        const addCartButtonListeners = () => {
            document.querySelectorAll('.product-card .add-to-cart-btn').forEach(button => {
                // Apenas adiciona se o listener não existir
                if (button.dataset.listenerAdded) return; 

                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const productId = e.target.dataset.productId;

                    // Mensagem de aviso que cumpre o requisito de "exibir o modal de aviso"
                    const confirmRedirect = confirm("Por favor, selecione um tamanho antes de adicionar ao carrinho. Você será redirecionado para a página do produto.");
                    
                    if (confirmRedirect) {
                        // Redireciona para a página de detalhes do produto para a seleção de tamanho
                        window.location.href = `/FRONT/produto/HTML/produto.html?id=${productId}`;
                    }
                });
                button.dataset.listenerAdded = 'true'; // Marca como adicionado
            });
        }
        
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