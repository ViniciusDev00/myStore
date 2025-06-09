// JS/catalogo.js - Lógica da Página de Catálogo

document.addEventListener('DOMContentLoaded', () => {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;
    
    let iso; // Isotope instance

    function createProductCardHTML(product) {
        // Reutilizando a mesma estrutura de card
        return `
            <div class="product-card ${product.category} ${product.brand.toLowerCase()}" data-id="${product.id}">
                <div class="product-image-wrapper">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <div class="product-info">
                    <span class="product-brand">${product.brand}</span>
                    <h3 class="product-name">${product.name}</h3>
                     <div class="product-footer">
                        <span class="product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</span>
                        <button class="add-to-cart-btn" aria-label="Adicionar ao carrinho">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    function loadProducts() {
        if (typeof productsData === 'undefined' || productsData.length === 0) return;
        
        // Limpa os skeletons e renderiza os produtos
        productsGrid.innerHTML = productsData.map(createProductCardHTML).join('');

        // Inicializa o Isotope após adicionar os itens
        iso = new Isotope(productsGrid, {
            itemSelector: '.product-card',
            layoutMode: 'fitRows'
        });
    }

    // Atraso para simular o fetch da API e mostrar o skeleton
    setTimeout(loadProducts, 1500);

    // Lógica dos filtros (Exemplo)
    const filterContainer = document.querySelector('.filter-bar');
    if(filterContainer) {
        filterContainer.addEventListener('click', (e) => {
            const filterButton = e.target.closest('[data-filter]');
            if (!filterButton || !iso) return;
            
            const filterValue = filterButton.getAttribute('data-filter');
            iso.arrange({ filter: filterValue });

            // Lógica para marcar botão ativo
            filterContainer.querySelectorAll('[data-filter]').forEach(btn => btn.classList.remove('active'));
            filterButton.classList.add('active');
        });
    }

    // Lógica do slider de preço (noUiSlider)
    const priceSlider = document.getElementById('price-slider');
    if (priceSlider) {
        noUiSlider.create(priceSlider, {
            start: [240, 400],
            connect: true,
            range: { 'min': 240, 'max': 400 },
            step: 10,
            format: {
                to: value => `R$${Math.round(value)}`,
                from: value => Number(value.replace('R$', ''))
            }
        });

        const minPrice = document.getElementById('min-price');
        const maxPrice = document.getElementById('max-price');
        priceSlider.noUiSlider.on('update', (values) => {
            minPrice.textContent = values[0];
            maxPrice.textContent = values[1];
        });
        
        priceSlider.noUiSlider.on('change', (values) => {
            const min = Number(values[0].replace('R$', ''));
            const max = Number(values[1].replace('R$', ''));
            iso.arrange({
                filter: function(item) {
                    const priceText = item.querySelector('.product-price').textContent;
                    const price = parseFloat(priceText.replace('R$', '').replace(',', '.'));
                    return price >= min && price <= max;
                }
            })
        });
    }
});