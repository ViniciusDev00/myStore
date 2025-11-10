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
   * *** NOVO MÓDULO: Quick View ***
   * (Adaptado de catalogo.js para funcionar globalmente)
   */
  const QuickViewModule = (() => {
    // Elementos do DOM
    const quickViewElements = {
        overlay: document.getElementById('quickViewModal'),
        content: document.getElementById('quickViewContent'),
        closeBtn: document.getElementById('closeQuickViewBtn')
    };

    // Estado local do modal
    let quickViewProduct = null;
    let selectedSize = null;

    // Dependências (funções globais ou do CartModule)
    const formatPrice = CartModule.formatPrice; // Reutiliza a função do CartModule
    const getImageUrl = CartModule.getImageUrl; // Reutiliza a função do CartModule

    // Sistema de Notificações (copiado de catalogo.js)
    const showNotification = (message, type = 'success') => {
        const notification = document.createElement('div');
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
            quickViewProduct = null; // Reseta produto atual
            selectedSize = null; // Reseta tamanho selecionado
            
            // Verifica se o overlay do modal existe no HTML
            if (!quickViewElements.overlay) {
                console.error("Elemento do modal Quick View (#quickViewModal) não encontrado.");
                showNotification("Erro ao abrir detalhes do produto.", "error"); // Notifica o usuário
                return;
            }

            // Mostra skeleton e abre o modal
            quickViewSystem.showSkeleton();
            quickViewElements.overlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Impede scroll do fundo

            try {
                // *** ALTERAÇÃO PRINCIPAL: Busca o produto direto na API ***
                const response = await axios.get(`https://api.japauniverse.com.br/api/produtos/${productId}`);
                const product = response.data;

                // Verifica se o produto foi encontrado na API
                if (!product) {
                    quickViewSystem.showError('Produto não encontrado na base de dados.');
                    return;
                }

                quickViewProduct = product; // Armazena os dados do produto atual
                // 'loadProductDetails' simula um tempo de carga e adiciona dados mocados (descrição, etc.)
                await quickViewSystem.loadProductDetails(product); 

            } catch (error) {
                console.error('Erro ao carregar detalhes do produto via API:', error);
                quickViewSystem.showError('Erro ao buscar informações do produto.'); // Mensagem genérica para o usuário
            }
        },

        // Mostra a estrutura do modal com placeholders enquanto carrega
        showSkeleton: () => {
             quickViewElements.content.innerHTML = `
                <div class="quickview-skeleton">
                    <div class="quickview-skeleton-image skeleton"></div>
                    <div class="quickview-skeleton-details">
                        <div class="quickview-skeleton-text short skeleton"></div>
                        <div class="quickview-skeleton-text long skeleton"></div>
                        <div class="quickview-skeleton-text medium skeleton"></div>
                        <div class="quickview-skeleton-price skeleton"></div>
                        <div class="quickview-skeleton-text long skeleton"></div>
                        <div class="quickview-skeleton-text long skeleton"></div>
                        <div class="quickview-skeleton-text long skeleton"></div>
                        <div class="quickview-skeleton-button skeleton"></div>
                    </div>
                </div>
            `;
        },

        // Simula uma carga e adiciona dados mocados (descrição, features, tamanhos)
        loadProductDetails: async (product) => {
            return new Promise((resolve) => {
                // Simula um tempo de espera (ex: 800ms)
                setTimeout(() => { 
                    // Cria um objeto com detalhes completos, adicionando dados que não vêm da API
                    const productDetails = {
                        ...product, // Copia todos os dados da API
                        // Adiciona uma descrição padrão se não houver na API
                        description: product.descricao || "Descrição detalhada do produto não disponível no momento. Este tênis combina estilo e conforto...", 
                        // Simula múltiplas imagens (poderia buscar de outra fonte se necessário)
                        images: [ product.imagemUrl, product.imagemUrl, product.imagemUrl ], 
                        // Adiciona características fixas (poderiam ser dinâmicas)
                        features: [
                            { icon: 'fas fa-shoe-prints', text: 'Amortecimento Avançado' },
                            { icon: 'fas fa-wind', text: 'Material Respirável' },
                            { icon: 'fas fa-weight-hanging', text: 'Leveza Garantida' },
                            { icon: 'fas fa-award', text: 'Qualidade Premium' }
                        ],
                        // Gera tamanhos disponíveis (simulado)
                        sizes: quickViewSystem.generateAvailableSizes(product) 
                    };
                    
                    // Renderiza o modal com os detalhes completos
                    quickViewSystem.renderProductDetails(productDetails);
                    resolve(productDetails); // Finaliza a Promise
                }, 500); // Reduzido para 500ms
            });
        },

        // Renderiza o HTML final do modal com os dados do produto
        renderProductDetails: (product) => {
            const hasDiscount = product.precoOriginal && product.precoOriginal > product.preco;
            const discountPercent = hasDiscount ? 
                Math.round(((product.precoOriginal - product.preco) / product.precoOriginal) * 100) : 0; // CORREÇÃO APLICADA AQUI

            // Gera o HTML do conteúdo do modal
            quickViewElements.content.innerHTML = `
                <div class="quickview-content">
                    <div class="quickview-gallery">
                        <img src="${getImageUrl(product.images[0])}" 
                             alt="${product.nome}" 
                             class="quickview-main-image"
                             id="quickviewMainImage">
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
                            <div class="quickview-size-options" id="quickviewSizeOptions">
                                ${Object.keys(product.sizes).map(size => {
                                    const quantity = product.sizes[size];
                                    const isDisabled = quantity <= 0;
                                    return `
                                        <div class="quickview-size-option ${isDisabled ? 'disabled' : ''}" 
                                             data-size="${size}">
                                            ${size}
                                            ${!isDisabled ? `<small style="display: block; font-size: 0.7em; opacity: 0.7;">${quantity} un</small>` : ''}
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                        <div class="quickview-actions">
                            <button class="btn btn-primary quickview-add-to-cart" 
                                    id="quickviewAddToCart"
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
                </div>
            `;

            // Adiciona listeners para a galeria de imagens e botões internos do modal
            quickViewSystem.addGalleryEventListeners();
            quickViewSystem.addModalEventListeners(); 
        },

        // Adiciona listeners às miniaturas da galeria
        addGalleryEventListeners: () => {
            const thumbnails = document.querySelectorAll('.quickview-thumbnail');
            const mainImage = document.getElementById('quickviewMainImage');
            
            thumbnails.forEach(thumb => {
                thumb.addEventListener('click', () => {
                    // Remove 'active' de todas, adiciona na clicada e atualiza imagem principal
                    thumbnails.forEach(t => t.classList.remove('active'));
                    thumb.classList.add('active');
                    mainImage.src = thumb.src;
                });
            });
        },

        // Adiciona listeners aos botões de tamanho e ao botão "Adicionar ao Carrinho"
        addModalEventListeners: () => {
            // Adiciona listener aos botões de tamanho (que não estão desabilitados)
            const sizeOptions = document.querySelectorAll('.quickview-size-option:not(.disabled)');
            sizeOptions.forEach(option => {
                option.addEventListener('click', () => {
                    quickViewSystem.selectSize(option); // Chama a função que marca o tamanho
                });
            });

            // Adiciona listener ao botão principal "Adicionar ao Carrinho"
            const addToCartBtn = document.getElementById('quickviewAddToCart');
            if (addToCartBtn) {
                addToCartBtn.addEventListener('click', () => {
                    quickViewSystem.addToCartFromQuickView(); // Chama a função de adicionar
                });
            }
        },

        // Marca o tamanho selecionado e habilita o botão de adicionar
        selectSize: (element) => {
            // Desmarca todos os outros tamanhos
            document.querySelectorAll('.quickview-size-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            // Marca o clicado
            element.classList.add('selected');
            // Guarda o tamanho selecionado na variável global do modal
            selectedSize = element.dataset.size;
            // Habilita o botão "Adicionar ao Carrinho"
            document.getElementById('quickviewAddToCart').disabled = false;
        },

        // Função chamada ao clicar no botão "Adicionar ao Carrinho" do modal
        addToCartFromQuickView: () => {
            // Valida se um tamanho foi selecionado
            if (!selectedSize) {
                showNotification('Por favor, selecione um tamanho.', 'error');
                return;
            }
            // Valida se os dados do produto estão carregados
            if (!quickViewProduct) {
                showNotification('Erro: Detalhes do produto não carregados.', 'error');
                return;
            }

            // Verifica se a função global 'addToCart' (do CartModule) existe
            if (typeof window.addToCart === 'function') {
                // Monta o objeto do produto no formato esperado pelo carrinho
                const productToAdd = {
                    id: quickViewProduct.id.toString(),
                    name: quickViewProduct.nome,
                    price: quickViewProduct.preco,
                    image: getImageUrl(quickViewProduct.imagemUrl),
                    size: selectedSize,
                    quantity: 1 // Adiciona sempre 1 unidade por vez pelo Quick View
                };
                
                // Chama a função global para adicionar ao carrinho
                window.addToCart(productToAdd); 
                quickViewSystem.closeQuickView(); // Fecha o modal Quick View
                // Mostra notificação de sucesso
                showNotification(`${quickViewProduct.nome} (Tamanho: ${selectedSize}) adicionado!`);
            } else {
                // Se a função global não for encontrada (erro de script)
                console.error("Função window.addToCart não encontrada. Verifique se CartModule está inicializado.");
                quickViewSystem.closeQuickView(); // Fecham o modal mesmo assim
                showNotification('Erro interno ao adicionar ao carrinho.', 'error');
            }
        },

        // Gera tamanhos aleatórios com estoque simulado (usado em loadProductDetails)
        generateAvailableSizes: (product) => {
            const sizes = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
            const availableSizes = {};
            // Usa o estoque real do produto vindo da API
            const totalStock = product.estoque || 0; 
            // Distribui aleatoriamente o estoque entre os tamanhos (simulação)
            sizes.forEach(size => {
                 // Define estoque aleatório (1 a 5) se houver estoque total, senão 0
                availableSizes[size] = totalStock > 0 ? Math.floor(Math.random() * 5) + 1 : 0;
            });
            return availableSizes;
        },

        // Fecha o modal Quick View e reseta variáveis
        closeQuickView: () => {
            if (quickViewElements.overlay) {
                quickViewElements.overlay.classList.remove('active');
            }
            quickViewProduct = null; // Limpa dados do produto
            selectedSize = null; // Limpa tamanho selecionado
            document.body.style.overflow = ''; // Libera scroll do fundo
        },

        // Mostra uma mensagem de erro dentro do modal
        showError: (message) => {
            if (!quickViewElements.content) return; // Segurança extra
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
            // Adiciona listener ao botão de fechar da tela de erro
            const errorCloseBtn = document.getElementById('quickViewErrorCloseBtn');
            if (errorCloseBtn) {
                 errorCloseBtn.addEventListener('click', quickViewSystem.closeQuickView);
            }
        }
    };

    // Função de inicialização do Módulo QuickView
    const init = () => {
        // Adiciona listeners globais para fechar o modal
        if (quickViewElements.closeBtn) {
            quickViewElements.closeBtn.addEventListener('click', quickViewSystem.closeQuickView);
        }
        if (quickViewElements.overlay) {
            // Fecha se clicar fora do conteúdo
            quickViewElements.overlay.addEventListener('click', (e) => {
                if (e.target === quickViewElements.overlay) {
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

        // Expõe globalmente as funções necessárias para outros scripts
        window.quickViewApp = {
            openQuickView: quickViewSystem.openQuickView,
            showNotification: showNotification // Expor notificação se necessário
        };
    };
    
    // Retorna a função de inicialização para ser chamada pelo AppModule
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
