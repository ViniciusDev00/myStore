document.addEventListener('DOMContentLoaded', () => {

    // =======================================================================
    // CONFIGURAÇÃO FÁCIL DOS PRODUTOS - ADICIONE SEUS TÊNIS AQUI
    // =======================================================================

    // 1. Defina o caminho base para a pasta de imagens.
    const imageBasePath = '../IMG/recentes/';

    // 2. Adicione seus produtos na lista abaixo.
    // Formato: [ 'arquivo.webp', 'Marca', 'Nome do Tênis', 'Preço', 'MODELO' ],
    // O 'MODELO' é usado para filtrar: '95', 'DN' ou 'TN'.
    const productSourceData = [
        // Modelos Air Max 95
        [ '95cdgBranco.webp',      'Nike', 'Air Max 95 CDG "Branco"',         '899.99', '95' ],
        [ '95cdgCinzaPreto.webp',  'Nike', 'Air Max 95 CDG "Cinza/Preto"',    '949.99', '95' ],
        [ '95cdgPreto.webp',       'Nike', 'Air Max 95 CDG "Preto"',          '899.99', '95' ],

        // Modelos Air Max DN
        [ 'dnBlack.webp',          'Nike', 'Air Max DN "All Black"',          '1099.99', 'DN' ],
        [ 'dnDarkSmoke.webp',      'Nike', 'Air Max DN "Dark Smoke Grey"',    '999.99', 'DN' ],
        [ 'dnWhite.webp',          'Nike', 'Air Max DN "All White"',          '1199.99', 'DN' ],

        // Modelos Air Max TN (Plus)
        [ 'tnBlackSilver.webp',    'Nike', 'Air Max Plus TN "Black Silver"',  '999.99', 'TN' ],
        [ 'tnLilac.webp',          'Nike', 'Air Max Plus TN "Lilac"',         '1199.99', 'TN' ],
        [ 'tnRoyal.webp',          'Nike', 'Air Max Plus TN "Royal Blue"',    '1199.99', 'TN' ],
        [ 'tnOreo.webp',           'Nike', 'Air Max Plus TN "Oreo"',          '1199.99', 'TN' ],
        
        // Adicione mais produtos aqui, sempre especificando o modelo no final
        [ 'driftBlack.webp',       'Nike', 'Air Max Drift "Black"',           '1199.99', 'Drift' ], // Este não aparecerá nas 3 fileiras
    ];

    // =======================================================================
    // LÓGICA DO SITE - NÃO PRECISA MEXER DAQUI PARA BAIXO
    // =======================================================================

    // 1. Processa a lista de produtos para o formato que o site usa
    const products = productSourceData.map((p, index) => ({
        id: `p${index + 1}`,
        image: imageBasePath + p[0],
        brand: p[1],
        name: p[2],
        price: parseFloat(p[3]),
        model: p[4]
    }));

    // 2. Função para renderizar os produtos em um container específico
    const renderProductRow = (productsToRender, containerId) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (productsToRender.length === 0) {
            container.innerHTML = `<p style="padding-left: 1rem; color: var(--text-secondary);">Nenhum produto encontrado.</p>`;
            return;
        }

        container.innerHTML = productsToRender.map(product => `
            <div class="swiper-slide">
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
            </div>
        `).join('');
    };

    // 3. Função para inicializar um carrossel Swiper
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

    // 4. Define as seções que queremos criar e as popula
    const sectionsToBuild = [
        { model: '95', containerId: 'products-95', swiperClass: '.collection-swiper-95', prev: '.collection-prev-95', next: '.collection-next-95' },
        { model: 'DN', containerId: 'products-dn', swiperClass: '.collection-swiper-dn', prev: '.collection-prev-dn', next: '.collection-next-dn' },
        { model: 'TN', containerId: 'products-tn', swiperClass: '.collection-swiper-tn', prev: '.collection-prev-tn', next: '.collection-next-tn' }
    ];

    sectionsToBuild.forEach(section => {
        const filteredProducts = products.filter(p => p.model === section.model);
        renderProductRow(filteredProducts, section.containerId);
        initSwiper(section.swiperClass, section.prev, section.next);
    });
});