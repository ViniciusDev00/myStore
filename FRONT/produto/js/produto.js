document.addEventListener('DOMContentLoaded', () => {
    const productDetailContainer = document.getElementById('product-detail-container');
    const API_URL = 'https://api.japauniverse.com.br/api/produtos';

    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (!productId) {
        productDetailContainer.innerHTML = '<p class="loading-message">Produto inválido ou não encontrado.</p>';
        return;
    }

    const formatPrice = (price) => `R$ ${price.toFixed(2).replace('.', ',')}`;

    const fetchProductData = async () => {
        try {
            const response = await axios.get(`${API_URL}/${productId}`);
            const product = response.data;
            renderProduct(product);
            fetchRelatedProducts(product.categoria.id, product.id);
        } catch (error) {
            console.error('Erro ao buscar detalhes do produto:', error);
            productDetailContainer.innerHTML = '<p class="loading-message">Erro ao carregar o produto. Tente novamente mais tarde.</p>';
        }
    };

    const renderProduct = (product) => {
        document.title = `${product.nome} | Japa Universe`;

        const originalPriceHTML = product.precoOriginal ? `<span class="price-original">${formatPrice(product.precoOriginal)}</span>` : '';
        const discount = product.precoOriginal ? Math.round(((product.precoOriginal - product.preco) / product.precoOriginal) * 100) : 0;
        const discountTagHTML = discount > 0 ? `<span class="discount-tag">-${discount}%</span>` : '';

        // --- CAMINHOS DAS IMAGENS CORRIGIDOS AQUI ---
        const imageUrl = `/${product.imagemUrl}`;

        const productHTML = `
            <div class="product-detail-grid">
                <div class="product-images">
                    <div class="thumbnail-gallery">
                        <div class="thumbnail-item active">
                            <img src="${imageUrl}" alt="Thumbnail de ${product.nome}">
                        </div>
                    </div>
                    <div class="main-image-container">
                        <img src="${imageUrl}" alt="${product.nome}" id="main-product-image">
                    </div>
                </div>

                <div class="product-info">
                    <div class="breadcrumbs">
                        <a href="/index.html">Página Inicial</a> / <a href="/FRONT/catalogo/HTML/catalogo.html">Catálogo</a> / <span>${product.nome}</span>
                    </div>
                    <h1>${product.nome}</h1>

                    <div class="price-box">
                        ${originalPriceHTML}
                        <div>
                            <span class="price-current">${formatPrice(product.preco)}</span>
                            ${discountTagHTML}
                        </div>
                        <span class="price-installments">ou em até 10x de ${formatPrice(product.preco / 10)} sem juros</span>
                    </div>

                    <div class="size-selector">
                        <h3>Tamanho do calçado:</h3>
                        <div class="size-options">
                            <button class="size-btn">38</button>
                            <button class="size-btn active">39</button>
                            <button class="size-btn">40</button>
                            <button class="size-btn">41</button>
                            <button class="size-btn">42</button>
                            <button class="size-btn">43</button>
                        </div>
                    </div>

                    <button class="btn btn-primary buy-button">Adicionar ao Carrinho</button>
                </div>
            </div>

            <div class="product-description">
                <h2>Descrição</h2>
                <p>${product.descricao}</p>
            </div>
        `;
        productDetailContainer.innerHTML = productHTML;
        addEventListeners();
    };

    const fetchRelatedProducts = async (categoryId, currentProductId) => {
        try {
            const response = await axios.get(`${API_URL}?categoriaId=${categoryId}`);
            const relatedProducts = response.data.filter(p => p.id != currentProductId);
            renderRelatedProducts(relatedProducts);
        } catch (error) {
            console.error('Erro ao buscar produtos relacionados:', error);
        }
    };

    const renderRelatedProducts = (products) => {
        const grid = document.getElementById('related-products-grid');
        if (!products || products.length === 0) {
            document.querySelector('.related-products-section').style.display = 'none';
            return;
        }

        grid.innerHTML = products.map(product => {
            const hasDiscount = product.precoOriginal && product.precoOriginal > product.preco;
            const discountPercentage = hasDiscount ? Math.round(((product.precoOriginal - product.preco) / product.precoOriginal) * 100) : 0;
            
            // --- CAMINHOS DE IMAGEM E LINK CORRIGIDOS AQUI ---
            const imageUrl = `/${product.imagemUrl}`;
            const productUrl = `/FRONT/produto/HTML/produto.html?id=${product.id}`;

            return `
            <div class="swiper-slide">
                <a href="${productUrl}" class="related-product-card">
                    <div class="related-product-image-wrapper">
                        <img src="${imageUrl}" alt="${product.nome}">
                        ${hasDiscount ? `<div class="related-discount-badge"><i class="fas fa-arrow-down"></i> ${discountPercentage}%</div>` : ''}
                    </div>
                    <div class="related-product-info">
                        <p class="related-product-name">${product.nome}</p>
                        <div class="related-price-line">
                            <span class="related-price-current">${formatPrice(product.preco)}</span>
                            ${hasDiscount ? `<span class="related-price-original">${formatPrice(product.precoOriginal)}</span>` : ''}
                        </div>
                        <div class="related-shipping-tag">FRETE GRÁTIS</div>
                    </div>
                </a>
            </div>
            `;
        }).join('');

        new Swiper('.related-products-swiper', {
            slidesPerView: 2,
            spaceBetween: 10,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            breakpoints: {
                640: { slidesPerView: 3, spaceBetween: 20 },
                1024: { slidesPerView: 4, spaceBetween: 30 },
            }
        });
    };
    
    const addEventListeners = () => {
        const sizeBtns = document.querySelectorAll('.size-btn');
        sizeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                sizeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        const buyButton = document.querySelector('.buy-button');
        if(buyButton) {
            buyButton.addEventListener('click', async () => {
                const selectedSizeEl = document.querySelector('.size-btn.active');
                if (!selectedSizeEl) {
                    alert('Por favor, selecione um tamanho.');
                    return;
                }
                const size = selectedSizeEl.textContent;
                
                const response = await axios.get(`${API_URL}/${productId}`);
                const product = response.data;
    
                // --- CAMINHO DA IMAGEM CORRIGIDO PARA O CARRINHO ---
                const productToAdd = {
                    id: product.id.toString(),
                    name: product.nome,
                    price: product.preco,
                    image: `/${product.imagemUrl}`,
                    size: size
                };
    
                if (window.addToCart) {
                    window.addToCart(productToAdd);
                } else {
                    console.error("Função addToCart não encontrada.");
                }
            });
        }

        const mainImageContainer = document.querySelector('.main-image-container');
        const mainImage = document.getElementById('main-product-image');
        if (mainImageContainer && mainImage) {
            mainImageContainer.addEventListener('mousemove', (e) => {
                const { left, top, width, height } = mainImageContainer.getBoundingClientRect();
                const x = (e.clientX - left) / width * 100;
                const y = (e.clientY - top) / height * 100;
                mainImage.style.transformOrigin = `${x}% ${y}%`;
            });
        }
    };

    fetchProductData();
});