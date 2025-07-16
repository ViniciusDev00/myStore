// ===================================================
// JS/main.js - Lógica Global da tn do japa
// ===================================================

// FONTE ÚNICA DE DADOS DOS PRODUTOS
const productsData = [
    { id: 'p1', name: 'Asuna 2.0 “Black/White”', brand: 'Nike', price: 240.00, image: 'https://i.imgur.com/pBf20aY.png', category: 'footwear' },
    { id: 'p2', name: 'Air Max 90 “Triple White”', brand: 'Nike', price: 349.00, image: 'https://i.imgur.com/pAv966j.png', category: 'footwear' },
    { id: 'p3', name: 'Air Max 90 “Triple Black”', brand: 'Nike', price: 349.00, image: 'https://i.imgur.com/N4a2D2k.png', category: 'footwear' },
    { id: 'p4', name: 'Air Max 95 “Triple White”', brand: 'Nike', price: 349.00, image: 'https://i.imgur.com/k49p1ga.png', category: 'footwear' },
    { id: 'p5', name: 'Air Max 97 “Black”', brand: 'Nike', price: 349.00, image: 'https://i.imgur.com/839S2fA.png', category: 'footwear' },
    { id: 'p6', name: 'Dunk Low “Black/White”', brand: 'Nike', price: 369.00, image: 'https://i.imgur.com/D6zC06o.png', category: 'footwear' },
    { id: 'p7', name: 'Dunk Low “Court Purple”', brand: 'Nike', price: 369.00, image: 'https://i.imgur.com/KqfSSiH.png', category: 'footwear' },
    { id: 'p8', name: 'Dunk Low “Black Pigeon”', brand: 'Nike', price: 369.00, image: 'https://i.imgur.com/sC5Iayg.png', category: 'footwear' },
    { id: 'p9', name: 'Dunk Low “Mummy”', brand: 'Nike', price: 369.00, image: 'https://i.imgur.com/fL3HAb3.png', category: 'footwear' },
    { id: 'p10', name: 'Dunk Low “Valentine’s Day”', brand: 'Nike', price: 369.00, image: 'https://i.imgur.com/152G7Xn.png', category: 'footwear' },
    { id: 'p11', name: 'Jordan 1 Low x Travis Scott “Triple Black”', brand: 'Air Jordan', price: 379.00, image: 'https://i.imgur.com/gK9rG6d.png', category: 'footwear' },
    { id: 'p12', name: 'Jordan 1 Low “Light Smoke Grey”', brand: 'Air Jordan', price: 379.00, image: 'https://i.imgur.com/UfG4V61.png', category: 'footwear' },
    { id: 'p13', name: 'Jordan 3 “Dark Iris”', brand: 'Air Jordan', price: 379.00, image: 'https://i.imgur.com/VpU4M77.png', category: 'footwear' },
    { id: 'p14', name: 'M2K Tekno “Obsidian”', brand: 'Nike', price: 369.00, image: 'https://i.imgur.com/6cE8i9d.png', category: 'footwear' },
    { id: 'p15', name: 'VaporMax Plus “Tiger”', brand: 'Nike', price: 309.00, image: 'https://i.imgur.com/pA8tHgC.png', category: 'footwear' },
    { id: 'p16', name: 'Yeezy 500 “Utility Black”', brand: 'Adidas', price: 379.00, image: 'https://i.imgur.com/nIAzz9e.png', category: 'footwear' },
    { id: 'p17', name: 'Bape Sta “Black Grey”', brand: 'Bape', price: 379.00, image: 'https://i.imgur.com/d9zLhAf.png', category: 'footwear' },
    { id: 'p18', name: 'Supreme x Nike Shox Ride 2 “Black”', brand: 'Nike', price: 379.00, image: 'https://i.imgur.com/vH1N9s6.png', category: 'footwear' },
    { id: 'p19', name: 'Supreme x Nike Shox Ride 2 “White”', brand: 'Nike', price: 379.00, image: 'https://i.imgur.com/9C31s4m.png', category: 'footwear' },
    { id: 'p20', name: 'Asics Gel NYC “Beige/White/Grey”', brand: 'Asics', price: 379.00, image: 'https://i.imgur.com/3iXYzHq.png', category: 'footwear' }
];

document.addEventListener('DOMContentLoaded', () => {

    /**
     * Módulo de Carregamento (Lógica melhorada)
     */
    const LoadingModule = (() => {
        const loadingOverlay = document.querySelector('.loading-overlay');

        function init() {
            if (!loadingOverlay) return;

            // Espera a página inteira carregar (incluindo scripts)
            window.addEventListener('load', () => {
                if (typeof gsap !== 'undefined') {
                    // Se o GSAP carregou, usa a animação dele
                    gsap.to(loadingOverlay, { opacity: 0, duration: 0.5, delay: 0.2, onComplete: () => {
                        loadingOverlay.style.display = 'none';
                    }});
                } else {
                    // Se o GSAP falhar, apenas esconde a tela com CSS
                    console.warn('GSAP not loaded. Using fallback to hide loading screen.');
                    loadingOverlay.style.transition = 'opacity 0.5s';
                    loadingOverlay.style.opacity = '0';
                    setTimeout(() => {
                        loadingOverlay.style.display = 'none';
                    }, 500);
                }
            });
        }
        return { init };
    })();

    /**
     * Módulo de Interação do Header
     */
    const HeaderModule = (() => {
        function init() {
            const header = document.querySelector('.main-header');
            if (!header) return;
            const handleScroll = () => {
                header.classList.toggle('scrolled', window.scrollY > 50);
            };
            window.addEventListener('scroll', handleScroll, { passive: true });
            handleScroll();
        }
        return { init };
    })();

    /**
     * Módulo de Tema (Dark/Light Mode)
     */
    const ThemeModule = (() => {
        function init() {
            const themeToggle = document.getElementById('themeToggle');
            if (!themeToggle) return;
            const storedTheme = localStorage.getItem('tnDoJapaTheme') || 'dark';
            document.documentElement.setAttribute('data-theme', storedTheme);
            themeToggle.checked = storedTheme === 'light';
            themeToggle.addEventListener('change', () => {
                const newTheme = themeToggle.checked ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('tnDoJapaTheme', newTheme);
            });
        }
        return { init };
    })();

    /**
     * Módulo de Navegação Mobile
     */
    const MobileNavModule = (() => {
        function init() {
            const toggleBtn = document.querySelector('.mobile-nav-toggle');
            if (!toggleBtn) return;
            toggleBtn.addEventListener('click', () => {
                const isOpened = toggleBtn.getAttribute('aria-expanded') === 'true';
                toggleBtn.setAttribute('aria-expanded', !isOpened);
                document.body.classList.toggle('nav-open');
            });
        }
        return { init };
    })();

    /**
     * Módulo de Animações com GSAP
     */
    const AnimationModule = (() => {
        function init() {
            if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
            gsap.registerPlugin(ScrollTrigger);

            gsap.from(".hero-title", { duration: 1, y: 50, opacity: 0, delay: 0.5, ease: "power3.out" });
            gsap.from(".hero-subtitle", { duration: 1, y: 50, opacity: 0, delay: 0.7, ease: "power3.out" });
            gsap.from(".hero .btn", { duration: 1, y: 50, opacity: 0, delay: 0.9, ease: "power3.out" });
            
            gsap.to(".hero-bg-image", {
                yPercent: 20,
                ease: "none",
                scrollTrigger: {
                    trigger: ".hero",
                    start: "top top",
                    end: "bottom top",
                    scrub: true
                },
            });

            const sections = ['.featured-sneaker', '.collection-section', '.crew', '.newsletter'];
            sections.forEach(section => {
                const el = document.querySelector(section);
                if (el) {
                    gsap.from(el, {
                        opacity: 0,
                        y: 50,
                        duration: 1,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: section,
                            start: 'top 80%',
                            toggleActions: 'play none none none'
                        }
                    });
                }
            });
        }
        return { init };
    })();


    /**
     * Módulo do Carrinho de Compras
     */
    const CartModule = (() => {
        const cartModal = document.getElementById('cartModal');
        if (!cartModal) return { init: () => {} };
        const cartButton = document.getElementById('cartButton');
        const closeButton = cartModal.querySelector('.close-modal');
        const overlay = cartModal.querySelector('.modal-overlay');
        const cartItemsContainer = document.getElementById('cartItems');
        const cartSubtotalEl = document.getElementById('cartSubtotal');
        const cartCountEl = document.querySelector('.cart-count');
        let items = JSON.parse(localStorage.getItem('tnDoJapaCart')) || [];
        const saveCart = () => localStorage.setItem('tnDoJapaCart', JSON.stringify(items));
        const toggleModal = () => cartModal.classList.toggle('active');
        const addItem = (productId) => {
            const product = productsData.find(p => p.id === productId);
            if (!product) return;
            const existingItem = items.find(item => item.id === productId);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                items.push({ ...product, quantity: 1 });
            }
            saveCart();
            updateCart();
            if (!cartModal.classList.contains('active')) {
                toggleModal();
            }
        };
        const updateQuantity = (productId, newQuantity) => {
            const itemIndex = items.findIndex(i => i.id === productId);
            if (itemIndex === -1) return;
            if (newQuantity <= 0) {
                items.splice(itemIndex, 1);
            } else {
                items[itemIndex].quantity = newQuantity;
            }
            saveCart();
            updateCart();
        };
        const updateCart = () => {
            renderCartItems();
            updateCartMeta();
        };
        const renderCartItems = () => {
            if (items.length === 0) {
                cartItemsContainer.innerHTML = `<div class="empty-cart-container"><i class="fas fa-shopping-bag"></i><p>Seu carrinho está vazio.</p><span>Adicione itens para vê-los aqui.</span></div>`;
                return;
            }
            cartItemsContainer.innerHTML = '';
            items.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                itemEl.dataset.id = item.id;
                itemEl.innerHTML = `<div class="cart-item-img"><img src="${item.image}" alt="${item.name}"></div><div class="cart-item-details"><h4 class="cart-item-title">${item.name}</h4><p class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</p><div class="quantity-controls"><button class="quantity-btn minus" aria-label="Diminuir">-</button><span class="quantity">${item.quantity}</span><button class="quantity-btn plus" aria-label="Aumentar">+</button></div></div><button class="cart-item-remove" aria-label="Remover"><i class="fas fa-trash"></i></button>`;
                cartItemsContainer.appendChild(itemEl);
            });
        };
        const updateCartMeta = () => {
            const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
            const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            cartCountEl.textContent = totalItems;
            if (totalItems > 0) {
                cartCountEl.classList.add('updated');
                setTimeout(() => cartCountEl.classList.remove('updated'), 300);
            }
            cartSubtotalEl.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
        };
        const initEventListeners = () => {
            if (cartButton) cartButton.addEventListener('click', toggleModal);
            if (closeButton) closeButton.addEventListener('click', toggleModal);
            if (overlay) overlay.addEventListener('click', toggleModal);
            document.body.addEventListener('click', e => {
                const addBtn = e.target.closest('.add-to-cart-btn');
                if (addBtn) {
                    const productCard = addBtn.closest('.product-card');
                    if (productCard && productCard.dataset.id) {
                        addItem(productCard.dataset.id);
                    }
                }
            });
            cartItemsContainer.addEventListener('click', e => {
                const itemEl = e.target.closest('.cart-item');
                if (!itemEl) return;
                const productId = itemEl.dataset.id;
                const item = items.find(i => i.id === productId);
                if (!item) return;
                if (e.target.closest('.plus')) {
                    updateQuantity(productId, item.quantity + 1);
                } else if (e.target.closest('.minus')) {
                    updateQuantity(productId, item.quantity - 1);
                } else if (e.target.closest('.cart-item-remove')) {
                    updateQuantity(productId, 0);
                }
            });
        };
        return { init: () => { initEventListeners(); updateCart(); } };
    })();

    /**
     * Módulo Principal da Aplicação
     */
    const AppModule = (() => {
        function init() {
            LoadingModule.init();
            HeaderModule.init();
            ThemeModule.init();
            MobileNavModule.init();
            // A inicialização da AnimationModule foi movida para dentro do 'load'
            // para garantir que o GSAP esteja disponível.
            window.addEventListener('load', AnimationModule.init);
            CartModule.init();

            const yearEl = document.getElementById('currentYear');
            if (yearEl) yearEl.textContent = new Date().getFullYear();
        }
        return { init };
    })();

    AppModule.init();
});