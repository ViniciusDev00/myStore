document.addEventListener('DOMContentLoaded', () => {

    // ===== FONTE DE DADOS DOS PRODUTOS =====
    const productsData = [
        { id: 'p1', name: 'Asuna 2.0 “Black/White”', brand: 'Nike', price: 240.00, image: '../IMG/recentes/p1.webp' },
        { id: 'p2', name: 'Air Max 90 “Triple White”', brand: 'Nike', price: 349.00, image: '../IMG/recentes/p2.webp' },
        { id: 'p3', name: 'Air Max 90 “Triple Black”', brand: 'Nike', price: 349.00, image: '../IMG/recentes/p3.webp' },
        { id: 'p4', name: 'Air Max 95 “Triple White”', brand: 'Nike', price: 349.00, image: '../IMG/recentes/p4.webp' },
        { id: 'p5', name: 'Air Max 97 “Black”', brand: 'Nike', price: 349.00, image: '../IMG/recentes/p5.webp' },
        { id: 'p6', name: 'Dunk Low “Black/White”', brand: 'Nike', price: 369.00, image: '../IMG/recentes/p6.webp' },
        { id: 'p7', name: 'Dunk Low “Court Purple”', brand: 'Nike', price: 369.00, image: '../IMG/recentes/p7.webp' },
        { id: 'p8', name: 'Dunk Low “Black Pigeon”', brand: 'Nike', price: 369.00, image: '../IMG/recentes/p8.webp' },
        { id: 'p9', name: 'Dunk Low “Mummy”', brand: 'Nike', price: 369.00, image: '../IMG/recentes/p9.webp' },
        { id: 'p10', name: 'Dunk Low “Valentine’s Day”', brand: 'Nike', price: 369.00, image: '../IMG/recentes/p10.webp' },
        { id: 'p11', name: 'Jordan 1 Low x Travis Scott “Triple Black”', brand: 'Air Jordan', price: 379.00, image: '../IMG/recentes/p11.webp' },
        { id: 'p12', name: 'Jordan 1 Low “Light Smoke Grey”', brand: 'Air Jordan', price: 379.00, image: '../IMG/recentes/p12.webp' },
        { id: 'p13', name: 'Jordan 3 “Dark Iris”', brand: 'Air Jordan', price: 379.00, image: '../IMG/recentes/p13.webp' },
        { id: 'p14', name: 'M2K Tekno “Obsidian”', brand: 'Nike', price: 369.00, image: '../IMG/recentes/p14.webp' },
        { id: 'p15', name: 'VaporMax Plus “Tiger”', brand: 'Nike', price: 309.00, image: '../IMG/recentes/p15.webp' },
        { id: 'p16', name: 'Yeezy 500 “Utility Black”', brand: 'Adidas', price: 379.00, image: '../IMG/recentes/p16.webp' },
        { id: 'p17', name: 'Bape Sta “Black Grey”', brand: 'Bape', price: 379.00, image: '../IMG/recentes/p17.webp' },
        { id: 'p18', name: 'Supreme x Nike Shox Ride 2 “Black”', brand: 'Nike', price: 379.00, image: '../IMG/recentes/p18.webp' },
        { id: 'p19', name: 'Supreme x Nike Shox Ride 2 “White”', brand: 'Nike', price: 379.00, image: '../IMG/recentes/p19.webp' },
        { id: 'p20', name: 'Asics Gel NYC “Beige/White/Grey”', brand: 'Asics', price: 379.00, image: '../IMG/recentes/p20.webp' }
    ];

    // ===== LÓGICA GLOBAL (HEADER, MENU, CARRINHO) =====
    // Efeito de scroll no header
    const header = document.querySelector('.main-header');
    if (header) {
        window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 50));
    }

    // Link de navegação ativo
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.main-nav .nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPage) link.classList.add('active');
    });

    // Ano atual no footer
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Lógica do carrinho (simplificada, adicione o seu módulo completo se precisar de todas as funções)
    const cartCountEl = document.querySelector('.cart-count');
    document.body.addEventListener('click', e => {
        if (e.target.closest('.add-to-cart-btn')) {
            let currentCount = parseInt(cartCountEl.textContent, 10);
            cartCountEl.textContent = currentCount + 1;
            // Aqui você adicionaria a lógica completa do seu CartModule para salvar no localStorage, etc.
            console.log("Produto adicionado ao carrinho!");
        }
    });

    // ===== LÓGICA ESPECÍFICA DO CATÁLOGO =====
    const grid = document.getElementById('products-grid');
    if (grid) {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        let displayedProducts = 8;

        const renderGrid = (productsToRender) => {
            grid.innerHTML = '';
            productsToRender.slice(0, displayedProducts).forEach(product => {
                const productCard = `
                    <div class="product-card" data-id="${product.id}">
                        <div class="product-image-wrapper">
                            <img src="${product.image}" alt="${product.name}">
                        </div>
                        <div class="product-info">
                            <span class="product-brand">${product.brand}</span>
                            <h3 class="product-name">${product.name}</h3>
                            <p class="product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</p>
                            <button class="btn btn-primary add-to-cart-btn">Adicionar ao Carrinho</button>
                        </div>
                    </div>
                `;
                grid.innerHTML += productCard;
            });

            loadMoreBtn.style.display = (displayedProducts >= productsToRender.length) ? 'none' : 'inline-flex';
        };

        const applyFilters = () => {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const brand = document.getElementById('brandFilter').value;
            const sort = document.getElementById('sortFilter').value;

            let filtered = productsData.filter(p => p.name.toLowerCase().includes(searchTerm));
            if (brand !== 'all') filtered = filtered.filter(p => p.brand === brand);
            if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
            else if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
            
            renderGrid(filtered);
        };

        document.getElementById('searchInput').addEventListener('input', () => { displayedProducts = 8; applyFilters(); });
        document.getElementById('brandFilter').addEventListener('change', () => { displayedProducts = 8; applyFilters(); });
        document.getElementById('sortFilter').addEventListener('change', () => { displayedProducts = 8; applyFilters(); });
        
        loadMoreBtn.addEventListener('click', () => {
            displayedProducts += 8;
            applyFilters();
        });

        applyFilters(); // Renderização inicial
    }
});