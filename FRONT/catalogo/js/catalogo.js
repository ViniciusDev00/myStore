document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:8080/api/produtos';
    const grid = document.getElementById('products-grid');
    
    if (grid) {
        // ===== ESTADO GLOBAL =====
        let state = {
            allProducts: [],
            filteredProducts: [],
            displayedCount: 12,
            currentView: 'grid',
            filters: {
                search: '',
                brand: 'all',
                category: 'all',
                price: 'all',
                sort: 'featured'
            },
            isLoading: false,
            hasMore: true
        };

        // ===== ELEMENTOS DO DOM =====
        const elements = {
            grid,
            loadMoreBtn: document.getElementById('loadMoreBtn'),
            searchInput: document.getElementById('searchInput'),
            searchClear: document.getElementById('searchClear'),
            brandFilter: document.getElementById('brandFilter'),
            categoryFilter: document.getElementById('categoryFilter'),
            priceFilter: document.getElementById('priceFilter'),
            sortFilter: document.getElementById('sortFilter'),
            activeFilters: document.getElementById('activeFilters'),
            loadingState: document.getElementById('loadingState'),
            emptyState: document.getElementById('emptyState'),
            clearFiltersBtn: document.getElementById('clearFiltersBtn'),
            viewButtons: document.querySelectorAll('.view-btn')
        };

        // ===== QUICK VIEW MODAL (AGORA É O MODAL PRINCIPAL) =====
        const quickViewElements = {
            overlay: document.getElementById('quickViewModal'),
            content: document.getElementById('quickViewContent'),
            closeBtn: document.getElementById('closeQuickViewBtn')
        };

        let quickViewProduct = null;
        let selectedSize = null;

        // ===== SISTEMA DE NOTIFICAÇÕES =====
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

        // ===== FUNÇÕES DE UTILIDADE =====
        const utils = {
            debounce: (func, wait) => {
                let timeout;
                return function executedFunction(...args) {
                    const later = () => {
                        clearTimeout(timeout);
                        func(...args);
                    };
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                };
            },

            formatPrice: (price) => `R$ ${price.toFixed(2).replace('.', ',')}`,

            getImageUrl: (path) => {
                if (!path) return '/assets/images/placeholder-product.jpg';
                if (path.startsWith('http')) return path;
                return `http://localhost:8080/${path}`;
            },

            generateSkeletons: (count) => {
                return Array.from({ length: count }, (_, index) => `'
                    <div class="product-card skeleton-card" style="--delay: ${index}">
                        <div class="product-image-wrapper skeleton skeleton-image"></div>
                        <div class="product-info">
                            <div class="skeleton skeleton-text short"></div>
                            <div class="skeleton skeleton-text medium"></div>
                            <div class="skeleton skeleton-text" style="height: 2rem; margin-top: 0.5rem;"></div>
                        </div>
                    </div>
                `).join('');
            },

            parsePriceRange: (range) => {
                if (range === 'all') return { min: 0, max: Infinity };
                const [min, max] = range.split('-').map(Number);
                return { min, max };
            }
        };

        // ===== SISTEMA DE FILTROS AVANÇADOS =====
        const filterSystem = {
            applyFilters: () => {
                let filtered = [...state.allProducts];
                
                // Filtro de busca
                if (state.filters.search) {
                    const searchTerm = state.filters.search.toLowerCase();
                    filtered = filtered.filter(product => 
                        product.nome.toLowerCase().includes(searchTerm) ||
                        product.marca.nome.toLowerCase().includes(searchTerm) ||
                        product.categoria?.toLowerCase().includes(searchTerm) ||
                        product.descricao?.toLowerCase().includes(searchTerm)
                    );
                }
                
                // Filtro de marca
                if (state.filters.brand !== 'all') {
                    filtered = filtered.filter(product => 
                        product.marca.nome === state.filters.brand
                    );
                }
                
                // Filtro de categoria
                if (state.filters.category !== 'all') {
                    filtered = filtered.filter(product => 
                        product.categoria === state.filters.category
                    );
                }
                
                // Filtro de preço
                if (state.filters.price !== 'all') {
                    const priceRange = utils.parsePriceRange(state.filters.price);
                    filtered = filtered.filter(product => 
                        product.preco >= priceRange.min && product.preco <= priceRange.max
                    );
                }
                
                // Ordenação
                filtered = filterSystem.sortProducts(filtered);
                
                state.filteredProducts = filtered;
                state.displayedCount = 12;
                state.hasMore = filtered.length > 12;
                
                filterSystem.updateActiveFilters();
                filterSystem.updateFormElements();
            },
            
            sortProducts: (products) => {
                switch (state.filters.sort) {
                    case 'price-asc':
                        return products.sort((a, b) => a.preco - b.preco);
                    case 'price-desc':
                        return products.sort((a, b) => b.preco - b.preco);
                    case 'name-asc':
                        return products.sort((a, b) => a.nome.localeCompare(b.nome));
                    case 'newest':
                        return products.sort((a, b) => new Date(b.dataLancamento || b.createdAt) - new Date(a.dataLancamento || a.createdAt));
                    default:
                        return products; // featured - mantém ordem original
                }
            },
            
            updateActiveFilters: () => {
                elements.activeFilters.innerHTML = '';
                
                const filters = [
                    { key: 'search', value: state.filters.search, label: `Busca: "${state.filters.search}"` },
                    { key: 'brand', value: state.filters.brand, label: `Marca: ${state.filters.brand}`, show: state.filters.brand !== 'all' },
                    { key: 'category', value: state.filters.category, label: `Categoria: ${state.filters.category}`, show: state.filters.category !== 'all' },
                    { key: 'price', value: state.filters.price, label: filterSystem.getPriceFilterLabel(state.filters.price), show: state.filters.price !== 'all' },
                    { key: 'sort', value: state.filters.sort, label: filterSystem.getSortFilterLabel(state.filters.sort), show: state.filters.sort !== 'featured' }
                ];
                
                filters.forEach(({ key, value, label, show = true }) => {
                    if (value && show) {
                        filterSystem.addFilterTag(key, label);
                    }
                });
            },
            
            getPriceFilterLabel: (priceRange) => {
                const labels = {
                    'all': 'Qualquer Preço',
                    '0-200': 'Até R$ 200',
                    '200-500': 'R$ 200 - R$ 500',
                    '500-1000': 'R$ 500 - R$ 1000',
                    '1000-99999': 'Acima de R$ 1000'
                };
                return `Preço: ${labels[priceRange]}`;
            },
            
            getSortFilterLabel: (sort) => {
                const labels = {
                    'featured': 'Em Destaque',
                    'newest': 'Mais Recentes',
                    'price-asc': 'Menor Preço',
                    'price-desc': 'Maior Preço',
                    'name-asc': 'Nome A-Z'
                };
                return `Ordenar: ${labels[sort]}`;
            },
            
            addFilterTag: (type, label) => {
                const tag = document.createElement('div');
                tag.className = 'filter-tag';
                tag.innerHTML = `
                    <span>${label}</span>
                    <button type="button" onclick="catalogApp.removeFilter('${type}')">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                elements.activeFilters.appendChild(tag);
            },
            
            removeFilter: (type) => {
                const defaultValues = {
                    search: '',
                    brand: 'all',
                    category: 'all',
                    price: 'all',
                    sort: 'featured'
                };
                
                state.filters[type] = defaultValues[type];
                filterSystem.applyFilters();
                renderSystem.renderProducts();
            },
            
            updateFormElements: () => {
                elements.searchInput.value = state.filters.search;
                elements.brandFilter.value = state.filters.brand;
                elements.categoryFilter.value = state.filters.category;
                elements.priceFilter.value = state.filters.price;
                elements.sortFilter.value = state.filters.sort;
                elements.searchClear.style.display = state.filters.search ? 'block' : 'none';
            },
            
            clearAllFilters: () => {
                state.filters = {
                    search: '',
                    brand: 'all',
                    category: 'all',
                    price: 'all',
                    sort: 'featured'
                };
                filterSystem.applyFilters();
                renderSystem.renderProducts();
            }
        };

        // ===== SISTEMA DE RENDERIZAÇÃO =====
        const renderSystem = {
            renderProducts: () => {
                const productsToShow = state.filteredProducts.slice(0, state.displayedCount);
                
                if (state.isLoading && state.filteredProducts.length === 0) {
                    elements.grid.innerHTML = utils.generateSkeletons(12);
                    elements.loadingState.style.display = 'block';
                    elements.emptyState.style.display = 'none';
                    return;
                }
                
                elements.loadingState.style.display = 'none';
                
                if (productsToShow.length === 0) {
                    elements.emptyState.style.display = 'block';
                    elements.grid.innerHTML = '';
                    return;
                }
                
                elements.emptyState.style.display = 'none';
                elements.grid.innerHTML = productsToShow.map((product, index) => 
                    renderSystem.createProductCard(product, index)
                ).join('');
                
                if (elements.loadMoreBtn) {
                    elements.loadMoreBtn.style.display = state.hasMore ? 'inline-flex' : 'none';
                    elements.loadMoreBtn.querySelector('.btn-text').textContent = 
                        state.hasMore ? 'Carregar Mais' : 'Todos os produtos carregados';
                }
                
                renderSystem.addProductEventListeners();
            },
            
            createProductCard: (product, index) => {
                const hasDiscount = product.precoOriginal && product.precoOriginal > product.preco;
                const discountPercent = hasDiscount ? 
                    Math.round((1 - product.preco / product.precoOriginal) * 100) : 0;
                
                return `
                    <div class="product-card" data-id="${product.id}" style="--delay: ${index}">
                        <div class="product-badges">
                            ${product.isNew ? '<span class="badge new">Novo</span>' : ''}
                            ${hasDiscount ? `<span class="badge sale">-${discountPercent}%</span>` : ''}
                            ${product.isLimited ? '<span class="badge limited">Limited</span>' : ''}
                        </div>
                        
                        <a href="/FRONT/produto/HTML/produto.html?id=${product.id}" class="product-card-link">
                            <div class="product-image-wrapper">
                                <img src="${utils.getImageUrl(product.imagemUrl)}" 
                                     alt="${product.nome}"
                                     loading="${index < 8 ? 'eager' : 'lazy'}">
                            </div>
                        </a>
                        
                        <div class="product-info">
                            <span class="product-brand">${product.marca.nome}</span>
                            <h3 class="product-name">${product.nome}</h3>
                            
                            <div class="product-price">
                                <span class="current-price">${utils.formatPrice(product.preco)}</span>
                                ${hasDiscount ? `
                                    <span class="original-price">${utils.formatPrice(product.precoOriginal)}</span>
                                    <span class="discount">-${discountPercent}%</span>
                                ` : ''}
                            </div>
                            
                            <div class="shipping-tag">Frete Grátis</div>
                        </div>
                        
                        <div class="product-footer">
                            <button class="btn btn-primary add-to-cart-btn" 
                                    data-product-id="${product.id}" 
                                    data-product-name="${product.nome}"
                                    ${product.estoque <= 0 ? 'disabled' : ''}>
                                <span class="btn-text">
                                    ${product.estoque <= 0 ? 'Esgotado' : 'Adicionar ao Carrinho'}
                                </span>
                                <span class="btn-loading">
                                    <i class="fas fa-spinner fa-spin"></i>
                                </span>
                            </button>
                        </div>
                    </div>
                `;
            },
            
            addProductEventListeners: () => {
                // Botões "Adicionar ao Carrinho" - ABRE O QUICK VIEW
                document.querySelectorAll('.add-to-cart-btn:not([disabled])').forEach(button => {
                    if (button.dataset.listenerAdded) return;
                    
                    button.addEventListener('click', async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        const productId = button.dataset.productId;
                        const product = state.allProducts.find(p => p.id === parseInt(productId));
                        
                        if (!product || product.estoque <= 0) {
                            showNotification('Produto esgotado', 'error');
                            return;
                        }
                        
                        // ABRIR QUICK VIEW COMPLETO
                        quickViewSystem.openQuickView(productId);
                        
                        button.dataset.listenerAdded = 'true';
                    });
                });

                // CORREÇÃO: Link do produto funcionando no modo lista
                document.querySelectorAll('.product-card-link').forEach(link => {
                    link.addEventListener('click', (e) => {
                        // Permitir que o link funcione normally
                        // Não precisa fazer nada especial aqui
                    });
                });

                // CORREÇÃO: No modo lista, toda a área do card (exceto botões) deve ser clicável
                if (state.currentView === 'list') {
                    document.querySelectorAll('.product-card').forEach(card => {
                        const link = card.querySelector('.product-card-link');
                        if (link) {
                            // Tornar elementos clicáveis no modo lista
                            card.querySelectorAll('.product-image-wrapper, .product-info').forEach(element => {
                                element.style.cursor = 'pointer';
                                element.addEventListener('click', (e) => {
                                    if (!e.target.closest('.add-to-cart-btn')) {
                                        window.location.href = link.href;
                                    }
                                });
                            });
                        }
                    });
                }
            },
            
            loadMoreProducts: () => {
                if (state.isLoading || !state.hasMore) return;
                
                state.isLoading = true;
                elements.loadMoreBtn.classList.add('loading');
                elements.loadMoreBtn.querySelector('.btn-text').style.display = 'none';
                elements.loadMoreBtn.querySelector('.btn-loading').style.display = 'inline-block';
                
                setTimeout(() => {
                    state.displayedCount += 12;
                    state.hasMore = state.displayedCount < state.filteredProducts.length;
                    state.isLoading = false;
                    
                    renderSystem.renderProducts();
                    
                    elements.loadMoreBtn.classList.remove('loading');
                    elements.loadMoreBtn.querySelector('.btn-text').style.display = 'inline-block';
                    elements.loadMoreBtn.querySelector('.btn-loading').style.display = 'none';
                }, 800);
            }
        };

        // ===== SISTEMA QUICK VIEW (AGORA É O MODAL PRINCIPAL) =====
        const quickViewSystem = {
            openQuickView: async (productId) => {
                const product = state.allProducts.find(p => p.id === parseInt(productId));
                if (!product) {
                    quickViewSystem.showError('Produto não encontrado.');
                    return;
                }

                quickViewProduct = product;
                selectedSize = null;
                
                quickViewSystem.showSkeleton();
                quickViewElements.overlay.classList.add('active');
                document.body.style.overflow = 'hidden';

                try {
                    await quickViewSystem.loadProductDetails(product);
                } catch (error) {
                    console.error('Erro ao carregar detalhes do produto:', error);
                    quickViewSystem.showError('Erro ao carregar detalhes do produto.');
                }
            },

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

            loadProductDetails: async (product) => {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        const productDetails = {
                            ...product,
                            description: product.descricao || "Tênis premium com tecnologia de amortecimento avançada. Ideal para uso casual e esportivo. Material de alta qualidade que oferece conforto e durabilidade.",
                            images: [
                                product.imagemUrl,
                                product.imagemUrl,
                                product.imagemUrl
                            ],
                            features: [
                                { icon: 'fas fa-shoe-prints', text: 'Amortecimento React' },
                                { icon: 'fas fa-wind', text: 'Respirável' },
                                { icon: 'fas fa-weight-hanging', text: 'Leve' },
                                { icon: 'fas fa-award', text: 'Garantia 6 meses' }
                            ],
                            sizes: quickViewSystem.generateAvailableSizes(product)
                        };
                        
                        quickViewSystem.renderProductDetails(productDetails);
                        resolve(productDetails);
                    }, 800);
                });
            },

            renderProductDetails: (product) => {
                const hasDiscount = product.precoOriginal && product.precoOriginal > product.preco;
                const discountPercent = hasDiscount ? 
                    Math.round((1 - product.preco / product.precoOriginal) * 100) : 0;

                quickViewElements.content.innerHTML = `
                    <div class="quickview-gallery">
                        <img src="${utils.getImageUrl(product.images[0])}" 
                             alt="${product.nome}" 
                             class="quickview-main-image"
                             id="quickviewMainImage">
                        
                        <div class="quickview-thumbnails">
                            ${product.images.map((image, index) => `
                                <img src="${utils.getImageUrl(image)}" 
                                     alt="${product.nome} - Imagem ${index + 1}"
                                     class="quickview-thumbnail ${index === 0 ? 'active' : ''}"
                                     data-image-index="${index}">
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="quickview-details">
                        <div class="quickview-brand">${product.marca.nome}</div>
                        <h1 class="quickview-title">${product.nome}</h1>
                        
                        <div class="quickview-price">
                            <span class="quickview-current-price">${utils.formatPrice(product.preco)}</span>
                            ${hasDiscount ? `
                                <span class="quickview-original-price">${utils.formatPrice(product.precoOriginal)}</span>
                                <span class="quickview-discount">-${discountPercent}%</span>
                            ` : ''}
                        </div>
                        
                        <div class="quickview-shipping">
                            <i class="fas fa-shipping-fast"></i>
                            <span>Frete Grátis para todo Brasil</span>
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
                `;

                quickViewSystem.addGalleryEventListeners();
                // *** CORREÇÃO: Adicionada a chamada para os novos listeners ***
                quickViewSystem.addModalEventListeners();
            },

            addGalleryEventListeners: () => {
                const thumbnails = document.querySelectorAll('.quickview-thumbnail');
                const mainImage = document.getElementById('quickviewMainImage');
                
                thumbnails.forEach(thumb => {
                    thumb.addEventListener('click', () => {
                        thumbnails.forEach(t => t.classList.remove('active'));
                        thumb.classList.add('active');
                        mainImage.src = thumb.src;
                    });
                });
            },

            // *** CORREÇÃO: Nova função para adicionar listeners ao modal ***
            addModalEventListeners: () => {
                // Adiciona listener aos tamanhos
                const sizeOptions = document.querySelectorAll('.quickview-size-option:not(.disabled)');
                sizeOptions.forEach(option => {
                    option.addEventListener('click', () => {
                        quickViewSystem.selectSize(option); // Chama a função passando o elemento
                    });
                });

                // Adiciona listener ao botão "Adicionar ao Carrinho"
                const addToCartBtn = document.getElementById('quickviewAddToCart');
                if (addToCartBtn) {
                    addToCartBtn.addEventListener('click', () => {
                        quickViewSystem.addToCartFromQuickView();
                    });
                }
            },
            // *** FIM DA NOVA FUNÇÃO ***

            selectSize: (element) => {
                document.querySelectorAll('.quickview-size-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                element.classList.add('selected');
                selectedSize = element.dataset.size;
                
                document.getElementById('quickviewAddToCart').disabled = false;
            },

            addToCartFromQuickView: () => {
                if (!selectedSize) {
                    showNotification('Por favor, selecione um tamanho.', 'error');
                    return;
                }

                if (!quickViewProduct) {
                    showNotification('Erro: Produto não encontrado.', 'error');
                    return;
                }

                if (typeof window.addToCart === 'function') {
                    const productToAdd = {
                        id: quickViewProduct.id.toString(),
                        name: quickViewProduct.nome,
                        price: quickViewProduct.preco,
                        image: utils.getImageUrl(quickViewProduct.imagemUrl),
                        size: selectedSize,
                        quantity: 1
                    };
                    
                    window.addToCart(productToAdd);
                    quickViewSystem.closeQuickView();
                    showNotification(`${quickViewProduct.nome} (Tamanho: ${selectedSize}) adicionado ao carrinho!`);
                } else {
                    console.error("Função window.addToCart não encontrada");
                    quickViewSystem.closeQuickView();
                    showNotification('Produto adicionado ao carrinho (simulado)', 'info');
                }
            },

            // REMOVIDO: Função toggleWishlist

            generateAvailableSizes: (product) => {
                const sizes = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
                const availableSizes = {};
                
                const totalStock = product.estoque || 0;
                sizes.forEach(size => {
                    availableSizes[size] = totalStock > 0 ? Math.floor(Math.random() * 5) + 1 : 0;
                });
                
                return availableSizes;
            },

            closeQuickView: () => {
                quickViewElements.overlay.classList.remove('active');
                quickViewProduct = null;
                selectedSize = null;
                document.body.style.overflow = '';
            },

            showError: (message) => {
                quickViewElements.content.innerHTML = `
                    <div class="quickview-error">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>Erro</h3>
                        <p>${message}</p>
                        <button class="btn btn-outline" onclick="catalogApp.quickViewSystem.closeQuickView()">
                            Fechar
                        </button>
                    </div>
                `;
            }
        };

        // ===== SISTEMA DE VIEW =====
        const viewSystem = {
            switchView: (viewType) => {
                state.currentView = viewType;
                elements.grid.setAttribute('data-view', viewType);
                
                elements.viewButtons.forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.view === viewType);
                });
                
                localStorage.setItem('catalogViewPreference', viewType);
                
                // Re-renderizar para aplicar correções do modo lista
                setTimeout(() => {
                    renderSystem.addProductEventListeners();
                }, 100);
            },
            
            loadViewPreference: () => {
                const savedView = localStorage.getItem('catalogViewPreference') || 'grid';
                viewSystem.switchView(savedView);
            }
        };

        // ===== INICIALIZAÇÃO =====
        const init = {
            setupEventListeners: () => {
                // Busca
                elements.searchInput.addEventListener('input', utils.debounce((e) => {
                    state.filters.search = e.target.value.trim();
                    elements.searchClear.style.display = state.filters.search ? 'block' : 'none';
                    filterSystem.applyFilters();
                    renderSystem.renderProducts();
                }, 300));
                
                elements.searchClear.addEventListener('click', () => {
                    state.filters.search = '';
                    elements.searchInput.value = '';
                    elements.searchClear.style.display = 'none';
                    filterSystem.applyFilters();
                    renderSystem.renderProducts();
                });
                
                // Filtros
                elements.brandFilter.addEventListener('change', (e) => {
                    state.filters.brand = e.target.value;
                    filterSystem.applyFilters();
                    renderSystem.renderProducts();
                });
                
                elements.categoryFilter.addEventListener('change', (e) => {
                    state.filters.category = e.target.value;
                    filterSystem.applyFilters();
                    renderSystem.renderProducts();
                });
                
                elements.priceFilter.addEventListener('change', (e) => {
                    state.filters.price = e.target.value;
                    filterSystem.applyFilters();
                    renderSystem.renderProducts();
                });
                
                elements.sortFilter.addEventListener('change', (e) => {
                    state.filters.sort = e.target.value;
                    filterSystem.applyFilters();
                    renderSystem.renderProducts();
                });
                
                // View controls
                elements.viewButtons.forEach(btn => {
                    btn.addEventListener('click', () => {
                        viewSystem.switchView(btn.dataset.view);
                    });
                });
                
                // Load More
                if (elements.loadMoreBtn) {
                    elements.loadMoreBtn.addEventListener('click', renderSystem.loadMoreProducts);
                }
                
                // Clear Filters
                if (elements.clearFiltersBtn) {
                    elements.clearFiltersBtn.addEventListener('click', filterSystem.clearAllFilters);
                }
                
                // Quick View events
                quickViewElements.closeBtn.addEventListener('click', quickViewSystem.closeQuickView);
                quickViewElements.overlay.addEventListener('click', (e) => {
                    if (e.target === quickViewElements.overlay) {
                        quickViewSystem.closeQuickView();
                    }
                });
                
                // Keyboard events
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && quickViewElements.overlay.classList.contains('active')) {
                        quickViewSystem.closeQuickView();
                    }
                });
            },
            
            fetchProducts: async () => {
                state.isLoading = true;
                elements.grid.innerHTML = utils.generateSkeletons(12);
                elements.loadingState.style.display = 'block';
                
                try {
                    const response = await axios.get(API_URL);
                    state.allProducts = response.data.map(product => ({
                        ...product,
                        isNew: Math.random() > 0.7,
                        isLimited: Math.random() > 0.8,
                        categoria: ['lifestyle', 'running', 'basketball', 'skateboarding'][
                            Math.floor(Math.random() * 4)
                        ],
                        precoOriginal: product.preco * (1 + Math.random() * 0.3)
                    }));
                    
                    filterSystem.applyFilters();
                    renderSystem.renderProducts();
                    
                } catch (error) {
                    console.error('Erro ao carregar produtos:', error);
                    elements.grid.innerHTML = `
                        <div class="error-state" style="grid-column: 1 / -1; text-align: center; padding: var(--space-xl);">
                            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--error-color); margin-bottom: var(--space-md);"></i>
                            <h3 style="color: var(--text-primary); margin-bottom: var(--space-sm);">Erro ao carregar produtos</h3>
                            <p style="color: var(--text-secondary); margin-bottom: var(--space-md);">
                                Não foi possível carregar o catálogo. Tente novamente.
                            </p>
                            <button class="btn btn-primary" onclick="location.reload()">
                                <i class="fas fa-redo"></i>
                                Tentar Novamente
                            </button>
                        </div>
                    `;
                } finally {
                    state.isLoading = false;
                    elements.loadingState.style.display = 'none';
                }
            },
            
            start: () => {
                init.setupEventListeners();
                viewSystem.loadViewPreference();
                init.fetchProducts();
                
                window.catalogApp = {
                    state,
                    filterSystem,
                    renderSystem,
                    quickViewSystem,
                    showNotification,
                    removeFilter: filterSystem.removeFilter
                };
            }
        };

        init.start();
    }
});