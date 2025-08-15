document.addEventListener('DOMContentLoaded', async () => {
    const productDetailContainer = document.getElementById('product-detail');
    const API_URL = 'http://localhost:8080/api/produtos';

    // Pega o parâmetro 'id' que passamos na URL (ex: produto.html?id=5)
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (!productId) {
        productDetailContainer.innerHTML = '<p class="loading-message">Produto inválido ou não encontrado.</p>';
        return;
    }

    try {
        // Busca os dados do produto específico na API
        const response = await axios.get(`${API_URL}/${productId}`);
        const product = response.data;

        // Constrói o HTML com os dados do produto
        const productHTML = `
            <a href="../../catalogo/HTML/catalogo.html" class="back-to-catalog"><i class="fas fa-arrow-left"></i> Voltar ao catálogo</a>
            <div class="product-layout">
                <div class="product-image-gallery">
                    <img src="${product.imagemUrl}" alt="${product.nome}">
                </div>
                <div class="product-info-details">
                    <p class="brand">${product.marca.nome}</p>
                    <h1 class="name">${product.nome}</h1>
                    <p class="price">R$ ${product.preco.toFixed(2).replace('.', ',')}</p>
                    <p class="description">${product.descricao}</p>
                    <button class="btn btn-primary add-to-cart-btn" data-id="${product.id}">Adicionar ao Carrinho</button>
                </div>
            </div>
        `;
        
        productDetailContainer.innerHTML = productHTML;

    } catch (error) {
        console.error('Erro ao buscar detalhes do produto:', error);
        productDetailContainer.innerHTML = '<p class="loading-message">Erro ao carregar o produto. Tente novamente mais tarde.</p>';
    }

    // Adiciona a lógica de clique no botão (será integrada com o carrinho depois)
    productDetailContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            alert(`Produto ID ${e.target.dataset.id} adicionado! (Funcionalidade completa do carrinho virá a seguir)`);
            // Aqui chamaremos a função de adicionar ao carrinho do main.js
        }
    });
});