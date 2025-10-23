document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "https://api.japauniverse.com.br/api/produtos";
  
  // NOVO: Variáveis e elementos do Modal (Requer que o HTML do modal esteja no inicio.html)
  let selectedProductId = null;
  let selectedSize = null;
  // Acessa os elementos do modal que devem estar presentes no HTML
  const modalOverlay = document.getElementById('sizeSelectionModal');
  const closeButton = document.getElementById('closeSizeModalBtn');
  const sizeOptionsContainer = document.getElementById('sizeOptions');
  const addToCartModalBtn = document.getElementById('addToCartModalBtn');
  const modalProductName = document.getElementById('modalProductName');
  const modalError = document.getElementById('modalError');

  // NOVO: Funções de Controle do Modal (Replicadas do catalogo.js)
  const openSizeSelectionModal = (productId, productName, availableSizes) => {
      // Retorna se os elementos do modal não forem encontrados (erro no HTML)
      if (!modalOverlay) {
          console.error("Erro: Elementos do Modal não encontrados no HTML da página inicial.");
          return;
      }

      selectedProductId = productId;
      selectedSize = null; 
      modalError.style.display = 'none';

      modalProductName.textContent = `Selecione o Tamanho para: ${productName}`;
      sizeOptionsContainer.innerHTML = '';
      
      const sortedSizes = Object.keys(availableSizes).sort((a, b) => parseInt(a) - parseInt(b));

      if (sortedSizes.length === 0) {
          sizeOptionsContainer.innerHTML = `<p style="color: var(--text-secondary); text-align: center;">Nenhum tamanho em estoque.</p>`;
          addToCartModalBtn.disabled = true;
      } else {
          addToCartModalBtn.disabled = false;
          sortedSizes.forEach(size => {
              const quantity = availableSizes[size];
              const sizeBtn = document.createElement('span');
              sizeBtn.classList.add('size-option');
              sizeBtn.textContent = size;
              sizeBtn.dataset.size = size;

              if (quantity <= 0) {
                  sizeBtn.classList.add('disabled');
                  sizeBtn.title = 'Esgotado';
              } else {
                  sizeBtn.addEventListener('click', () => {
                      sizeOptionsContainer.querySelectorAll('.size-option').forEach(btn => {
                          btn.classList.remove('selected');
                      });
                      sizeBtn.classList.add('selected');
                      selectedSize = size;
                      modalError.style.display = 'none'; 
                  });
              }
              sizeOptionsContainer.appendChild(sizeBtn);
          });
      }
      modalOverlay.classList.add('active');
  };

  const closeSizeSelectionModal = () => {
      if (!modalOverlay) return;
      modalOverlay.classList.remove('active');
      selectedProductId = null;
      selectedSize = null;
  };

  // Event Listeners do Modal
  if (closeButton) closeButton.addEventListener('click', closeSizeSelectionModal);
  if (modalOverlay) modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeSizeSelectionModal();
  });

  // Lógica final de adição ao carrinho
  if (addToCartModalBtn) addToCartModalBtn.addEventListener('click', () => {
      if (!selectedSize) {
          modalError.textContent = "Selecione um tamanho antes de adicionar.";
          modalError.style.display = 'block';
          return;
      }
      
      // ATENÇÃO: Depende da função window.addToCart existir no escopo global (Ex: main.js)
      if (typeof window.addToCart === 'function') {
          // Simula os dados do produto para o módulo do carrinho
          const productDetails = window.allProducts.find(p => p.id === parseInt(selectedProductId));
          if (productDetails) {
              const productToAdd = {
                  id: productDetails.id.toString(),
                  name: productDetails.nome,
                  price: productDetails.preco,
                  image: getImageUrl(productDetails.imagemUrl),
                  size: selectedSize,
                  quantity: 1
              };
              window.addToCart(productToAdd); 
              closeSizeSelectionModal();
          } else {
                // Mantém o alerta apenas para erro de lógica interna.
                alert("Erro ao encontrar detalhes do produto.");
          }
      } else {
          console.error("Função window.addToCart não encontrada.");
          closeSizeSelectionModal();
      }
  });
  // FIM NOVO: Funções de Controle do Modal

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
          <button class="btn btn-primary add-to-cart-btn" 
                  data-product-id="${product.id}"
                  data-product-name="${product.nome}">Adicionar ao Carrinho</button>
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

  // NOVO: Função para adicionar listeners aos botões
  const addCartButtonListeners = () => {
      document.querySelectorAll('.product-card .add-to-cart-btn').forEach(button => {
          if (button.dataset.listenerAdded) return; 

          button.addEventListener('click', async (e) => {
              e.preventDefault();
              e.stopPropagation();

              const productId = e.target.dataset.productId;
              const productName = e.target.dataset.productName;

              // Busca o produto completo da lista allProducts (que foi carregada em fetchAndDistributeProducts)
              const productDetails = window.allProducts.find(p => p.id === parseInt(productId));

              if (!productDetails || productDetails.estoque <= 0) {
                  alert("Produto esgotado ou detalhes de estoque não encontrados.");
                  return;
              }

              // *** SIMULAÇÃO DE ESTOQUE POR TAMANHO ***
              const sizes = ['38', '39', '40', '41', '42', '43'];
              const availableSizes = {};
              
              sizes.forEach(size => {
                  availableSizes[size] = productDetails.estoque > 0 ? 10 : 0; 
              });
              // *** FIM SIMULAÇÃO ***
              
              openSizeSelectionModal(productId, productName, availableSizes);
          });
          button.dataset.listenerAdded = 'true';
      });
  }
  // FIM NOVO: Função para adicionar listeners aos botões
  
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
      
      // NOVO: Adiciona listeners após renderizar os produtos
      addCartButtonListeners(); 

    } catch (error) {
      console.error("Falha ao carregar produtos:", error);
    }
  };

  fetchAndDistributeProducts();
});