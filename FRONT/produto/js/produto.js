// myStore/FRONT/produto/js/produto.js - CÓDIGO CORRIGIDO COMPLETO

document.addEventListener('DOMContentLoaded', () => {
    const productId = new URLSearchParams(window.location.search).get('id');
    const API_URL = 'http://localhost:8080/api/produtos';
    const baseImageUrl = 'http://localhost:8080/'; 

    if (!productId) {
        document.getElementById('product-detail-container').innerHTML = '<p class="error-message">ID do produto não especificado.</p>';
        return;
    }

    const getImageUrl = (url) => {
        if (!url || url.startsWith('http')) {
            return url;
        }
        return baseImageUrl + url;
    };

    const formatPrice = (price) => `R$ ${parseFloat(price).toFixed(2).replace('.', ',')}`;

    const renderProductDetails = (product) => {
        const container = document.getElementById('product-detail-container');
        if (!container) return;

        const mainImage = getImageUrl(product.imagemUrl);
        const description = product.descricao || 'Nenhuma descrição disponível.';

        container.innerHTML = `
            <div class="product-images">
                <img src="${mainImage}" alt="${product.nome}" id="main-product-image">
                <div class="thumbnail-container" id="thumbnail-container">
                    ${product.imagensExtras && product.imagensExtras.length > 0 ? product.imagensExtras.map(img => `
                        <img src="${getImageUrl(img.url)}" alt="${product.nome} miniatura" class="thumbnail" data-full-image="${getImageUrl(img.url)}">
                    `).join('') : ''}
                </div>
            </div>
            <div class="product-info">
                <p class="product-category">${product.categoria.nome}</p>
                <h1 class="product-title">${product.nome}</h1>
                <p class="product-price">${formatPrice(product.preco)}</p>
                <p class="product-description">${description}</p>
                
                <div class="size-selection">
                    <h3 class="size-title">Selecione o Tamanho:</h3>
                    <div class="size-buttons" id="size-buttons-container">
                        ${['P', 'M', 'G', 'GG'].map(size => `
                            <button class="size-btn" data-size="${size}">${size}</button>
                        `).join('')}
                    </div>
                    <p id="size-error" class="error-message" style="display: none;">Por favor, selecione um tamanho.</p>
                </div>
                
                <button class="btn btn-primary add-to-cart-btn" id="addToCartBtn">Adicionar ao Carrinho</button>
                
                <div class="delivery-info">
                    <p><i class="fas fa-truck"></i> Envio internacional direto do fornecedor.</p>
                    <p><i class="fas fa-box"></i> Prazo de entrega: 15-35 dias úteis.</p>
                </div>
            </div>
        `;

        addEventListeners(product);
    };

    const fetchProduct = async () => {
        try {
            const response = await axios.get(`${API_URL}/${productId}`);
            renderProductDetails(response.data);
            fetchRelatedProducts(response.data.categoria.id);
        } catch (error) {
            console.error('Erro ao buscar produto:', error);
            document.getElementById('product-detail-container').innerHTML = '<p class="error-message">Produto não encontrado ou erro na conexão.</p>';
        }
    };

    const addEventListeners = (product) => {
        const sizeButtons = document.querySelectorAll('.size-btn');
        const buyButton = document.getElementById('addToCartBtn');
        const sizeError = document.getElementById('size-error');
        const thumbnails = document.querySelectorAll('.thumbnail');
        const mainImageEl = document.getElementById('main-product-image');

        sizeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                sizeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                if (sizeError) sizeError.style.display = 'none';
            });
        });

        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                if (mainImageEl) {
                    mainImageEl.src = thumb.dataset.fullImage;
                }
            });
        });

        if (buyButton) {
            buyButton.addEventListener('click', async () => {
                const selectedSizeEl = document.querySelector('.size-btn.active');
                
                if (!selectedSizeEl) {
                    if (sizeError) sizeError.style.display = 'block';
                    return;
                }
                
                const size = selectedSizeEl.textContent;
                
                // --- PONTO CRÍTICO: Garantir o formato numérico do preço ---
                const productToAdd = {
                    id: product.id.toString(),
                    name: product.nome,
                    price: parseFloat(product.preco), // <--- CORREÇÃO AQUI: Garante que é um número (float)
                    image: getImageUrl(product.imagemUrl),
                    size: size,
                    quantity: 1
                };
                
                // A função addToCart é definida em cart-utils.js, que DEVE ser carregado antes deste script.
                if (window.addToCart) {
                    window.addToCart(productToAdd);
                } else {
                    console.error("Função addToCart não encontrada. Verifique se cart-utils.js foi carregado corretamente.");
                    alert("Erro interno: Função de carrinho não carregada. Tente novamente.");
                }
            });
        }
    };

    // Função auxiliar para carregar produtos relacionados
    const fetchRelatedProducts = async (categoryId) => {
        try {
            const response = await axios.get(`${API_URL}/categoria/${categoryId}/relacionados?excludeId=${productId}&limit=10`);
            renderRelatedProducts(response.data);
        } catch (error) {
            console.warn('Não foi possível carregar produtos relacionados.', error);
        }
    };

    const renderRelatedProducts = (products) => {
        const container = document.getElementById('related-products-grid');
        if (!container) return;

        if (products.length === 0) {
            container.innerHTML = '<p style="padding: 20px;">Nenhum produto relacionado encontrado.</p>';
            return;
        }

        container.innerHTML = products.map(product => `
            <div class="swiper-slide product-card">
                <a href="produto.html?id=${product.id}">
                    <img src="${getImageUrl(product.imagemUrl)}" alt="${product.nome}">
                    <div class="product-card-info">
                        <p class="product-card-category">${product.categoria.nome}</p>
                        <h4 class="product-card-title">${product.nome}</h4>
                        <p class="product-card-price">${formatPrice(product.preco)}</p>
                    </div>
                </a>
            </div>
        `).join('');

        // Inicializa o Swiper para os produtos relacionados
        new Swiper('.related-products-swiper', {
            slidesPerView: 2,
            spaceBetween: 10,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            breakpoints: {
                768: {
                    slidesPerView: 3,
                    spaceBetween: 20,
                },
                1024: {
                    slidesPerView: 4,
                    spaceBetween: 30,
                },
            }
        });
    };

    fetchProduct();
});