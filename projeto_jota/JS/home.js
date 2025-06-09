// JS/home.js - Lógica específica da página inicial

document.addEventListener('DOMContentLoaded', () => {

    /**
     * Módulo da Coleção em Destaque
     * Renderiza produtos e inicializa o carrossel Swiper.js.
     */
    const CollectionModule = (() => {
        const productContainer = document.getElementById('collection-products');
        
        // Em um projeto real, estes seriam os produtos em destaque vindos de uma API.
        const featuredProducts = [
            { id: 'p1', name: 'Retro Runner Pro', brand: 'eduStreet', price: 399.90, image: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=500', category: 'footwear' },
            { id: 'p2', name: '404 Error Tee', brand: 'eduStreet', price: 129.90, image: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=500', category: 'tops' },
            { id: 'p3', name: 'Tech Joggers', brand: 'eduStreet', price: 249.90, image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500', category: 'bottoms' },
            { id: 'p4', name: 'Urban Pro Sneakers', brand: 'eduStreet', price: 359.90, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', category: 'footwear' },
            { id: 'p5', name: '5-Panel Snapback', brand: 'eduStreet', price: 149.90, image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500', category: 'accessories' },
            { id: 'p6', name: 'Binary Code Hoodie', brand: 'eduStreet', price: 279.90, image: 'https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=500', category: 'tops' }
        ];

        function renderProducts() {
            if (!productContainer) return;

            productContainer.innerHTML = featuredProducts.map(product => `
                <div class="swiper-slide">
                    <div class="product-card" data-id="${product.id}">
                        <div class="product-image-wrapper">
                            <img src="${product.image}" alt="${product.name}" loading="lazy">
                        </div>
                        <div class="product-info">
                            <span class="product-brand">${product.brand}</span>
                            <h3 class="product-name">${product.name}</h3>
                            <p class="product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</p>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        function initSwiper() {
            if (document.querySelector('.collection-swiper')) {
                const swiper = new Swiper('.collection-swiper', {
                    slidesPerView: 'auto',
                    spaceBetween: 30,
                    grabCursor: true,
                    loop: false,
                    scrollbar: {
                        el: '.swiper-scrollbar',
                        hide: false,
                        draggable: true,
                    },
                    navigation: {
                        nextEl: '.collection-next',
                        prevEl: '.collection-prev',
                    },
                });
            }
        }

        function init() {
            renderProducts();
            initSwiper();
        }

        return { init };

    })();

    CollectionModule.init();
});