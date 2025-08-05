document.addEventListener('DOMContentLoaded', () => {

    // =======================================================================
    // LÓGICA DO SITE - AGORA BUSCANDO DADOS DA API
    // =======================================================================

    // 1. Função que desenha os cards de produtos dentro de um carrossel
    const renderProductRow = (productsToRender, containerId) => {
        const container = document.getElementById(containerId);
        if (!container) return; // Se o container não existir, não faz nada
        
        if (productsToRender.length === 0) {
            container.innerHTML = `<p style="padding-left: 1rem; color: var(--text-secondary);">Nenhum produto desta categoria encontrado.</p>`;
            return;
        }

        container.innerHTML = productsToRender.map(product => `
            <div class="swiper-slide">
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
            </div>
        `).join('');
    };

    // 2. Função que inicializa o carrossel (Swiper)
    const initSwiper = (containerClass, navPrevClass, navNextClass) => {
        const swiperEl = document.querySelector(containerClass);
        // Verifica se o Swiper já foi inicializado para não duplicar
        if (!swiperEl || swiperEl.classList.contains('swiper-initialized')) return;
        
        new Swiper(containerClass, {
            slidesPerView: 'auto', // Mostra quantos slides couberem na tela
            spaceBetween: 24,      // Espaço entre os slides
            freeMode: true,        // Permite "arrastar" livremente
            scrollbar: { el: `${containerClass} .swiper-scrollbar`, draggable: true },
            navigation: { nextEl: navNextClass, prevEl: navPrevClass },
        });
    };

    // 3. Define as seções que queremos criar e qual categoria pertence a cada uma
    const sectionsToBuild = [
        { categoryName: 'Air Max 95', containerId: 'products-95', swiperClass: '.collection-swiper-95', prev: '.collection-prev-95', next: '.collection-next-95' },
        { categoryName: 'Air Max DN', containerId: 'products-dn', swiperClass: '.collection-swiper-dn', prev: '.collection-prev-dn', next: '.collection-next-dn' },
        { categoryName: 'Air Max TN', containerId: 'products-tn', swiperClass: '.collection-swiper-tn', prev: '.collection-prev-tn', next: '.collection-next-tn' }
    ];

    // 4. Função principal que busca TODOS os produtos e depois os distribui nos carrosséis corretos
    const fetchAndDistributeProducts = async () => {
        try {
            // Busca todos os produtos de uma só vez na sua API
            const response = await fetch('http://localhost:8080/api/produtos');
            if (!response.ok) {
                throw new Error('Erro ao buscar produtos da API.');
            }
            const allProducts = await response.json();

            // Para cada seção definida, ele filtra os produtos e renderiza o carrossel
            sectionsToBuild.forEach(section => {
                const filteredProducts = allProducts.filter(p => p.categoria.nome === section.categoryName);
                renderProductRow(filteredProducts, section.containerId);
                initSwiper(section.swiperClass, section.prev, section.next);
            });

        } catch (error) {
            console.error('Falha na requisição:', error);
            // Se der erro, avisa o usuário em todas as seções
            sectionsToBuild.forEach(section => {
                const container = document.getElementById(section.containerId);
                if(container) container.innerHTML = "<p>Não foi possível carregar os produtos.</p>";
            });
        }
    };

    // Chama a função para iniciar todo o processo
    fetchAndDistributeProducts();
});
