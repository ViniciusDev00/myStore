document.addEventListener("DOMContentLoaded", () => {
  /**
   * Módulo de Carregamento
   */
  const LoadingModule = (() => {
    const loadingOverlay = document.querySelector(".loading-overlay");
    function init() {
      if (!loadingOverlay) return; // VERIFICA SE EXISTE
      window.addEventListener("load", () => {
        loadingOverlay.style.opacity = "0";
        setTimeout(() => {
          loadingOverlay.style.display = "none";
        }, 500);
      });
    }
    return { init };
  })();document.addEventListener("DOMContentLoaded", () => {
    // Seus outros módulos como LoadingModule, HeaderModule, AnimationModule continuam aqui...
    // ...

    /**
     * Módulo do Carrinho de Compras
     */
    const CartModule = (() => {
        const cartModal = document.getElementById("cartModal");
        const closeButton = document.getElementById("closeCartBtn");
        const overlay = document.getElementById("modalOverlay");
        const cartItemsContainer = document.getElementById("cartItemsContainer");
        const cartSubtotalEl = document.getElementById("cartSubtotal");

        // Usamos um nome de chave mais específico para o localStorage
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
            // O cartCountEl é atualizado no header.js, mas podemos atualizar aqui também
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
            toggleModal(); // Abre o carrinho ao adicionar um item
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
                    cart.splice(itemIndex, 1); // Remove se a quantidade for 1 e clicar em diminuir
                }
            } else if (target.classList.contains('remove-item-btn')) {
                cart.splice(itemIndex, 1);
            }
            saveCart();
            updateCart();
        };
        
        const init = () => {
            // Adicionar evento de clique ao botão do carrinho no header dinamicamente
            document.addEventListener('click', (e) => {
                if (e.target.closest('#cartButton')) {
                    toggleModal();
                }
            });
            
            if (closeButton) closeButton.addEventListener("click", toggleModal);
            if (overlay) overlay.addEventListener("click", toggleModal);
            if (cartItemsContainer) cartItemsContainer.addEventListener('click', handleCartActions);
            
            window.addToCart = addToCart;
            updateCart();
        }

        return { init };
    })();

    // Iniciar Módulo do Carrinho
    CartModule.init();
});

  /**
   * Módulo de Interação do Header
   */
  const HeaderModule = (() => {
    function init() {
      const header = document.querySelector(".main-header");
      if (!header) return; // VERIFICA SE EXISTE
      const handleScroll = () => {
        header.classList.toggle("scrolled", window.scrollY > 50);
      };
      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();
    }
    return { init };
  })();

  /**
   * Módulo de Tema (Dark/Light Mode)
   */
  const ThemeModule = (() => {
    function init() {
      // A lógica de tema agora está dentro do header.js,
      // mas se você tiver um toggle em outro lugar, pode mantê-lo aqui
      // com as devidas verificações.
    }
    return { init };
  })();

  /**
   * Módulo de Navegação Mobile
   */
  const MobileNavModule = (() => {
    function init() {
      // A lógica do menu mobile agora está no header.js
    }
    return { init };
  })();

  /**
   * Módulo de Animações com GSAP
   */
  const AnimationModule = (() => {
    function init() {
      if (typeof gsap === "undefined") return;

      // Anima apenas se os elementos existirem na página
      if (document.querySelector(".hero-title")) {
        gsap.from(".hero-title", {
          duration: 1,
          y: 50,
          opacity: 0,
          delay: 0.5,
          ease: "power3.out",
        });
      }
      if (document.querySelector(".hero-subtitle")) {
        gsap.from(".hero-subtitle", {
          duration: 1,
          y: 50,
          opacity: 0,
          delay: 0.7,
          ease: "power3.out",
        });
      }
      if (document.querySelector(".hero .btn")) {
        gsap.from(".hero .btn", {
          duration: 1,
          y: 50,
          opacity: 0,
          delay: 0.9,
          ease: "power3.out",
        });
      }
    }
    return { init };
  })();

  /**
   * Módulo do Carrinho de Compras
   */
  const CartModule = (() => {
    // Agora buscamos os elementos DENTRO do init
    let cartModal, cartButton, closeButton, overlay;
    let items = JSON.parse(localStorage.getItem("tnDoJapaCart")) || [];

    const saveCart = () =>
      localStorage.setItem("tnDoJapaCart", JSON.stringify(items));

    const toggleModal = () => {
      if (cartModal) cartModal.classList.toggle("active");
    };

    const updateCart = () => {
      // Lógica para renderizar itens e atualizar totais (mantenha como estava)
    };

    const initEventListeners = () => {
      // Só adiciona os eventos se os botões forem encontrados
      if (cartButton) cartButton.addEventListener("click", toggleModal);
      if (closeButton) closeButton.addEventListener("click", toggleModal);
      if (overlay) overlay.addEventListener("click", toggleModal);

      document.body.addEventListener("click", (e) => {
        const addBtn = e.target.closest(".add-to-cart-btn");
        if (addBtn) {
          // Lógica para adicionar ao carrinho (mantenha como estava)
        }
      });
    };

    function init() {
      // Busca os elementos SÓ QUANDO o módulo é iniciado
      cartModal = document.getElementById("cartModal");

      // Se não há modal na página, não faz mais nada
      if (!cartModal) return;

      cartButton = document.getElementById("cartButton");
      closeButton = cartModal.querySelector(".close-modal");
      overlay = cartModal.querySelector(".modal-overlay");

      initEventListeners();
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
      HeaderModule.init(); // O header.js já faz o trabalho principal
      window.addEventListener("load", AnimationModule.init);
      CartModule.init(); // O módulo do carrinho agora é seguro

      const yearEl = document.getElementById("currentYear");
      if (yearEl) yearEl.textContent = new Date().getFullYear();
    }
    return { init };
  })();

  AppModule.init();
});
