document.addEventListener('DOMContentLoaded', () => {
    // ... (O resto do seu código, como as funções renderProductRow e initSwiper, permanece igual) ...
    const renderProductRow = (productsToRender, containerId) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        if (productsToRender.length === 0) {
            container.innerHTML = `<p style="padding-left: 1rem; color: var(--text-secondary);">Nenhum produto desta categoria encontrado.</p>`;
            return;
        }
        container.innerHTML = productsToRender.map(product => `
            <div class="swiper-slide">
                <a href="../../produto/HTML/produto.html?id=${product.id}" class="product-card-link">
                    <div class="product-card" data-id="${product.id}">
                        <div class="product-image-wrapper">
                            <img src="${product.imagemUrl || 'path/to/placeholder.png'}" alt="${product.nome}">
                        </div>
                        <div class="product-info">
                            <span class="product-brand">${product.marca.nome}</span>
                            <h3 class="product-name">${product.nome}</h3>
                            <p class="product-price">R$ ${product.preco.toFixed(2).replace('.', ',')}</p>
                            <button class="btn btn-primary add-to-cart-btn">Adicionar ao Carrinho</button>
                        </div>
                    </div>
                </a>
            </div>
        `).join('');
    };

    const initSwiper = (containerClass, navPrevClass, navNextClass) => {
        const swiperEl = document.querySelector(containerClass);
        if (!swiperEl || swiperEl.classList.contains('swiper-initialized')) return;
        new Swiper(containerClass, {
            slidesPerView: 'auto',
            spaceBetween: 24,
            freeMode: true,
            scrollbar: { el: `${containerClass} .swiper-scrollbar`, draggable: true },
            navigation: { nextEl: navNextClass, prevEl: navPrevClass },
        });
    };

    const sectionsToBuild = [
        { categoryName: 'Air Max 95', containerId: 'products-95', swiperClass: '.collection-swiper-95', prev: '.collection-prev-95', next: '.collection-next-95' },
        { categoryName: 'Air Max DN', containerId: 'products-dn', swiperClass: '.collection-swiper-dn', prev: '.collection-prev-dn', next: '.collection-next-dn' },
        { categoryName: 'Air Max TN', containerId: 'products-tn', swiperClass: '.collection-swiper-tn', prev: '.collection-prev-tn', next: '.collection-next-tn' }
    ];

    // --- MUDANÇA AQUI: Usando Axios ---
    const fetchAndDistributeProducts = async () => {
        try {
            // Usamos axios.get() e os dados já vêm em formato JSON no 'response.data'
            const response = await axios.get('http://localhost:8080/api/produtos');
            const allProducts = response.data;

            sectionsToBuild.forEach(section => {
                const filteredProducts = allProducts.filter(p => p.categoria.nome === section.categoryName);
                renderProductRow(filteredProducts, section.containerId);
                initSwiper(section.swiperClass, section.prev, section.next);
            });

        } catch (error) {
            console.error('Falha na requisição com Axios:', error);
            sectionsToBuild.forEach(section => {
                const container = document.getElementById(section.containerId);
                if(container) container.innerHTML = "<p>Não foi possível carregar os produtos. Verifique se o servidor está rodando.</p>";
            });
        }
    };

    fetchAndDistributeProducts();
});