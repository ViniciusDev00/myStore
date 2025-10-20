document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://api.japauniverse.com.br/api/produtos';
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
            sortFilter: document.getElementById('sortFilter'),
            activeFilters: document.getElementById('activeFilters'),
            loadingState: document.getElementById('loadingState'),
            emptyState: document.getElementById('emptyState'),
            clearFiltersBtn: document.getElementById('clearFiltersBtn'),
            viewButtons: document.querySelectorAll('.view-btn')
        };

        // ===== MODAL DE TAMANHOS =====
        const modalElements = {
            overlay: document.getElementById('sizeSelectionModal'),
            closeBtn: document.getElementById('closeSizeModalBtn'),
            sizeOptions: document.getElementById('sizeOptions'),
            addToCartBtn: document.getElementById('addToCartModalBtn'),
            productName: document.getElementById('modalProductName'),
            error: document.getElementById('modalError')
        };

        let selectedProductId = null;
        let selectedSize = null;

        // ===== SISTEMA DE NOTIFICAÇÕES =====
        const showNotification = (message, type = 'success') => {
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}"></i>
                    <span>${message}</span>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            // Animação de entrada
            setTimeout(() => notification.classList.add('show'), 100);
            
            // Remover após 3 segundos
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
                return `https://api.japauniverse.com.br/${path}`;
            },

            generateSkeletons: (count) => {
                return Array.from({ length: count }, (_, index) => `
                    <div class="product-card skeleton-card" style="--delay: ${index}">
                        <div class="product-image-wrapper skeleton skeleton-image"></div>
                        <div class="product-info">
                            <div class="skeleton skeleton-text short"></div>
                            <div class="skeleton skeleton-text medium"></div>
                            <div class="skeleton skeleton-text" style="height: 2rem; margin-top: 0.5rem;"></div>
                        </div>
                    </div>
                `).join('');
            }
        };

        // ===== SISTEMA DE FILTROS =====
        const filterSystem = {
            applyFilters: () => {
                let filtered = [...state.allProducts];
                
                // Filtro de busca
                if (state.filters.search) {
                    const searchTerm = state.filters.search.toLowerCase();
                    filtered = filtered.filter(product => 
                        product.nome.toLowerCase().includes(searchTerm) ||
                        product.marca.nome.toLowerCase().includes(searchTerm) ||
                        product.categoria?.toLowerCase().includes(searchTerm)
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
                
                // Ordenação
                filtered = filterSystem.sortProducts(filtered);
                
                state.filteredProducts = filtered;
                state.displayedCount = 12;
                state.hasMore = filtered.length > 12;
            },
            
            sortProducts: (products) => {
                switch (state.filters.sort) {
                    case 'price-asc':
                        return products.sort((a, b) => a.preco - b.preco);
                    case 'price-desc':
                        return products.sort((a, b) => b.preco - a.preco);
                    case 'name-asc':
                        return products.sort((a, b) => a.nome.localeCompare(b.nome));
                    case 'newest':
                        return products.sort((a, b) => new Date(b.dataLancamento) - new Date(a.dataLancamento));
                    default:
                        return products; // featured
                }
            },
            
            updateActiveFilters: () => {
                elements.activeFilters.innerHTML = '';
                
                if (state.filters.search) {
                    filterSystem.addFilterTag('search', `Busca: "${state.filters.search}"`);
                }
                if (state.filters.brand !== 'all') {
                    filterSystem.addFilterTag('brand', `Marca: ${state.filters.brand}`);
                }
                if (state.filters.category !== 'all') {
                    filterSystem.addFilterTag('category', `Categoria: ${state.filters.category}`);
                }
                if (state.filters.sort !== 'featured') {
                    const sortLabels = {
                        'newest': 'Mais Recentes',
                        'price-asc': 'Menor Preço',
                        'price-desc': 'Maior Preço',
                        'name-asc': 'Nome A-Z'
                    };
                    filterSystem.addFilterTag('sort', `Ordenar: ${sortLabels[state.filters.sort]}`);
                }
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
                state.filters[type] = type === 'search' ? '' : 'all';
                filterSystem.applyFilters();
                renderSystem.renderProducts();
                filterSystem.updateActiveFilters();
                filterSystem.updateFormElements();
            },
            
            updateFormElements: () => {
                elements.searchInput.value = state.filters.search;
                elements.brandFilter.value = state.filters.brand;
                elements.categoryFilter.value = state.filters.category;
                elements.sortFilter.value = state.filters.sort;
                elements.searchClear.style.display = state.filters.search ? 'block' : 'none';
            },
            
            clearAllFilters: () => {
                state.filters = {
                    search: '',
                    brand: 'all',
                    category: 'all',
                    sort: 'featured'
                };
                filterSystem.applyFilters();
                renderSystem.renderProducts();
                filterSystem.updateActiveFilters();
                filterSystem.updateFormElements();
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
                
                // Atualizar botão "Carregar Mais"
                if (elements.loadMoreBtn) {
                    elements.loadMoreBtn.style.display = state.hasMore ? 'inline-flex' : 'none';
                    elements.loadMoreBtn.querySelector('.btn-text').textContent = 
                        state.hasMore ? 'Carregar Mais' : 'Todos os produtos carregados';
                }
                
                // Adicionar event listeners
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
                        
                        <div class="product-actions">
                            <button class="action-btn quick-view-btn" 
                                    data-product-id="${product.id}"
                                    aria-label="Visualização rápida">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn wishlist-btn" 
                                    data-product-id="${product.id}"
                                    aria-label="Adicionar à lista de desejos">
                                <i class="far fa-heart"></i>
                            </button>
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
                // Botões "Adicionar ao Carrinho"
                document.querySelectorAll('.add-to-cart-btn:not([disabled])').forEach(button => {
                    if (button.dataset.listenerAdded) return;
                    
                    button.addEventListener('click', async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        const productId = button.dataset.productId;
                        const productName = button.dataset.productName;
                        const product = state.allProducts.find(p => p.id === parseInt(productId));
                        
                        if (!product || product.estoque <= 0) {
                            showNotification('Produto esgotado', 'error');
                            return;
                        }
                        
                        // Simular estoque por tamanho (MELHORIA FUTURA: API)
                        const availableSizes = modalSystem.generateAvailableSizes(product);
                        modalSystem.openSizeSelectionModal(productId, productName, availableSizes);
                        
                        button.dataset.listenerAdded = 'true';
                    });
                });
                
                // Botões de visualização rápida
                document.querySelectorAll('.quick-view-btn').forEach(button => {
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const productId = button.dataset.productId;
                        // TODO: Implementar quick view
                        showNotification('Visualização rápida em desenvolvimento', 'info');
                    });
                });
                
                // Botões de wishlist
                document.querySelectorAll('.wishlist-btn').forEach(button => {
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // TODO: Implementar wishlist
                        showNotification('Produto adicionado à lista de desejos');
                    });
                });
            },
            
            loadMoreProducts: () => {
                if (state.isLoading || !state.hasMore) return;
                
                state.isLoading = true;
                elements.loadMoreBtn.classList.add('loading');
                elements.loadMoreBtn.querySelector('.btn-text').style.display = 'none';
                elements.loadMoreBtn.querySelector('.btn-loading').style.display = 'inline-block';
                
                // Simular carregamento
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

        // ===== SISTEMA DO MODAL =====
        const modalSystem = {
            openSizeSelectionModal: (productId, productName, availableSizes) => {
                selectedProductId = productId;
                selectedSize = null;
                modalElements.error.style.display = 'none';
                
                modalElements.productName.textContent = `Selecione o Tamanho: ${productName}`;
                modalElements.sizeOptions.innerHTML = '';
                
                const sortedSizes = Object.keys(availableSizes).sort((a, b) => parseInt(a) - parseInt(b));
                
                if (sortedSizes.length === 0) {
                    modalElements.sizeOptions.innerHTML = `
                        <p style="color: var(--text-secondary); text-align: center; grid-column: 1 / -1;">
                            Nenhum tamanho disponível em estoque
                        </p>
                    `;
                    modalElements.addToCartBtn.disabled = true;
                } else {
                    modalElements.addToCartBtn.disabled = false;
                    sortedSizes.forEach(size => {
                        const quantity = availableSizes[size];
                        const sizeBtn = document.createElement('div');
                        sizeBtn.className = `size-option ${quantity <= 0 ? 'disabled' : ''}`;
                        sizeBtn.textContent = size;
                        sizeBtn.dataset.size = size;
                        
                        if (quantity <= 0) {
                            sizeBtn.title = 'Esgotado';
                        } else {
                            sizeBtn.addEventListener('click', () => {
                                modalElements.sizeOptions.querySelectorAll('.size-option').forEach(btn => {
                                    btn.classList.remove('selected');
                                });
                                sizeBtn.classList.add('selected');
                                selectedSize = size;
                                modalElements.error.style.display = 'none';
                            });
                        }
                        modalElements.sizeOptions.appendChild(sizeBtn);
                    });
                }
                
                modalElements.overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            },
            
            closeSizeSelectionModal: () => {
                modalElements.overlay.classList.remove('active');
                selectedProductId = null;
                selectedSize = null;
                document.body.style.overflow = '';
            },
            
            generateAvailableSizes: (product) => {
                // MELHORIA FUTURA: Substituir por dados reais da API
                const sizes = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
                const availableSizes = {};
                
                // Simular disponibilidade baseada no estoque geral
                const totalStock = product.estoque || 0;
                sizes.forEach(size => {
                    // Distribuir estoque aleatoriamente entre tamanhos
                    availableSizes[size] = totalStock > 0 ? Math.floor(Math.random() * 5) + 1 : 0;
                });
                
                return availableSizes;
            },
            
            handleAddToCart: () => {
                if (!selectedSize) {
                    modalElements.error.textContent = "Por favor, selecione um tamanho antes de adicionar ao carrinho.";
                    modalElements.error.style.display = 'block';
                    return;
                }
                
                if (typeof window.addToCart === 'function') {
                    const productDetails = state.allProducts.find(p => p.id === parseInt(selectedProductId));
                    if (productDetails) {
                        const productToAdd = {
                            id: productDetails.id.toString(),
                            name: productDetails.nome,
                            price: productDetails.preco,
                            image: utils.getImageUrl(productDetails.imagemUrl),
                            size: selectedSize,
                            quantity: 1
                        };
                        window.addToCart(productToAdd);
                        modalSystem.closeSizeSelectionModal();
                        showNotification(`${productDetails.nome} (Tamanho: ${selectedSize}) adicionado ao carrinho!`);
                    }
                } else {
                    console.error("Função window.addToCart não encontrada");
                    modalSystem.closeSizeSelectionModal();
                    showNotification('Produto adicionado ao carrinho (simulado)', 'info');
                }
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
                
                // Salvar preferência
                localStorage.setItem('catalogViewPreference', viewType);
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
                    filterSystem.updateActiveFilters();
                }, 300));
                
                // Limpar busca
                elements.searchClear.addEventListener('click', () => {
                    state.filters.search = '';
                    elements.searchInput.value = '';
                    elements.searchClear.style.display = 'none';
                    filterSystem.applyFilters();
                    renderSystem.renderProducts();
                    filterSystem.updateActiveFilters();
                });
                
                // Filtros
                elements.brandFilter.addEventListener('change', (e) => {
                    state.filters.brand = e.target.value;
                    filterSystem.applyFilters();
                    renderSystem.renderProducts();
                    filterSystem.updateActiveFilters();
                });
                
                elements.categoryFilter.addEventListener('change', (e) => {
                    state.filters.category = e.target.value;
                    filterSystem.applyFilters();
                    renderSystem.renderProducts();
                    filterSystem.updateActiveFilters();
                });
                
                elements.sortFilter.addEventListener('change', (e) => {
                    state.filters.sort = e.target.value;
                    filterSystem.applyFilters();
                    renderSystem.renderProducts();
                    filterSystem.updateActiveFilters();
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
                
                // Modal events
                modalElements.closeBtn.addEventListener('click', modalSystem.closeSizeSelectionModal);
                modalElements.overlay.addEventListener('click', (e) => {
                    if (e.target === modalElements.overlay) {
                        modalSystem.closeSizeSelectionModal();
                    }
                });
                modalElements.addToCartBtn.addEventListener('click', modalSystem.handleAddToCart);
                
                // Keyboard events
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && modalElements.overlay.classList.contains('active')) {
                        modalSystem.closeSizeSelectionModal();
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
                        // Adicionar dados simulados para demonstração
                        isNew: Math.random() > 0.7,
                        isLimited: Math.random() > 0.8,
                        categoria: ['lifestyle', 'running', 'basketball', 'skateboarding'][
                            Math.floor(Math.random() * 4)
                        ],
                        precoOriginal: product.preco * (1 + Math.random() * 0.3) // Preço original simulado
                    }));
                    
                    filterSystem.applyFilters();
                    renderSystem.renderProducts();
                    filterSystem.updateActiveFilters();
                    
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
                
                // Expor funções globais para debug
                window.catalogApp = {
                    state,
                    filterSystem,
                    renderSystem,
                    modalSystem,
                    showNotification,
                    removeFilter: filterSystem.removeFilter
                };
            }
        };

        // ===== INICIAR APLICAÇÃO =====
        init.start();
    }
});