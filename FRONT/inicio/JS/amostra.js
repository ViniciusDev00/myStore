document.addEventListener("DOMContentLoaded", function () {
  // --- Carrossel da Seção "Featured Sneaker" ---
  // Seleciona o elemento HTML que contém o carrossel e o inicializa com o Swiper.
  const featuredSwiper = new Swiper(".featured-image-wrapper", {
    // Opções de configuração do Swiper

    // Ativa o loop, permitindo que o carrossel volte ao início após o último slide.
    // É ótimo para vitrines.
    loop: true,

    // Configura a paginação (os pontos na parte inferior)
    pagination: {
      el: ".swiper-pagination", // Seletor do container da paginação
      clickable: true, // Permite que o usuário clique nos pontos para navegar
    },

    // Configura os botões de navegação (as setas de próximo/anterior)
    navigation: {
      nextEl: ".swiper-button-next", // Seletor do botão "próximo"
      prevEl: ".swiper-button-prev", // Seletor do botão "anterior"
    },
  });
});
