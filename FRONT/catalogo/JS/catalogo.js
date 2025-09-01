document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:8080/api/produtos';
    const grid = document.getElementById('products-grid');

    if (grid) {
        let allProducts = [];

        const renderGrid = (productsToRender) => {
            grid.innerHTML = productsToRender.map(product => `
                <div class="product-card" data-id="${product.id}">
                    <a href="../../produto/HTML/produto.html?id=${product.id}" class="product-card-link">
                        <div class="product-image-wrapper">
                            <img src="${product.imagemUrl}" alt="${product.nome}">
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
        };

        const applyFiltersAndRender = () => {
            // ... (lógica de filtros continua a mesma)
            renderGrid(filteredProducts);
        };

        const fetchProducts = async () => {
            try {
                const response = await axios.get(API_URL);
                allProducts = response.data;
                window.allProducts = allProducts; // Disponibiliza para o listener
                applyFiltersAndRender();
            } catch (error) {
                console.error('Falha na requisição com Axios:', error);
                grid.innerHTML = `<p>Não foi possível carregar os produtos.</p>`;
            }
        };

        // Adiciona um event listener único para os botões do catálogo
        grid.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart-btn')) {
                const productId = e.target.dataset.productId;
                const product = allProducts.find(p => p.id.toString() === productId);
                if (product) {
                    const productToAdd = {
                        id: product.id.toString(),
                        name: product.nome,
                        price: product.preco,
                        image: product.imagemUrl,
                        size: '39' // Tamanho padrão
                    };
                    if (window.addToCart) {
                        window.addToCart(productToAdd);
                    }
                }
            }
        });
        
        // ... (seus outros event listeners para filtros continuam aqui)
        fetchProducts();
    }
});