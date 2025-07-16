// JS/recentes.js

document.addEventListener('DOMContentLoaded', function () {

    // --- Dados dos Produtos (Exemplo) ---
    // Em um site real, isso viria de um banco de dados.
    const products = [
        {
            id: 1,
            brand: 'Nike',
            name: 'Air Max Plus TN "Black Royal Blue"',
            price: '899,99',
            imageUrl: '../IMG/recentes/95cdgBranco.webp'
        },
        {
            id: 2,
            brand: 'Nike',
            name: 'Air Max Plus TN "Pink"',
            price: '949,99',
            imageUrl: '../IMG/recentes/95cdgCinzaPreto.webp'
        },
        {
            id: 3,
            brand: 'Nike',
            name: 'Air Max Plus TN "Tiger"',
            price: '899,99',
            imageUrl: '../IMG/recentes/95cdgPreto.webp'
        },
        {
            id: 4,
            brand: 'Nike',
            name: 'Air Max Plus TN "Hyper Blue"',
            price: '1.099,99',
            imageUrl: '../IMG/recentes/dnBlack.webp'
        },
        {
            id: 5,
            brand: 'Nike',
            name: 'Air Max Plus TN "Black Metallic"',
            price: '999,99',
            imageUrl: '../IMG/recentes/dnDarkSmoke.webp'
        },
        {
            id: 6,  
            brand: 'Nike',
            name: 'Air Max Plus TN "Sunset"',
            price: '1.199,99',
            imageUrl: '../IMG/recentes/dnWhite.webp'
        },
        {
            id: 7,
            brand: 'Nike',
            name: 'Air Max Plus TN "Sunset"',
            price: '1.199,99',
            imageUrl: '../IMG/recentes/driftBlack.webp'
        },
        {
            id: 8,
            brand: 'Nike',
            name: 'Air Max Plus TN "Sunset"',
            price: '1.199,99',
            imageUrl: '../IMG/recentes/driftYingYang.webp'
        },
        {
            id: 9,
            brand: 'Nike',
            name: 'Air Max Plus TN "Sunset"',
            price: '1.199,99',
            imageUrl: '../IMG/recentes/tnBlackSilver.webp'
        },
        {
            id: 10,
            brand: 'Nike',
            name: 'Air Max Plus TN "Sunset"',
            price: '1.199,99',
            imageUrl: '../IMG/recentes/tnLilac.webp'
        },
        {
            id: 11,
            brand: 'Nike',
            name: 'Air Max Plus TN "Sunset"',
            price: '1.199,99',
            imageUrl: '../IMG/recentes/tnRoyal.webp'
        },
        {
            id: 12,
            brand: 'Nike',
            name: 'Air Max Plus TN "Sunset"',
            price: '1.199,99',
            imageUrl: '../IMG/recentes/tnOreo.webp'
        },

        
    ];

    // --- Função para Gerar os Cards e Inserir no HTML ---
    function renderProducts() {
        const productContainer = document.getElementById('collection-products');
        if (!productContainer) return;

        let productsHTML = '';
        products.forEach(product => {
            productsHTML += `
                <div class="swiper-slide">
                    <div class="product-card">
                        <div class="product-image-wrapper">
                            <img src="${product.imageUrl}" alt="${product.name}">
                        </div>
                        <div class="product-info">
                            <span class="product-brand">${product.brand}</span>
                            <h3 class="product-name">${product.name}</h3>
                            <p class="product-price">R$ ${product.price}</p>
                            <a href="#" class="btn">Ver Produto</a>
                        </div>
                    </div>
                </div>
            `;
        });

        productContainer.innerHTML = productsHTML;
    }

    // --- Função para Inicializar o Carrossel (Swiper) ---
    function initCollectionSwiper() {
        new Swiper('.collection-swiper', {
            // Quantos slides são visíveis. 'auto' respeita a largura definida no CSS.
            slidesPerView: 'auto',

            // Espaço entre os slides
            spaceBetween: 24,

            // Ativa a barra de rolagem
            scrollbar: {
                el: '.swiper-scrollbar',
                draggable: true, // Permite arrastar a barra
            },

            // Conecta os botões de navegação personalizados
            navigation: {
                nextEl: '.collection-next',
                prevEl: '.collection-prev',
            },

            // Melhora a usabilidade no desktop
            mousewheel: {
                forceToAxis: true,
            },
            freeMode: true, // Permite deslizar sem "prender" em cada slide
        });
    }

    // --- Execução ---
    renderProducts();
    initCollectionSwiper();

});