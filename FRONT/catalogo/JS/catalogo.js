document.addEventListener('DOMContentLoaded', () => {

    // ===== LÓGICA GLOBAL (HEADER, MENU, CARRINHO) =====
    // Efeito de scroll no header
    const header = document.querySelector('.main-header');
    if (header) {
        window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 50));
    }

    // Marca o link de navegação da página atual como ativo
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.main-nav .nav-link').forEach(link => {
        if (link.getAttribute('href').endsWith(currentPage)) {
            link.classList.add('active');
        }
    });

    // Coloca o ano atual no rodapé
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Lógica do carrinho (simplificada, apenas para o contador)
    const cartCountEl = document.querySelector('.cart-count');
    document.body.addEventListener('click', e => {
        if (e.target.closest('.add-to-cart-btn')) {
            let currentCount = parseInt(cartCountEl.textContent, 10);
            cartCountEl.textContent = currentCount + 1;
            console.log("Produto adicionado ao carrinho! (Lógica completa em main.js)");
        }
    });

    // ===== LÓGICA ESPECÍFICA DO CATÁLOGO (CONECTADO COM A API) =====
    const grid = document.getElementById('products-grid');
    if (grid) {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        let allProducts = []; // Array que vai guardar todos os produtos vindos da API
        let displayedProducts = 8; // Quantidade inicial de produtos a serem exibidos

        // Função que desenha os cards dos produtos na tela
        const renderGrid = (productsToRender) => {
            grid.innerHTML = ''; // Limpa a grade antes de adicionar os produtos
            
            productsToRender.slice(0, displayedProducts).forEach(product => {
                const productCard = `
                    <div class="product-card" data-id="${product.id}">
                        <div class="product-image-wrapper">
                            <img src="${product.imagemUrl || '../IMG/placeholder.webp'}" alt="${product.nome}">
                        </div>
                        <div class="product-info">
                            <span class="product-brand">${product.marca.nome}</span>
                            <h3 class="product-name">${product.nome}</h3>
                            <p class="product-price">R$ ${product.preco.toFixed(2).replace('.', ',')}</p>
                            <button class="btn btn-primary add-to-cart-btn">Adicionar ao Carrinho</button>
                        </div>
                    </div>
                `;
                grid.innerHTML += productCard;
            });

            // Mostra ou esconde o botão 'Carregar Mais'
            loadMoreBtn.style.display = (displayedProducts >= productsToRender.length) ? 'none' : 'inline-flex';
        };

        // Função que aplica os filtros e a ordenação com base na interação do usuário
        const applyFiltersAndRender = () => {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const brandFilterValue = document.getElementById('brandFilter').value;
            const sortOrder = document.getElementById('sortFilter').value;

            let filtered = [...allProducts];

            // Filtro por nome
            if (searchTerm) {
                filtered = filtered.filter(p => p.nome.toLowerCase().includes(searchTerm));
            }
            
            // Filtro por marca
            if (brandFilterValue !== 'all') {
                filtered = filtered.filter(p => p.marca.nome === brandFilterValue);
            }

            // Ordenação por preço
            if (sortOrder === 'price-asc') {
                filtered.sort((a, b) => a.preco - b.preco);
            } else if (sortOrder === 'price-desc') {
                filtered.sort((a, b) => b.preco - a.preco);
            }
            
            renderGrid(filtered);
        };

        // Função principal que busca os produtos na API do seu back-end
        const fetchProducts = async () => {
            try {
                // A URL aponta para a API de produtos do seu servidor local
                const response = await fetch('http://localhost:8080/api/produtos');
                if (!response.ok) {
                    throw new Error('Erro ao buscar produtos. Código: ' + response.status);
                }
                const products = await response.json();
                allProducts = products; // Guarda a lista completa de produtos
                applyFiltersAndRender(); // Mostra os produtos na tela
            } catch (error) {
                console.error('Falha na requisição:', error);
                grid.innerHTML = `<p style="color: var(--text-secondary); grid-column: 1 / -1; text-align: center;">Não foi possível carregar os produtos. Verifique se o servidor (back-end) está rodando.</p>`;
            }
        };

        // Adiciona os "escutadores" de eventos para os filtros e o botão
        document.getElementById('searchInput').addEventListener('input', () => { displayedProducts = 8; applyFiltersAndRender(); });
        document.getElementById('brandFilter').addEventListener('change', () => { displayedProducts = 8; applyFiltersAndRender(); });
        document.getElementById('sortFilter').addEventListener('change', () => { displayedProducts = 8; applyFiltersAndRender(); });
        
        loadMoreBtn.addEventListener('click', () => {
            displayedProducts += 8;
            applyFiltersAndRender();
        });

        // Inicia todo o processo buscando os produtos quando a página carrega
        fetchProducts();
    }
});
