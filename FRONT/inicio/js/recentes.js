document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "https://api.japauniverse.com.br/api/produtos";

  const getImageUrl = (path) => {
      if (!path) return '';
      if (path.startsWith('http')) {
          return path;
      }
      return `/${path}`;
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
    } catch (error) {
      console.error("Falha ao carregar produtos:", error);
    }
  };

  fetchAndDistributeProducts();
});