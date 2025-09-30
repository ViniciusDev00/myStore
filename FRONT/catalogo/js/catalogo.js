document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://api.japauniverse.com.br/api/produtos';
    const grid = document.getElementById('products-grid');

    if (grid) {
        let allProducts = [];
        let displayedProducts = 8;
        const loadMoreBtn = document.getElementById('loadMoreBtn');

        const renderGrid = (productsToRender) => {
            grid.innerHTML = productsToRender.slice(0, displayedProducts).map(product => `
                <div class="product-card" data-id="${product.id}">
                    <a href="/FRONT/produto/HTML/produto.html?id=${product.id}" class="product-card-link">
                        <div class="product-image-wrapper">
                            <img src="/${product.imagemUrl}" alt="${product.nome}">
                        </div>
                        <div class="product-info">
                            <span class="product-brand">${product.marca.nome}</span>
                            <h3 class="product-name">${product.nome}</h3>
                            <p class="product-price">R$ ${product.preco.toFixed(2).replace('.', ',')}</p>
                        </div>
                    </a>
                    <button class="btn btn-primary add-to-cart-btn" data-product-id="${product.id}">Adicionar ao Carrinho</button>
                </div>
            `).join('');

            loadMoreBtn.style.display = (displayedProducts >= productsToRender.length) ? 'none' : 'inline-flex';
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

        document.getElementById('searchInput').addEventListener('input', () => { displayedProducts = 8; applyFiltersAndRender(); });
        document.getElementById('brandFilter').addEventListener('change', () => { displayedProducts = 8; applyFiltersAndRender(); });
        document.getElementById('sortFilter').addEventListener('change', () => { displayedProducts = 8; applyFiltersAndRender(); });
        loadMoreBtn.addEventListener('click', () => {
            displayedProducts += 8;
            applyFiltersAndRender();
        });

        // Adiciona a funcionalidade de "Adicionar ao Carrinho" nesta página
        grid.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart-btn')) {
                const productId = e.target.dataset.productId;
                const product = allProducts.find(p => p.id.toString() === productId);
                if (product) {
                    const productToAdd = {
                        id: product.id.toString(),
                        name: product.nome,
                        price: product.preco,
                        image: `/${product.imagemUrl}`, // Garante que o caminho no carrinho também seja absoluto
                        size: '39' // Tamanho padrão
                    };
                    if (window.addToCart) {
                        window.addToCart(productToAdd);
                    } else {
                        console.error("Função addToCart não encontrada.");
                    }
                }
            }
        });

        fetchProducts();
    }
});
