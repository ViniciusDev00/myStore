document.addEventListener("DOMContentLoaded", () => {
  /**
   * Módulo de Carregamento
   */
  const LoadingModule = (() => {
    const loadingOverlay = document.querySelector(".loading-overlay");
    function init() {
      if (loadingOverlay) {
        window.addEventListener("load", () => {
          loadingOverlay.style.opacity = "0";
          setTimeout(() => {
            loadingOverlay.style.display = "none";
          }, 500);
        });
      }
    }
    return { init };
  })();

  /**
   * Módulo de Interação do Header
   */
  const HeaderModule = (() => {
    function init() {
      const header = document.querySelector(".main-header");
      if (header) {
        const handleScroll = () => {
          header.classList.toggle("scrolled", window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
      }
    }
    return { init };
  })();

  /**
   * Módulo de Animações com GSAP
   */
  const AnimationModule = (() => {
    function init() {
      if (typeof gsap === "undefined") return;
      if (document.querySelector(".hero-title")) {
        gsap.from(".gsap-fade-up", {
          duration: 1,
          y: 50,
          opacity: 0,
          delay: 0.5,
          ease: "power3.out",
          stagger: 0.2,
        });
      }
    }
    return { init };
  })();

  /**
   * Módulo do Carrinho de Compras (NOVO E INTEGRADO)
   */
  const CartModule = (() => {
    const cartModal = document.getElementById("cartModal");
    const closeButton = document.getElementById("closeCartBtn");
    const overlay = document.getElementById("modalOverlay");
    const cartItemsContainer = document.getElementById("cartItemsContainer");
    const cartSubtotalEl = document.getElementById("cartSubtotal");
    const checkoutBtn = document.querySelector('.checkout-btn');

    let cart = JSON.parse(localStorage.getItem("japaUniverseCart")) || [];

    const saveCart = () => {
        localStorage.setItem("japaUniverseCart", JSON.stringify(cart));
    };
    
    const formatPrice = (price) => `R$ ${price.toFixed(2).replace('.', ',')}`;

    const toggleModal = () => {
        if (cartModal) cartModal.classList.toggle("active");
    };

    const updateCart = () => {
        renderCartItems();
        updateCartInfo();
    };

    const renderCartItems = () => {
        if (!cartItemsContainer) return;
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-message">O seu carrinho está vazio.</p>';
            return;
        }
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item" data-id="${item.id}" data-size="${item.size}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>Tamanho: ${item.size}</p>
                    <p class="price">${formatPrice(item.price)}</p>
                    <div class="cart-item-actions">
                        <div class="quantity-control">
                            <button class="quantity-btn quantity-decrease">-</button>
                            <input class="quantity-input" type="number" value="${item.quantity}" min="1">
                            <button class="quantity-btn quantity-increase">+</button>
                        </div>
                        <button class="remove-item-btn">Remover</button>
                    </div>
                </div>
            </div>
        `).join('');
    };

    const updateCartInfo = () => {
        const cartCountEl = document.querySelector(".cart-count");
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        if (cartCountEl) cartCountEl.textContent = totalItems;
        if (cartSubtotalEl) cartSubtotalEl.textContent = formatPrice(subtotal);
    };

    const addToCart = (product) => {
        const existingItem = cart.find(item => item.id === product.id && item.size === product.size);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        saveCart();
        updateCart();
        toggleModal();
    };
    
    const handleCartActions = (e) => {
        const target = e.target;
        const cartItemEl = target.closest('.cart-item');
        if (!cartItemEl) return;

        const id = cartItemEl.dataset.id;
        const size = cartItemEl.dataset.size;
        const itemIndex = cart.findIndex(item => item.id === id && item.size === size);
        
        if (itemIndex === -1) return;

        if (target.classList.contains('quantity-increase')) {
            cart[itemIndex].quantity++;
        } else if (target.classList.contains('quantity-decrease')) {
            if (cart[itemIndex].quantity > 1) {
                cart[itemIndex].quantity--;
            } else {
                cart.splice(itemIndex, 1);
            }
        } else if (target.classList.contains('remove-item-btn')) {
            cart.splice(itemIndex, 1);
        }
        saveCart();
        updateCart();
    };
    
    const init = () => {
        document.addEventListener('click', (e) => {
            if (e.target.closest('#cartButton')) {
                toggleModal();
            }
        });
        
        if (closeButton) closeButton.addEventListener("click", toggleModal);
        if (overlay) overlay.addEventListener("click", toggleModal);
        if (cartItemsContainer) cartItemsContainer.addEventListener('click', handleCartActions);
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                // Determina o caminho correto para o checkout
                const basePath = document.querySelector('header.main-header')?.dataset?.basepath || '.';
                window.location.href = `${basePath}/checkout/HTML/checkout.html`;
            });
        }
        
        window.addToCart = addToCart;
        updateCart();
    }

    return { init };
  })();

  /**
   * Módulo Principal da Aplicação
   */
  const AppModule = (() => {
    function init() {
      LoadingModule.init();
      HeaderModule.init();
      window.addEventListener("load", AnimationModule.init);
      CartModule.init(); // Inicia o carrinho

      const yearEl = document.getElementById("currentYear");
      if (yearEl) yearEl.textContent = new Date().getFullYear();
    }
    return { init };
  })();

  // Inicia a aplicação
  AppModule.init();
});