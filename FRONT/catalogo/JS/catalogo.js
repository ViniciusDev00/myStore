document.addEventListener('DOMContentLoaded', () => {
    // ... (O resto do seu código de lógica global permanece igual) ...
    const header = document.querySelector('.main-header');
    if (header) {
        window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 50));
    }
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.main-nav .nav-link').forEach(link => {
        if (link.getAttribute('href').endsWith(currentPage)) {
            link.classList.add('active');
        }
    });
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    const cartCountEl = document.querySelector('.cart-count');
    document.body.addEventListener('click', e => {
        if (e.target.closest('.add-to-cart-btn')) {
            let currentCount = parseInt(cartCountEl.textContent, 10);
            cartCountEl.textContent = currentCount + 1;
        }
    });

    const grid = document.getElementById('products-grid');
    if (grid) {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        let allProducts = [];
        let displayedProducts = 8;

        const renderGrid = (productsToRender) => {
    grid.innerHTML = ''; 
    
    productsToRender.slice(0, displayedProducts).forEach(product => {
            // A MUDANÇA ESTÁ AQUI: Adicionamos a tag <a> a envolver o card
            const productCard = `
                <a href="../../produto/HTML/produto.html?id=${product.id}" class="product-card-link">
                    <div class="product-card" data-id="${product.id}">
                        <div class="product-image-wrapper">
                            <img src="${product.imagemUrl}" alt="${product.nome}">
                        </div>
                        <div class="product-info">
                            <span class="product-brand">${product.marca.nome}</span>
                            <h3 class="product-name">${product.nome}</h3>
                            <p class="product-price">R$ ${product.preco.toFixed(2).replace('.', ',')}</p>
                            <button class="btn btn-primary add-to-cart-btn">Adicionar ao Carrinho</button>
                        </div>
                    </div>
                </a>
            `;
            grid.innerHTML += productCard;
        });

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

        // --- MUDANÇA AQUI: Usando Axios ---
        const fetchProducts = async () => {
            try {
                // A URL aponta para a API de produtos do seu servidor local
                const response = await axios.get('http://localhost:8080/api/produtos');
                allProducts = response.data; // Com Axios, os dados já vêm em .data
                applyFiltersAndRender();
            } catch (error) {
                console.error('Falha na requisição com Axios:', error);
                grid.innerHTML = `<p style="color: var(--text-secondary); grid-column: 1 / -1; text-align: center;">Não foi possível carregar os produtos. Verifique se o servidor (back-end) está rodando.</p>`;
            }
        };

        document.getElementById('searchInput').addEventListener('input', () => { displayedProducts = 8; applyFiltersAndRender(); });
        document.getElementById('brandFilter').addEventListener('change', () => { displayedProducts = 8; applyFiltersAndRender(); });
        document.getElementById('sortFilter').addEventListener('change', () => { displayedProducts = 8; applyFiltersAndRender(); });
        loadMoreBtn.addEventListener('click', () => {
            displayedProducts += 8;
            applyFiltersAndRender();
        });

        fetchProducts();
    }
});