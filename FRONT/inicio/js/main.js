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
   * Módulo de Animações com GSAP (CORRIGIDO)
   */
  const AnimationModule = (() => {
    function init() {
      // Verifica se a biblioteca GSAP foi carregada
      if (typeof gsap === "undefined") {
          console.warn("GSAP library not loaded, skipping animations.");
          return; // Sai da função se GSAP não estiver disponível
      }
      
      // *** CORREÇÃO APLICADA AQUI ***
      // Verifica se os elementos específicos da animação da hero existem na página atual
      const heroTitle = document.querySelector(".hero-title");
      const elementsToAnimate = document.querySelectorAll(".gsap-fade-up");

      if (heroTitle && elementsToAnimate.length > 0) {
          // Só executa a animação se os elementos existirem
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
          // Informa no console que as animações foram puladas (útil para debug)
          console.log("Hero animation elements not found on this page, skipping animations.");
      }
      // *** FIM DA CORREÇÃO ***
    }
    return { init };
  })();


  /**
   * Módulo do Carrinho de Compras (Mantido como estava)
   */
  const CartModule = (() => {
    const cartModal = document.getElementById("cartModal");
    const closeButton = document.getElementById("closeCartBtn");
    const overlay = document.getElementById("modalOverlay");
    const cartItemsContainer = document.getElementById("cartItemsContainer");
    const cartSubtotalEl = document.getElementById("cartSubtotal");
    const checkoutBtn = document.querySelector('.checkout-btn'); // Botão dentro do modal

    // Tenta pegar o carrinho do localStorage ou inicializa um array vazio
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem("japaUniverseCart")) || [];
    } catch (e) {
        console.error("Erro ao ler o carrinho do localStorage:", e);
        cart = []; // Garante que o carrinho seja um array em caso de erro
    }


    const saveCart = () => {
        try {
            localStorage.setItem("japaUniverseCart", JSON.stringify(cart));
        } catch (e) {
            console.error("Erro ao salvar o carrinho no localStorage:", e);
        }
    };
    
    // Função para formatar preço (ex: 99.9 -> R$ 99,90)
    const formatPrice = (price) => {
        const numericPrice = Number(price); // Garante que é um número
        if (isNaN(numericPrice)) {
            console.warn("Tentativa de formatar preço inválido:", price);
            return "R$ --,--"; // Retorna um placeholder se não for número
        }
        return `R$ ${numericPrice.toFixed(2).replace('.', ',')}`;
    };


    const toggleModal = () => {
        if (cartModal) {
            const isActive = cartModal.classList.contains("active");
             // Atualiza o conteúdo do carrinho *antes* de mostrar
            if (!isActive) {
                updateCart();
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
            // Desabilita o botão de checkout se o carrinho estiver vazio
             if (checkoutBtn) checkoutBtn.disabled = true;
            return;
        }
        
        // Habilita o botão de checkout se houver itens
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
        // Calcula total de itens e subtotal
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
        const subtotal = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
        
        if (cartCountEl) {
             cartCountEl.textContent = totalItems;
             // Adiciona/remove classe para animação se o total mudou (opcional)
             cartCountEl.classList.toggle('updated', totalItems > 0 && cartCountEl.textContent !== totalItems.toString());
             setTimeout(() => cartCountEl.classList.remove('updated'), 300); // Remove a classe após animação
        }
        if (cartSubtotalEl) {
             cartSubtotalEl.textContent = formatPrice(subtotal);
        }
    };


    const addToCart = (product) => {
        // Validação básica do produto
        if (!product || !product.id || !product.size || !product.price || !product.name) {
             console.error("Tentativa de adicionar produto inválido ao carrinho:", product);
             alert("Erro: Não foi possível adicionar o produto ao carrinho (dados inválidos).");
             return;
        }
        
        const existingItemIndex = cart.findIndex(item => item.id === product.id && item.size === product.size);
        
        if (existingItemIndex > -1) {
            // Se já existe, incrementa a quantidade
            cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 0) + 1;
        } else {
            // Se não existe, adiciona com quantidade 1
            cart.push({ ...product, quantity: 1 });
        }
        saveCart(); // Salva no localStorage
        updateCart(); // Atualiza a interface (contador e modal se aberto)
        
         // Abre o modal somente se ele não estiver ativo
         if (cartModal && !cartModal.classList.contains('active')) {
             toggleModal();
         } else {
             updateCart(); // Se já estiver aberto, apenas atualiza
         }
    };
    
    // Função para lidar com cliques nos botões de quantidade e remover
    const handleCartActions = (e) => {
        const target = e.target;
        const cartItemEl = target.closest('.cart-item');
        if (!cartItemEl) return; // Sai se o clique não foi dentro de um item

        const id = cartItemEl.dataset.id;
        const size = cartItemEl.dataset.size;
        const itemIndex = cart.findIndex(item => item.id === id && item.size === size);
        
        if (itemIndex === -1) return; // Item não encontrado no array (erro)

        // Aumentar quantidade
        if (target.classList.contains('quantity-increase')) {
            cart[itemIndex].quantity++;
        } 
        // Diminuir quantidade
        else if (target.classList.contains('quantity-decrease')) {
            if (cart[itemIndex].quantity > 1) {
                cart[itemIndex].quantity--;
            } else {
                // Se for 1, remove o item
                cart.splice(itemIndex, 1);
            }
        } 
        // Remover item
        else if (target.classList.contains('remove-item-btn')) {
            cart.splice(itemIndex, 1);
        }
        // Atualiza input de quantidade (se o clique foi nos botões +/-)
        else if (target.classList.contains('quantity-input')) {
             const newQuantity = parseInt(target.value, 10);
             if (!isNaN(newQuantity) && newQuantity >= 1) {
                 cart[itemIndex].quantity = newQuantity;
             } else {
                 // Se inválido, volta ao valor anterior ou 1
                 target.value = cart[itemIndex].quantity || 1;
             }
        }

        saveCart(); // Salva as alterações
        updateCart(); // Re-renderiza o carrinho
    };
    
    // Inicialização do módulo do carrinho
    const init = () => {
        // Listener GERAL para abrir o modal pelo botão do header
        document.addEventListener('click', (e) => {
            // Verifica se o elemento clicado ou um de seus pais é o #cartButton
            if (e.target.closest('#cartButton')) {
                 console.log("Cart button clicked"); // Log para depuração
                 toggleModal();
            }
        });
        
        // Listeners para fechar o modal
        if (closeButton) closeButton.addEventListener("click", toggleModal);
        if (overlay) overlay.addEventListener("click", toggleModal);
        
        // Listener para ações DENTRO do modal (quantidade, remover)
        // Usa 'input' para pegar mudanças no campo de quantidade também
        if (cartItemsContainer) {
            cartItemsContainer.addEventListener('click', handleCartActions);
            cartItemsContainer.addEventListener('input', handleCartActions);
        }
        
        // Listener para o botão de finalizar compra DENTRO do modal
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                // Pega o basepath definido no header.js ou assume '.'
                const basePathAttr = document.querySelector('header.main-header')?.dataset?.basepath;
                 // Constrói o caminho absoluto garantido
                 // Se basePathAttr for '.', window.location.origin será usado.
                 // Se for '../..', ele navegará corretamente a partir da raiz.
                const absoluteBasePath = basePathAttr ? new URL(basePathAttr, window.location.origin).pathname.replace(/\/$/, '') : '';
                const checkoutUrl = `${absoluteBasePath}/FRONT/checkout/HTML/checkout.html`;
                console.log("Navigating to checkout:", checkoutUrl); // Log para depuração
                window.location.href = checkoutUrl;

            });
        }
        
        // Expõe a função addToCart globalmente para ser usada por outros scripts
        window.addToCart = addToCart;
         // Expõe updateCartCounter para ser usado pelo checkout.js
         window.updateCartCounter = updateCartInfo; 
        
        updateCart(); // Atualiza visualmente o carrinho ao carregar a página
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
      // Animações só são iniciadas APÓS a página carregar completamente
      window.addEventListener("load", AnimationModule.init);
      CartModule.init(); // Inicia o carrinho

      // Atualiza o ano no rodapé
      const yearEl = document.getElementById("currentYear");
      if (yearEl) yearEl.textContent = new Date().getFullYear();
    }
    return { init };
  })();

  // Inicia a aplicação
  AppModule.init();
});