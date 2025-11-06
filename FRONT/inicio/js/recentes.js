document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "http://localhost:8080/api/produtos";

    // Mapeamento das seções e seus elementos Swiper
    const sectionsToBuild = [
        { categoryName: "Air Max 95", containerId: "products-95", swiperClass: ".collection-swiper-95", prev: ".collection-prev-95", next: ".collection-next-95" },
        { categoryName: "Air Max DN", containerId: "products-dn", swiperClass: ".collection-swiper-dn", prev: ".collection-prev-dn", next: ".collection-next-dn" },
        { categoryName: "Air Max TN", containerId: "products-tn", swiperClass: ".collection-swiper-tn", prev: ".collection-prev-tn", next: ".collection-next-tn" },
    ];

    // Armazena todos os produtos buscados para referência rápida
    let allProducts = [];

    // Funções utilitárias (podem ser movidas para um arquivo utils.js se preferir)
    const formatPrice = (price) => {
        if (typeof price !== 'number') return 'R$ --,--';
        return `R$ ${price.toFixed(2).replace('.', ',')}`;
    }

    const getImageUrl = (path) => {
        if (!path) return 'FRONT/assets/images/placeholder-product.jpg'; // Usar um placeholder
        if (path.startsWith('http')) return path;
        return `http://localhost:8080/${path}`;
    };

    // Renderiza os cards de produto em um container específico
    const renderProductRow = (productsToRender, containerId) => {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container com ID '${containerId}' não encontrado.`);
            return;
        }

        // Gera HTML apenas se houver produtos
        if (productsToRender && productsToRender.length > 0) {
            container.innerHTML = productsToRender.map(product => `
                <div class="swiper-slide">
                    <div class="product-card" data-id="${product.id}">
                        <a href="/FRONT/produto/HTML/produto.html?id=${product.id}" class="product-card-link">
                            <div class="product-image-wrapper">
                                <img src="${getImageUrl(product.imagemUrl)}" alt="${product.nome || 'Nome do produto'}">
                            </div>
                            <div class="product-info">
                                <span class="product-brand">${product.marca?.nome || 'Marca'}</span>
                                <h3 class="product-name">${product.nome || 'Produto sem nome'}</h3>
                                <div class="shipping-tag">Frete Grátis</div>
                                <p class="product-price">${formatPrice(product.preco)}</p>
                            </div>
                        </a>
                        <button class="btn btn-primary add-to-cart-btn"
                                data-product-id="${product.id}">
                            Adicionar ao Carrinho
                        </button>
                    </div>
                </div>
            `).join("");
        } else {
            // Mensagem se não houver produtos para a categoria
            container.innerHTML = `<div class="swiper-slide"><p style="padding: 20px; text-align: center; color: var(--text-secondary);">Nenhum produto encontrado nesta categoria.</p></div>`;
        }
    };

    // Inicializa o Swiper para um container específico
    const initSwiper = (containerClass, navPrevClass, navNextClass) => {
        const swiperEl = document.querySelector(containerClass);
        // Só inicializa se o elemento existir E não tiver sido inicializado antes
        if (!swiperEl || swiperEl.swiper) return;

        try {
            new Swiper(containerClass, {
                slidesPerView: "auto", // Mostra quantos slides couberem
                spaceBetween: 24, // Espaçamento entre slides
                freeMode: false, // Desliza livremente, sem travar em posições fixas
                scrollbar: {
                    el: `${containerClass} .swiper-scrollbar`, // Elemento da barra de scroll
                    draggable: true, // Permite arrastar a barra
                },
                navigation: {
                    nextEl: navNextClass, // Seletor botão "próximo"
                    prevEl: navPrevClass, // Seletor botão "anterior"
                },
                breakpoints: { // Ajustes para diferentes tamanhos de tela (opcional, mas bom)
                    // Mobile pequeno já coberto pelo 'auto'
                    640: { // Tablets
                        slidesPerView: 2,
                        spaceBetween: 20,
                    },
                    1024: { // Desktops menores
                        slidesPerView: 3,
                        spaceBetween: 30,
                    },
                     1440: { // Desktops maiores
                        slidesPerView: 4, // Exibe mais slides em telas grandes
                        spaceBetween: 30,
                    }
                }
            });
        } catch (e) {
            console.error(`Erro ao inicializar Swiper para ${containerClass}:`, e);
        }
    };

    // Adiciona os event listeners aos botões "Adicionar ao Carrinho"
    const addCartButtonListeners = () => {
        // Seleciona todos os botões que ainda não tiveram listener adicionado
        document.querySelectorAll('.product-card .add-to-cart-btn:not([data-listener-added="true"])').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault(); // Impede o link da imagem/nome de ser seguido
                e.stopPropagation(); // Impede que o clique "borbulhe" para o link do card

                const productId = e.currentTarget.dataset.productId;

                // *** CHAMA A FUNÇÃO GLOBAL DO QUICK VIEW ***
                // Verifica se a função existe (foi criada em main.js)
                if (window.quickViewApp && typeof window.quickViewApp.openQuickView === 'function') {
                    window.quickViewApp.openQuickView(productId);
                } else {
                    console.error('Erro: QuickViewApp não está definido ou a função openQuickView não existe.');
                    // Fallback: Adiciona direto ao carrinho ou mostra erro
                    // alert('Erro ao abrir a visualização rápida do produto.');
                     // Fallback (adicionar direto ao carrinho como antes, se necessário)
                    const product = allProducts.find(p => p.id == productId);
                    if(product && window.addToCart) {
                         window.addToCart({
                            id: product.id.toString(),
                            name: product.nome,
                            price: product.preco,
                            image: getImageUrl(product.imagemUrl),
                            size: 'Único', // Ou um tamanho padrão
                            quantity: 1
                        });
                        alert(`${product.nome} adicionado ao carrinho (tamanho padrão).`);
                    } else {
                        alert('Erro ao adicionar o produto ao carrinho.');
                    }
                }
            });
            // Marca o botão para não adicionar o listener novamente
            button.dataset.listenerAdded = 'true';
        });
    };

    // Função principal: busca produtos e monta as seções
    const fetchAndDistributeProducts = async () => {
        // Adiciona skeletons enquanto carrega
        sectionsToBuild.forEach(section => {
             const container = document.getElementById(section.containerId);
             if (container) {
                 // Gera HTML de Skeletons (4 por seção, por exemplo)
                 container.innerHTML = Array(4).fill(0).map(() => `
                    <div class="swiper-slide skeleton-card">
                         <div class="product-image-wrapper skeleton skeleton-image" style="height: 260px;"></div>
                         <div class="product-info skeleton" style="padding: var(--space-md); gap: 0.5rem;">
                             <div class="skeleton skeleton-text short"></div>
                             <div class="skeleton skeleton-text medium"></div>
                             <div class="skeleton skeleton-text short" style="height: 1.2rem; width: 40%; margin-top: auto;"></div>
                         </div>
                     </div>
                 `).join('');
             }
        });


        try {
            const response = await axios.get(API_URL);
            allProducts = response.data; // Guarda todos os produtos

            // Renderiza cada seção com os produtos filtrados
            sectionsToBuild.forEach((section) => {
                const filteredProducts = allProducts.filter(p => p.categoria?.nome === section.categoryName);
                renderProductRow(filteredProducts, section.containerId);
                initSwiper(section.swiperClass, section.prev, section.next);
            });

            // Adiciona listeners aos botões DEPOIS que todos os produtos foram renderizados
            addCartButtonListeners();

        } catch (error) {
            console.error("Falha ao carregar produtos:", error);
            // Mostra mensagem de erro em todas as seções
            sectionsToBuild.forEach(section => {
                 const container = document.getElementById(section.containerId);
                 if (container) {
                     container.innerHTML = `<p style="padding: 20px; text-align: center; color: var(--error-color);">Erro ao carregar produtos.</p>`;
                 }
            });
        }
    };

    // Inicia o processo
    fetchAndDistributeProducts();
});