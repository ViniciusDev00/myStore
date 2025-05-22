// eduStreet.js - JavaScript Remasterizado

document.addEventListener('DOMContentLoaded', function() {
    // ===== LOADING SCREEN =====
    const loadingScreen = document.querySelector('.loading');
    
    // Mostra o loading
    function showLoading() {
        loadingScreen.classList.add('active');
    }
    
    // Esconde o loading
    function hideLoading() {
        loadingScreen.classList.remove('active');
    }
    
    // Simula tempo de carregamento inicial
    showLoading();
    setTimeout(hideLoading, 1500);

    // ===== DARK MODE TOGGLE =====
    const themeToggle = document.getElementById('themeToggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    // Aplica o tema salvo
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeToggle.checked = currentTheme === 'dark';
    
    // Alterna entre temas
    themeToggle.addEventListener('change', function() {
        const newTheme = this.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // ===== SMOOTH SCROLL =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;
            
            // Remove classe active de todos os links
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            
            // Adiciona classe active no link clicado
            this.classList.add('active');
            
            // Scroll suave
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        });
    });

    // ===== HERO CAROUSEL =====
    const carousel = {
        track: document.querySelector('.carousel-track'),
        slides: document.querySelectorAll('.carousel-slide'),
        dotsContainer: document.querySelector('.carousel-dots'),
        prevBtn: document.querySelector('.carousel-control.prev'),
        nextBtn: document.querySelector('.carousel-control.next'),
        currentIndex: 0,
        interval: null,
        slideWidth: 0,
        isTransitioning: false,
        
        init() {
            this.slideWidth = this.slides[0].offsetWidth;
            this.setupSlides();
            this.createDots();
            this.setupEventListeners();
            this.startAutoPlay();
        },
        
        setupSlides() {
            // Posiciona os slides
            this.slides.forEach((slide, index) => {
                slide.style.left = `${this.slideWidth * index}px`;
            });
            
            // Clona slides para efeito infinito
            const firstClone = this.slides[0].cloneNode(true);
            const lastClone = this.slides[this.slides.length - 1].cloneNode(true);
            
            firstClone.classList.add('clone');
            lastClone.classList.add('clone');
            
            this.track.appendChild(firstClone);
            this.track.insertBefore(lastClone, this.slides[0]);
            
            this.track.style.transform = `translateX(-${this.slideWidth}px)`;
        },
        
        createDots() {
            this.dotsContainer.innerHTML = '';
            
            this.slides.forEach((_, index) => {
                const dot = document.createElement('span');
                dot.classList.add('dot');
                if (index === 0) dot.classList.add('active');
                
                dot.addEventListener('click', () => {
                    if (!this.isTransitioning) {
                        this.goToSlide(index);
                    }
                });
                
                this.dotsContainer.appendChild(dot);
            });
        },
        
        setupEventListeners() {
            this.prevBtn.addEventListener('click', () => this.prevSlide());
            this.nextBtn.addEventListener('click', () => this.nextSlide());
            
            this.track.addEventListener('mouseenter', () => this.pauseAutoPlay());
            this.track.addEventListener('mouseleave', () => this.startAutoPlay());
            
            this.track.addEventListener('transitionend', () => this.handleTransitionEnd());
        },
        
        goToSlide(index) {
            this.isTransitioning = true;
            this.currentIndex = index;
            
            this.track.style.transition = 'transform 0.5s ease';
            this.track.style.transform = `translateX(-${(this.currentIndex + 1) * this.slideWidth}px)`;
            
            this.updateDots();
        },
        
        nextSlide() {
            if (this.isTransitioning) return;
            this.currentIndex++;
            this.goToSlide(this.currentIndex);
            this.resetAutoPlay();
        },
        
        prevSlide() {
            if (this.isTransitioning) return;
            this.currentIndex--;
            this.goToSlide(this.currentIndex);
            this.resetAutoPlay();
        },
        
        handleTransitionEnd() {
            // Verifica se chegou no clone do início
            if (this.currentIndex === -1) {
                this.currentIndex = this.slides.length - 1;
                this.track.style.transition = 'none';
                this.track.style.transform = `translateX(-${(this.currentIndex + 1) * this.slideWidth}px)`;
            }
            
            // Verifica se chegou no clone do final
            if (this.currentIndex === this.slides.length) {
                this.currentIndex = 0;
                this.track.style.transition = 'none';
                this.track.style.transform = `translateX(-${(this.currentIndex + 1) * this.slideWidth}px)`;
            }
            
            this.isTransitioning = false;
        },
        
        updateDots() {
            const dots = document.querySelectorAll('.dot');
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === (this.currentIndex % this.slides.length));
            });
        },
        
        startAutoPlay() {
            this.interval = setInterval(() => {
                if (!this.isTransitioning) {
                    this.nextSlide();
                }
            }, 5000);
        },
        
        pauseAutoPlay() {
            clearInterval(this.interval);
        },
        
        resetAutoPlay() {
            this.pauseAutoPlay();
            this.startAutoPlay();
        }
    };
    
    carousel.init();

    // ===== PRODUCT FILTER =====
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active de todos os botões
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Adiciona active no botão clicado
            button.classList.add('active');
            
            const category = button.dataset.category;
            filterProducts(category);
        });
    });
    
    function filterProducts(category) {
        const products = document.querySelectorAll('.product-card');
        
        products.forEach(product => {
            if (category === 'all' || product.dataset.category === category) {
                product.style.display = 'block';
                
                // Animação de fade in
                product.style.animation = 'fadeIn 0.5s ease';
                setTimeout(() => {
                    product.style.animation = '';
                }, 500);
            } else {
                product.style.display = 'none';
            }
        });
    }

    // ===== SHOPPING CART =====
    const cart = {
        items: JSON.parse(localStorage.getItem('cart')) || [],
        modal: document.getElementById('cartModal'),
        cartButton: document.getElementById('cartButton'),
        closeButton: document.querySelector('.close-modal'),
        cartItemsContainer: document.getElementById('cartItems'),
        cartTotalElement: document.getElementById('cartTotal'),
        
        init() {
            this.setupEventListeners();
            this.updateCart();
        },
        
        setupEventListeners() {
            // Abrir/fechar modal
            this.cartButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleModal();
            });
            
            this.closeButton.addEventListener('click', () => this.toggleModal());
            
            // Fechar ao clicar no overlay
            document.querySelector('.modal-overlay').addEventListener('click', () => this.toggleModal());
            
            // Adicionar produto ao carrinho
            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('add-to-cart')) {
                    const productCard = e.target.closest('.product-card');
                    this.addItem({
                        id: productCard.dataset.id,
                        name: productCard.querySelector('.product-name').textContent,
                        price: productCard.querySelector('.current-price').textContent,
                        image: productCard.querySelector('.product-image').style.backgroundImage,
                        category: productCard.dataset.category
                    });
                }
                
                // Remover item do carrinho
                if (e.target.closest('.cart-item-remove')) {
                    const index = e.target.closest('.cart-item-remove').dataset.index;
                    this.removeItem(index);
                }
                
                // Atualizar quantidade
                if (e.target.closest('.quantity-btn')) {
                    const btn = e.target.closest('.quantity-btn');
                    const index = btn.dataset.index;
                    const isPlus = btn.classList.contains('plus');
                    const quantityElement = btn.parentElement.querySelector('.quantity');
                    let newQuantity = parseInt(quantityElement.textContent);
                    
                    newQuantity = isPlus ? newQuantity + 1 : newQuantity - 1;
                    this.updateQuantity(index, newQuantity);
                }
            });
        },
        
        toggleModal() {
            this.modal.classList.toggle('active');
            document.body.style.overflow = this.modal.classList.contains('active') ? 'hidden' : 'auto';
        },
        
        addItem(product) {
            showLoading();
            
            setTimeout(() => {
                const existingItem = this.items.find(item => item.id === product.id);
                
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    product.quantity = 1;
                    this.items.push(product);
                }
                
                this.updateCart();
                this.showAddFeedback(product.id);
                hideLoading();
            }, 500);
        },
        
        removeItem(index) {
            showLoading();
            
            setTimeout(() => {
                this.items.splice(index, 1);
                this.updateCart();
                hideLoading();
            }, 300);
        },
        
        updateQuantity(index, newQuantity) {
            if (newQuantity > 0) {
                this.items[index].quantity = newQuantity;
            } else {
                this.items.splice(index, 1);
            }
            
            this.updateCart();
        },
        
        updateCart() {
            // Salva no localStorage
            localStorage.setItem('cart', JSON.stringify(this.items));
            
            // Atualiza contador no ícone do carrinho
            const totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
            document.querySelector('.cart-count').textContent = totalItems;
            
            // Atualiza modal do carrinho
            this.updateCartModal();
        },
        
        updateCartModal() {
            this.cartItemsContainer.innerHTML = '';
            
            if (this.items.length === 0) {
                this.cartItemsContainer.innerHTML = '<p class="empty-cart">Seu carrinho está vazio. Comece a comprar!</p>';
                this.cartTotalElement.textContent = 'R$ 0,00';
                return;
            }
            
            let total = 0;
            
            this.items.forEach((item, index) => {
                const priceValue = parseFloat(item.price.replace('R$ ', '').replace(',', '.'));
                const itemTotal = priceValue * item.quantity;
                total += itemTotal;
                
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-img" style="${item.image}"></div>
                    <div class="cart-item-details">
                        <h4 class="cart-item-title">${item.name}</h4>
                        <p class="cart-item-price">${item.price}</p>
                        <div class="quantity-controls">
                            <button class="quantity-btn minus" data-index="${index}">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn plus" data-index="${index}">+</button>
                        </div>
                        <p class="cart-item-total">R$ ${itemTotal.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <button class="cart-item-remove" data-index="${index}"><i class="fas fa-trash"></i></button>
                `;
                
                this.cartItemsContainer.appendChild(cartItem);
            });
            
            this.cartTotalElement.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        },
        
        showAddFeedback(productId) {
            const addButton = document.querySelector(`[data-id="${productId}"] .add-to-cart`);
            if (!addButton) return;
            
            const originalText = addButton.textContent;
            
            addButton.innerHTML = '<i class="fas fa-check"></i> ADICIONADO';
            addButton.classList.add('added');
            
            setTimeout(() => {
                addButton.textContent = originalText;
                addButton.classList.remove('added');
            }, 2000);
        }
    };
    
    cart.init();

    // ===== QUICK VIEW =====
    document.querySelectorAll('.quick-view').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Simula o quick view (pode ser substituído por um modal real)
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('.product-name').textContent;
            
            showLoading();
            
            setTimeout(() => {
                hideLoading();
                alert(`Visualização rápida: ${productName}\n\nEm uma implementação real, aqui seria exibida uma janela modal com mais detalhes e imagens do produto.`);
            }, 800);
        });
    });

    // ===== NEWSLETTER FORM =====
    const newsletterForm = document.getElementById('newsletterForm');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (!validateEmail(email)) {
                emailInput.style.border = '1px solid red';
                return;
            }
            
            showLoading();
            
            // Simula envio do formulário
            setTimeout(() => {
                hideLoading();
                emailInput.style.border = '';
                emailInput.value = '';
                
                showSuccessMessage('Obrigado por se inscrever! Você receberá nossas novidades em breve.');
            }, 1000);
        });
    }
    
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    function showSuccessMessage(message) {
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        successMsg.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <p>${message}</p>
        `;
        
        newsletterForm.parentNode.insertBefore(successMsg, newsletterForm.nextSibling);
        
        setTimeout(() => {
            successMsg.style.opacity = '0';
            setTimeout(() => successMsg.remove(), 500);
        }, 3000);
    }

    // ===== ANIMAÇÕES E EFEITOS =====
    // Atualiza o ano no footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Efeito de hover nos cards de produto
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            const image = card.querySelector('.product-image');
            image.style.transform = 'scale(1.05)';
        });
        
        card.addEventListener('mouseleave', () => {
            const image = card.querySelector('.product-image');
            image.style.transform = 'scale(1)';
        });
    });
    
    // Efeito de digitação no título do hero (se existir)
    const heroTitle = document.querySelector('.slide-title');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        heroTitle.textContent = '';
        
        let i = 0;
        const typingEffect = setInterval(() => {
            if (i < originalText.length) {
                heroTitle.textContent += originalText.charAt(i);
                i++;
            } else {
                clearInterval(typingEffect);
            }
        }, 100);
    }
    
    // Ativa classe active no nav conforme scroll
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        
        document.querySelectorAll('section').forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                    
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
});

// ===== ANIMAÇÕES CSS ADICIONAIS =====
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .success-message {
        background: rgba(0,0,0,0.8);
        color: white;
        padding: var(--space-md);
        margin-top: var(--space-sm);
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        transition: var(--transition-normal);
    }
    
    .success-message i {
        color: var(--primary);
        font-size: 1.5rem;
    }
    
    .added {
        background-color: #4CAF50 !important;
        animation: pulse 0.5s;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    .featured .product-image {
        animation: float 3s ease-in-out infinite;
    }
    
    @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
`;
document.head.appendChild(style);