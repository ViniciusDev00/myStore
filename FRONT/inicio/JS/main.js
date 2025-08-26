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
  })();

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
