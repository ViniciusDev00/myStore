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
   * Módulo de Animações com GSAP (Corrigido)
   */
  const AnimationModule = (() => {
    function init() {
      if (typeof gsap === "undefined") {
          console.warn("GSAP library not loaded, skipping animations.");
          return;
      }
      
      const heroTitle = document.querySelector(".hero-title");
      const elementsToAnimate = document.querySelectorAll(".gsap-fade-up");

      if (heroTitle && elementsToAnimate.length > 0) {
          console.log("Hero animation elements found, applying animations.");
          gsap.from(".gsap-fade-up", {
              duration: 1,
              y: 50,
              opacity: 0,
              delay: 0.5,
              ease: "power3.out",
              stagger: 0.2,
          });
      } else {
          console.log("Hero animation elements not found on this page, skipping animations.");
      }
    }
    return { init };
  })();


  /**
   * Módulo do Carrinho de Compras (Mantido)
   */
  const CartModule = (() => {
    const cartModal = document.getElementById("cartModal");
    const closeButton = document.getElementById("closeCartBtn");
    const overlay = document.getElementById("modalOverlay");
    const cartItemsContainer = document.getElementById("cartItemsContainer");
    const cartSubtotalEl = document.getElementById("cartSubtotal");
    const checkoutBtn = document.querySelector('.checkout-btn');

    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem("japaUniverseCart")) || [];
    } catch (e) {
        console.error("Erro ao ler o carrinho do localStorage:", e);
        cart = [];
    }


    const saveCart = () => {
        try {
            localStorage.setItem("japaUniverseCart", JSON.stringify(cart));
        } catch (e) {
            console.error("Erro ao salvar o carrinho no localStorage:", e);
        }
    };
    
    const formatPrice = (price) => {
        // Verifica se 'price' é um número válido antes de formatar
        const numericPrice = Number(price);
        if (isNaN(numericPrice)) {
            console.warn("Tentativa de formatar preço inválido:", price);
            return "R$ --,--"; // Retorna um placeholder ou valor padrão
        }
        return `R$ ${numericPrice.toFixed(2).replace('.', ',')}`;
    };


    const toggleModal = () => {
        if (cartModal) {
            const isActive = cartModal.classList.contains("active");
            if (!isActive) {
                updateCart(); // Atualiza ANTES de mostrar
            }
            cartModal.classList.toggle("active");
        } else {
             console.error("Elemento do modal do carrinho (#cartModal) não encontrado.");
        }
    };


    const updateCart = () => {
        renderCartItems();
        updateCartInfo();
    };

    const renderCartItems = () => {
        if (!cartItemsContainer) return;
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-message">O seu carrinho está vazio.</p>';
             if (checkoutBtn) checkoutBtn.disabled = true;
            return;
        }
        
         if (checkoutBtn) checkoutBtn.disabled = false;
         
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item" data-id="${item.id}" data-size="${item.size}">
                <img src="${item.image || 'placeholder.png'}" alt="${item.name || 'Produto'}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4>${item.name || 'Nome Indisponível'}</h4>
                    <p>Tamanho: ${item.size || 'N/A'}</p>
                    <p class="price">${formatPrice(item.price || 0)}</p>
                    <div class="cart-item-actions">
                        <div class="quantity-control">
                            <button class="quantity-btn quantity-decrease" aria-label="Diminuir quantidade">-</button>
                            <input class="quantity-input" type="number" value="${item.quantity || 1}" min="1" aria-label="Quantidade">
                            <button class="quantity-btn quantity-increase" aria-label="Aumentar quantidade">+</button>
                        </div>
                        <button class="remove-item-btn" aria-label="Remover item">Remover</button>
                    </div>
                </div>
            </div>
        `).join('');
    };


    const updateCartInfo = () => {
        const cartCountEl = document.querySelector(".cart-count");
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
        const subtotal = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
        
        if (cartCountEl) {
             cartCountEl.textContent = totalItems;
             cartCountEl.classList.toggle('updated', totalItems > 0 && cartCountEl.textContent !== totalItems.toString());
             setTimeout(() => cartCountEl.classList.remove('updated'), 300);
        }
        if (cartSubtotalEl) {
             cartSubtotalEl.textContent = formatPrice(subtotal);
        }
    };


    const addToCart = (product) => {
        if (!product || !product.id || !product.size || product.price === undefined || !product.name) { // Verifica price explicitamente
             console.error("Tentativa de adicionar produto inválido ao carrinho:", product);
             alert("Erro: Não foi possível adicionar o produto ao carrinho (dados inválidos).");
             return;
        }
        
        const existingItemIndex = cart.findIndex(item => item.id === product.id && item.size === product.size);
        
        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 0) + 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        saveCart();
        updateCart();
        
         // Abre o modal do carrinho APENAS se ele não estiver ativo
         if (cartModal && !cartModal.classList.contains('active')) {
             toggleModal();
         } else {
             // Se o modal do carrinho já estiver aberto, apenas atualiza a info (contador e subtotal)
             // O renderCartItems() já foi chamado dentro de updateCart()
             updateCartInfo(); 
         }
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
        } 
        else if (target.classList.contains('quantity-decrease')) {
            if (cart[itemIndex].quantity > 1) {
                cart[itemIndex].quantity--;
            } else {
                cart.splice(itemIndex, 1); // Remove se diminuir de 1
            }
        } 
        else if (target.classList.contains('remove-item-btn')) {
            cart.splice(itemIndex, 1); // Remove diretamente
        }
        else if (target.classList.contains('quantity-input')) {
             const newQuantity = parseInt(target.value, 10);
             // Impede quantidade < 1
             if (!isNaN(newQuantity) && newQuantity >= 1) { 
                 cart[itemIndex].quantity = newQuantity;
             } else {
                 // Se inválido, volta ao valor anterior ou 1
                 target.value = cart[itemIndex].quantity || 1; 
             }
        }

        saveCart();
        // Renderiza itens e atualiza info após qualquer ação
        renderCartItems(); 
        updateCartInfo(); 
    };
    
    const init = () => {
        // Listener para abrir o modal do carrinho
        document.addEventListener('click', (e) => {
            if (e.target.closest('#cartButton')) {
                 console.log("Cart button clicked");
                 toggleModal();
            }
        });
        
        // Listeners para fechar o modal do carrinho
        if (closeButton) closeButton.addEventListener("click", toggleModal);
        if (overlay) overlay.addEventListener("click", toggleModal);
        
        // Listeners para ações DENTRO do modal do carrinho
        if (cartItemsContainer) {
            cartItemsContainer.addEventListener('click', handleCartActions);
            // Atualiza também se o valor do input for alterado diretamente
            cartItemsContainer.addEventListener('input', (e) => { 
                if (e.target.classList.contains('quantity-input')) {
                    handleCartActions(e);
                }
            });
        }
        
        // Listener para o botão de checkout DENTRO do modal do carrinho
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                const basePathAttr = document.querySelector('header.main-header')?.dataset?.basepath;
                const absoluteBasePath = basePathAttr ? new URL(basePathAttr, window.location.origin).pathname.replace(/\/$/, '') : '';
                const checkoutUrl = `${absoluteBasePath}/FRONT/checkout/HTML/checkout.html`;
                console.log("Navigating to checkout:", checkoutUrl);
                window.location.href = checkoutUrl;
            });
        }
        
        // Expõe funções globalmente
        window.addToCart = addToCart;
        window.updateCartCounter = updateCartInfo; 
        
        // Atualiza o contador no header ao carregar a página
        updateCartInfo(); 
    }

    // Exporta funções que podem ser úteis para outros módulos
    return { 
        init, 
        formatPrice, // Expor formatPrice
        getImageUrl: (path) => { // Expor getImageUrl
            if (!path) return '/FRONT/assets/images/placeholder-product.jpg'; // Corrigido caminho
            if (path.startsWith('http')) return path;
            // Assume que a API está na raiz se não for URL completa
            return `http://localhost:8080/${path}`;
        } 
    };
  })();

  /**
   * *** MÓDULO Quick View CORRIGIDO PARA MATCH CSS ***
   * (Usando classes corretas: .quickview- ao invés de .quick-view-)
   */
  const QuickViewModule = (() => {
    // =========================================================================
    // VETOR IX: CORREÇÃO DE URL CRÍTICA
    // Define a URL base para a API, consistente com o ambiente de DEV (localhost)
    // =========================================================================
    const API_BASE = 'http://localhost:8080/api'; 
    // =========================================================================

    // Elementos do DOM
    const quickViewElements = {
        overlay: document.getElementById('quickViewModal'),
        content: document.getElementById('quickViewContent'),
        // O botão de fechar externo já é referenciado corretamente
        closeBtn: document.getElementById('closeQuickViewBtn') 
    };

    // Estado local do modal
    let quickViewProduct = null;
    let selectedSize = null;

    // Dependências (funções globais ou do CartModule)
    const formatPrice = CartModule.formatPrice;
    const getImageUrl = CartModule.getImageUrl;

    // Sistema de Notificações
    const showNotification = (message, type = 'success') => {
        const notification = document.createElement('div');
        // Usa a classe .notification
        notification.className = `notification notification-${type}`; 
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : type === 'warning' ? 'exclamation' : 'info'}"></i>
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    };

    // Lógica principal do Quick View
    const quickViewSystem = {
        openQuickView: async (productId) => {
            quickViewProduct = null;
            selectedSize = null;
            
            if (!quickViewElements.overlay) {
                console.error("Elemento do modal Quick View (#quickViewModal) não encontrado.");
                showNotification("Erro ao abrir detalhes do produto.", "error");
                return;
            }

            // Adiciona a classe que o CSS do catálogo espera no overlay
            quickViewElements.overlay.classList.add('quickview-modal-overlay'); 
            quickViewSystem.showSkeleton();
            quickViewElements.overlay.classList.add('active');
            document.body.style.overflow = 'hidden';

            try {
                const response = await axios.get(`${API_BASE}/produtos/${productId}`);
                const product = response.data;

                if (!product) {
                    quickViewSystem.showError('Produto não encontrado na base de dados.');
                    return;
                }

                quickViewProduct = product;
                await quickViewSystem.loadProductDetails(product); 

            } catch (error) {
                console.error('Erro ao carregar detalhes do produto via API:', error);
                quickViewSystem.showError('Erro ao buscar informações do produto.');
            }
        },

        // Mostra a estrutura do modal com placeholders enquanto carrega
        showSkeleton: () => {
             // Removido o envolucro e botão duplicado.
             quickViewElements.content.innerHTML = `
                <div class="quickview-gallery quickview-skeleton-image"></div>
                <div class="quickview-details">
                    <div class="quickview-brand quickview-skeleton-text short"></div>
                    <h1 class="quickview-title quickview-skeleton-text long"></h1>
                    <div class="quickview-price quickview-skeleton-price"></div>
                    <div class="quickview-shipping quickview-skeleton-text medium"></div>
                    <p class="quickview-description quickview-skeleton-text long"></p>
                    <p class="quickview-description quickview-skeleton-text medium"></p>
                    <div class="quickview-size-section quickview-skeleton-text long"></div>
                    <div class="quickview-actions quickview-skeleton-button"></div>
                    <div class="quickview-features quickview-skeleton-text medium"></div>
                </div>
            `;
        },

        loadProductDetails: async (product) => {
            return new Promise((resolve) => {
                setTimeout(() => { 
                    const productDetails = {
                        ...product,
                        description: product.descricao || "Descrição detalhada do produto não disponível no momento. Este tênis combina estilo e conforto, sendo perfeito para uso diário.", 
                        images: [ product.imagemUrl, product.imagemUrl, product.imagemUrl ], 
                        features: [
                            { icon: 'fas fa-shoe-prints', text: 'Amortecimento Avançado' },
                            { icon: 'fas fa-wind', text: 'Material Respirável' },
                            { icon: 'fas fa-weight-hanging', text: 'Leveza Garantida' },
                            { icon: 'fas fa-award', text: 'Qualidade Premium' }
                        ],
                        sizes: quickViewSystem.generateAvailableSizes(product) 
                    };
                    
                    quickViewSystem.renderProductDetails(productDetails);
                    resolve(productDetails);
                }, 500);
            });
        },

        // Renderiza o HTML final do modal com os dados do produto
        renderProductDetails: (product) => {
            const hasDiscount = product.precoOriginal && product.precoOriginal > product.preco;
            const discountPercent = hasDiscount ? 
                Math.round(((product.precoOriginal - product.preco) / product.precoOriginal) * 100) : 0;

            // Removido o envolucro extra (.quickview-modal-content) e o botão de fechar duplicado
            quickViewElements.content.innerHTML = `
                <div class="quickview-gallery">
                    <img src="${getImageUrl(product.images[0])}" 
                         alt="${product.nome}" 
                         class="quickview-main-image"
                         id="quickViewMainImage">
                    <div class="quickview-thumbnails">
                        ${product.images.map((image, index) => `
                            <img src="${getImageUrl(image)}" 
                                 alt="${product.nome} - Imagem ${index + 1}"
                                 class="quickview-thumbnail ${index === 0 ? 'active' : ''}"
                                 data-image-index="${index}">
                        `).join('')}
                    </div>
                </div>
                <div class="quickview-details">
                    <div class="quickview-brand">${product.marca?.nome || 'Marca Desconhecida'}</div>
                    <h1 class="quickview-title">${product.nome}</h1>
                    <div class="quickview-price">
                        <span class="quickview-current-price">${formatPrice(product.preco)}</span>
                        ${hasDiscount ? `
                            <span class="quickview-original-price">${formatPrice(product.precoOriginal)}</span>
                            <span class="quickview-discount">-${discountPercent}%</span> 
                        ` : ''}
                    </div>
                    <div class="quickview-shipping">
                        <i class="fas fa-shipping-fast"></i>
                        <span>Frete Grátis</span>
                    </div>
                    <p class="quickview-description">${product.description}</p>
                    <div class="quickview-size-section">
                        <div class="quickview-size-title">Selecione o Tamanho:</div>
                        <div class="quickview-size-options" id="quickViewSizeOptions">
                            ${Object.keys(product.sizes).map(size => {
                                const quantity = product.sizes[size];
                                const isDisabled = quantity <= 0;
                                return `
                                    <div class="quickview-size-option ${isDisabled ? 'disabled' : ''}" 
                                         data-size="${size}">
                                        ${size}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    <div class="quickview-actions">
                        <button class="btn btn-primary quickview-add-to-cart" 
                                id="quickViewAddToCart"
                                disabled> 
                            <i class="fas fa-shopping-bag"></i>
                            Adicionar ao Carrinho
                        </button>
                    </div>
                    <div class="quickview-features">
                        ${product.features.map(feature => `
                            <div class="quickview-feature">
                                <i class="${feature.icon}"></i>
                                <span>${feature.text}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

            quickViewSystem.addGalleryEventListeners();
            quickViewSystem.addModalEventListeners();
        },

        // Funções de evento... (usando as novas classes)
        addGalleryEventListeners: () => {
            const thumbnails = document.querySelectorAll('.quickview-thumbnail');
            const mainImage = document.getElementById('quickViewMainImage');
            
            thumbnails.forEach(thumb => {
                thumb.addEventListener('click', () => {
                    thumbnails.forEach(t => t.classList.remove('active'));
                    thumb.classList.add('active');
                    mainImage.src = thumb.src;
                });
            });
        },

        addModalEventListeners: () => {
            const sizeOptions = document.querySelectorAll('.quickview-size-option:not(.disabled)');
            sizeOptions.forEach(option => {
                option.addEventListener('click', () => {
                    quickViewSystem.selectSize(option);
                });
            });

            const addToCartBtn = document.getElementById('quickViewAddToCart');
            if (addToCartBtn) {
                addToCartBtn.addEventListener('click', () => {
                    quickViewSystem.addToCartFromQuickView();
                });
            }
        },

        selectSize: (element) => {
            document.querySelectorAll('.quickview-size-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            element.classList.add('selected');
            selectedSize = element.dataset.size;
            document.getElementById('quickViewAddToCart').disabled = false;
        },

        addToCartFromQuickView: () => {
            if (!selectedSize) {
                showNotification('Por favor, selecione um tamanho.', 'error');
                return;
            }
            if (!quickViewProduct) {
                showNotification('Erro: Detalhes do produto não carregados.', 'error');
                return;
            }

            if (typeof window.addToCart === 'function') {
                const productToAdd = {
                    id: quickViewProduct.id.toString(),
                    name: quickViewProduct.nome,
                    price: quickViewProduct.preco,
                    image: getImageUrl(quickViewProduct.imagemUrl),
                    size: selectedSize,
                    quantity: 1
                };
                
                window.addToCart(productToAdd); 
                quickViewSystem.closeQuickView();
                showNotification(`${quickViewProduct.nome} (Tamanho: ${selectedSize}) adicionado!`);
            } else {
                console.error("Função window.addToCart não encontrada. Verifique se CartModule está inicializado.");
                quickViewSystem.closeQuickView();
                showNotification('Erro interno ao adicionar ao carrinho.', 'error');
            }
        },

        generateAvailableSizes: (product) => {
            const sizes = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
            const availableSizes = {};
            const totalStock = product.estoque || 0; 
            sizes.forEach(size => {
                availableSizes[size] = totalStock > 0 ? Math.floor(Math.random() * 5) + 1 : 0;
            });
            return availableSizes;
        },

        closeQuickView: () => {
            if (quickViewElements.overlay) {
                quickViewElements.overlay.classList.remove('active');
                // Remove a classe overlay do CSS do catalogo
                quickViewElements.overlay.classList.remove('quickview-modal-overlay'); 
            }
            
            // Tenta limpar o conteúdo para remover qualquer artefato visual
            setTimeout(() => {
                if (quickViewElements.content) {
                    quickViewElements.content.innerHTML = ''; 
                }
            }, 300); // Espera a transição de fechamento do modal

            quickViewProduct = null;
            selectedSize = null;
            // GARANTE que o scroll da página seja reativado
            document.body.style.overflow = ''; 
        },

        showError: (message) => {
            if (!quickViewElements.content) return;
            // Usando a classe .quickview-error
            quickViewElements.content.innerHTML = `
                <div class="quickview-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Erro ao Carregar</h3>
                    <p>${message}</p>
                    <button class="btn btn-outline" id="quickViewErrorCloseBtn">
                        Fechar Modal
                    </button>
                </div>
            `;
            const errorCloseBtn = document.getElementById('quickViewErrorCloseBtn');
            if (errorCloseBtn) {
                 errorCloseBtn.addEventListener('click', quickViewSystem.closeQuickView);
            }
        }
    };

    // Função de inicialização do Módulo QuickView
    const init = () => {
        // Listener para o botão de fechar (X) do DOM estático
        if (quickViewElements.closeBtn) { 
            quickViewElements.closeBtn.addEventListener('click', quickViewSystem.closeQuickView);
        }
        
        // Listener para fechar clicando no overlay
        if (quickViewElements.overlay) {
            quickViewElements.overlay.addEventListener('click', (e) => {
                // Checa se o clique foi *diretamente* no overlay (e não no modal-content)
                const isOverlayClick = e.target.classList.contains('quickview-modal-overlay') || e.target === quickViewElements.overlay;
                if (isOverlayClick) {
                    quickViewSystem.closeQuickView();
                }
            });
        }
        
        // Fecha com a tecla ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && quickViewElements.overlay?.classList.contains('active')) {
                quickViewSystem.closeQuickView();
            }
        });

        // Expõe globalmente as funções
        window.quickViewApp = {
            openQuickView: quickViewSystem.openQuickView,
            showNotification: showNotification
        };
    };
    
    return { init };

  })();


  /**
   * Módulo Principal da Aplicação
   */
  const AppModule = (() => {
    function init() {
      LoadingModule.init();
      HeaderModule.init();
      // Animações GSAP iniciadas APÓS a página carregar
      window.addEventListener("load", AnimationModule.init); 
      CartModule.init(); // Inicia o módulo do Carrinho
      QuickViewModule.init(); // Inicia o módulo do Quick View

      // Atualiza o ano no rodapé
      const yearEl = document.getElementById("currentYear");
      if (yearEl) yearEl.textContent = new Date().getFullYear();
    }
    // Retorna a função de inicialização principal
    return { init };
  })();

  // Inicia a aplicação chamando a inicialização do AppModule
  AppModule.init();
});