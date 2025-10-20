document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "https://api.japauniverse.com.br/api/produtos";

  const getImageUrl = (path) => {
      if (!path) return '';
      if (path.startsWith('http')) {
          return path;
      }
      return `https://api.japauniverse.com.br/${path}`;
  };

  const renderProductRow = (productsToRender, containerId) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = productsToRender.map(product => `
      <div class="swiper-slide">
        <div class="product-card" data-id="${product.id}">
          <a href="/FRONT/produto/HTML/produto.html?id=${product.id}" class="product-card-link">
            <div class="product-image-wrapper">
              <img src="${getImageUrl(product.imagemUrl)}" alt="${product.nome}">
            </div>
            <div class="product-info">
              <span class="product-brand">${product.marca.nome}</span>
              <h3 class="product-name">${product.nome}</h3>
              <div class="shipping-tag">Frete Grátis</div>
              <p class="product-price">R$ ${product.preco.toFixed(2).replace(".", ",")}</p>
            </div>
          </a>
          <button class="btn btn-primary add-to-cart-btn" data-product-id="${product.id}">Adicionar ao Carrinho</button>
        </div>
      </div>
    `).join("");
  };

  const initSwiper = (containerClass, navPrevClass, navNextClass) => {
    const swiperEl = document.querySelector(containerClass);
    if (!swiperEl || swiperEl.classList.contains("swiper-initialized")) return;
    new Swiper(containerClass, {
      slidesPerView: "auto",
      spaceBetween: 24,
      freeMode: true,
      scrollbar: { el: `${containerClass} .swiper-scrollbar`, draggable: true },
      navigation: { nextEl: navNextClass, prevEl: navPrevClass },
    });
  };

  const sectionsToBuild = [
    { categoryName: "Air Max 95", containerId: "products-95", swiperClass: ".collection-swiper-95", prev: ".collection-prev-95", next: ".collection-next-95" },
    { categoryName: "Air Max DN", containerId: "products-dn", swiperClass: ".collection-swiper-dn", prev: ".collection-prev-dn", next: ".collection-next-dn" },
    { categoryName: "Air Max TN", containerId: "products-tn", swiperClass: ".collection-swiper-tn", prev: ".collection-prev-tn", next: ".collection-next-tn" },
  ];

  const fetchAndDistributeProducts = async () => {
    try {
      const response = await axios.get(API_URL);
      const allProducts = response.data;
      
      window.allProducts = allProducts; 

      sectionsToBuild.forEach((section) => {
        const filteredProducts = allProducts.filter(p => p.categoria.nome === section.categoryName);
        renderProductRow(filteredProducts, section.containerId);
        initSwiper(section.swiperClass, section.prev, section.next);
      });

      // NOVO: Adiciona listener ao final da renderização
      addCartButtonListeners(); 

    } catch (error) {
      console.error("Falha ao carregar produtos:", error);
    }
  };
  
  // NOVO: Função para adicionar listeners aos botões de 'Adicionar ao Carrinho'
  const addCartButtonListeners = () => {
      document.querySelectorAll('.product-card .add-to-cart-btn').forEach(button => {
          // Garante que o listener não é adicionado duas vezes
          if (button.dataset.listenerAdded) return; 

          button.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();

              const productId = e.target.dataset.productId;

              // Mensagem de aviso que cumpre o requisito de "exibir o modal de aviso"
              const confirmRedirect = confirm("Por favor, selecione um tamanho antes de adicionar ao carrinho. Você será redirecionado para a página do produto.");
              
              if (confirmRedirect) {
                  // Redireciona para a página de detalhes do produto para a seleção de tamanho
                  window.location.href = `/FRONT/produto/HTML/produto.html?id=${productId}`;
              }
          });
          button.dataset.listenerAdded = 'true'; // Marca como adicionado
      });
  }

  fetchAndDistributeProducts();
});