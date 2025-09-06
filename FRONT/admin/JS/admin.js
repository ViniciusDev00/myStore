document.addEventListener('DOMContentLoaded', () => {
    // --- Autenticação e Autorização ---
    const token = localStorage.getItem('jwtToken');
    let userRole = '';

    const parseJwt = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    };

    if (token) {
        const decodedToken = parseJwt(token);
        if (decodedToken && decodedToken.authorities) {
            userRole = decodedToken.authorities[0].authority;
        }
    }

    if (userRole !== 'ROLE_ADMIN') {
        alert('Acesso negado. Você precisa ser um administrador.');
        window.location.href = '../../login/HTML/login.html';
        return;
    }

    // --- Configuração do Cliente API ---
    const apiClient = axios.create({
        baseURL: 'http://localhost:8080/api/admin',
        headers: { 
            'Authorization': `Bearer ${token}`,
        }
    });
    const publicApiClient = axios.create({ baseURL: 'http://localhost:8080/api' });

    // --- Elementos do DOM ---
    const pedidosSection = document.getElementById('pedidos-section');
    const produtosSection = document.getElementById('produtos-section');
    const navPedidos = document.getElementById('nav-pedidos');
    const navProdutos = document.getElementById('nav-produtos');
    const pedidosTableBody = document.getElementById('pedidos-table-body');
    const produtosTableBody = document.getElementById('produtos-table-body');
    
    // --- Elementos do Modal ---
    const productModal = document.getElementById('product-modal');
    const modalTitle = document.getElementById('modal-title');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const addProductBtn = document.getElementById('add-product-btn');
    const productForm = document.getElementById('product-form');
    const brandSelect = document.getElementById('product-brand');
    const categorySelect = document.getElementById('product-category');

    // Elementos da pré-visualização de imagem
    const productImageInput = document.getElementById('product-image');
    const imagePreview = document.getElementById('image-preview');
    const imagePreviewText = document.getElementById('image-preview-text');


    // --- Funções de Carregamento de Dados ---
    const populateSelect = (selectElement, items, placeholder) => {
        selectElement.innerHTML = `<option value="">${placeholder}</option>`;
        items.forEach(item => {
            selectElement.innerHTML += `<option value="${item.id}">${item.nome}</option>`;
        });
    };

    const fetchBrandsAndCategories = async () => {
        try {
            const [brandsRes, categoriesRes] = await Promise.all([
                publicApiClient.get('/produtos/marcas'),
                publicApiClient.get('/produtos/categorias')
            ]);
            populateSelect(brandSelect, brandsRes.data, 'Selecione uma marca');
            populateSelect(categorySelect, categoriesRes.data, 'Selecione uma categoria');
        } catch (error) {
            console.error("Erro ao buscar marcas e categorias:", error);
            alert('Não foi possível carregar as opções de marcas e categorias.');
        }
    };

    // --- Funções de Renderização ---
    const renderPedidos = (pedidos) => {
        pedidosTableBody.innerHTML = pedidos.map(pedido => `
            <tr>
                <td>#${String(pedido.id).padStart(6, '0')}</td>
                <td>${pedido.usuario.nome}</td>
                <td>${new Date(pedido.dataPedido).toLocaleDateString()}</td>
                <td>R$ ${pedido.valorTotal.toFixed(2).replace('.', ',')}</td>
                <td>
                    <select class="status-select" data-pedido-id="${pedido.id}">
                        <option value="PENDENTE" ${pedido.status === 'PENDENTE' ? 'selected' : ''}>Pendente</option>
                        <option value="PAGO" ${pedido.status === 'PAGO' ? 'selected' : ''}>Pago</option>
                        <option value="ENVIADO" ${pedido.status === 'ENVIADO' ? 'selected' : ''}>Enviado</option>
                        <option value="ENTREGUE" ${pedido.status === 'ENTREGUE' ? 'selected' : ''}>Entregue</option>
                        <option value="CANCELADO" ${pedido.status === 'CANCELADO' ? 'selected' : ''}>Cancelado</option>
                    </select>
                </td>
                <td>
                    <button class="btn btn-primary btn-sm update-status-btn" data-pedido-id="${pedido.id}">Atualizar</button>
                </td>
            </tr>
        `).join('');
    };
    
    const renderProdutos = (produtos) => {
        produtosTableBody.innerHTML = produtos.map(produto => `
            <tr>
                <td>${produto.id}</td>
                <td>${produto.nome}</td>
                <td>${produto.marca.nome}</td>
                <td>R$ ${produto.preco.toFixed(2).replace('.', ',')}</td>
                <td>${produto.estoque}</td>
                <td>
                    <button class="btn btn-edit" data-product-id="${produto.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-delete" data-product-id="${produto.id}"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    };

    const fetchPedidos = async () => {
        try {
            const response = await apiClient.get('/pedidos');
            renderPedidos(response.data);
        } catch (error) {
            console.error("Erro ao buscar pedidos:", error);
            pedidosTableBody.innerHTML = '<tr><td colspan="6">Não foi possível carregar os pedidos.</td></tr>';
        }
    };
    
    const fetchProdutos = async () => {
        try {
            const response = await apiClient.get('/produtos');
            renderProdutos(response.data);
        } catch (error) {
            console.error("Erro ao buscar produtos:", error);
            produtosTableBody.innerHTML = '<tr><td colspan="6">Não foi possível carregar os produtos.</td></tr>';
        }
    };

    // --- Navegação ---
    const switchView = (view) => {
        if (view === 'pedidos') {
            pedidosSection.classList.add('active');
            produtosSection.classList.remove('active');
            navPedidos.classList.add('active');
            navProdutos.classList.remove('active');
            fetchPedidos();
        } else if (view === 'produtos') {
            produtosSection.classList.add('active');
            pedidosSection.classList.remove('active');
            navProdutos.classList.add('active');
            navPedidos.classList.remove('active');
            fetchProdutos();
        }
    };

    navPedidos.addEventListener('click', (e) => { e.preventDefault(); switchView('pedidos'); });
    navProdutos.addEventListener('click', (e) => { e.preventDefault(); switchView('produtos'); });

    // --- Lógica do Modal de Produto ---
    const openModal = (produto = null) => {
        productForm.reset();
        productImageInput.value = ''; // Limpa o campo de arquivo
        imagePreview.classList.add('hidden'); // Esconde a pré-visualização
        imagePreview.src = '#'; // Reseta a URL da imagem
        imagePreviewText.textContent = 'Nenhuma imagem selecionada.'; // Reseta o texto
        
        if (produto) {
            modalTitle.textContent = 'Editar Produto';
            document.getElementById('product-id').value = produto.id;
            document.getElementById('product-name').value = produto.nome;
            brandSelect.value = produto.marca.id;
            categorySelect.value = produto.categoria.id;
            document.getElementById('product-price').value = produto.preco;
            document.getElementById('product-original-price').value = produto.precoOriginal || '';
            document.getElementById('product-stock').value = produto.estoque;
            document.getElementById('product-description').value = produto.descricao;

            // Mostra a imagem atual do produto para edição
            if (produto.imagemUrl) {
                imagePreview.src = `http://localhost:8080${produto.imagemUrl}`; // Assume que as imagens são servidas pelo backend
                imagePreview.classList.remove('hidden');
                imagePreviewText.textContent = 'Imagem atual do produto.';
            } else {
                imagePreview.classList.add('hidden');
                imagePreviewText.textContent = 'Nenhuma imagem atual.';
            }

        } else {
            modalTitle.textContent = 'Adicionar Novo Produto';
            document.getElementById('product-id').value = '';
        }
        productModal.style.display = 'flex';
    };

    const closeModal = () => {
        productModal.style.display = 'none';
    };

    addProductBtn.addEventListener('click', () => openModal());
    closeModalBtn.addEventListener('click', closeModal);
    productModal.addEventListener('click', (e) => {
        if (e.target === productModal) closeModal();
    });

    // --- Lógica de Pré-visualização da Imagem ---
    productImageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.classList.remove('hidden');
                imagePreviewText.textContent = file.name;
            };
            reader.readAsDataURL(file);
        } else {
            // Se nenhum arquivo for selecionado, verifique se estamos em modo de edição
            const productId = document.getElementById('product-id').value;
            if (productId) {
                 // No modo de edição, manter a imagem atual se não for selecionada uma nova
                 // openModal já trata de carregar a imagem existente
            } else {
                imagePreview.classList.add('hidden');
                imagePreview.src = '#';
                imagePreviewText.textContent = 'Nenhuma imagem selecionada.';
            }
        }
    });

    // --- Lógica de Ações ---
    pedidosTableBody.addEventListener('click', async (e) => { /* ... (sem alterações) ... */ });
    
    produtosTableBody.addEventListener('click', async (e) => { /* ... (sem alterações) ... */ });

    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const brandId = parseInt(brandSelect.value, 10);
        const categoryId = parseInt(categorySelect.value, 10);

        if (isNaN(brandId) || isNaN(categoryId)) {
            alert('Por favor, selecione uma marca e uma categoria válidas.');
            return;
        }
        
        const id = document.getElementById('product-id').value;
        const produtoData = {
            nome: document.getElementById('product-name').value,
            marca: { id: brandId },
            categoria: { id: categoryId },
            preco: parseFloat(document.getElementById('product-price').value),
            precoOriginal: document.getElementById('product-original-price').value ? parseFloat(document.getElementById('product-original-price').value) : null,
            estoque: parseInt(document.getElementById('product-stock').value),
            descricao: document.getElementById('product-description').value,
            // A imagemUrl não é mais enviada diretamente aqui
        };

        const formData = new FormData();
        formData.append('produto', JSON.stringify(produtoData));
        
        const imageFile = productImageInput.files[0]; // Referência direta ao input
        if (imageFile) {
            formData.append('imagem', imageFile);
        }

        try {
            if (id) {
                await apiClient.put(`/produtos/${id}`, formData);
                alert('Produto atualizado com sucesso!');
            } else {
                await apiClient.post('/produtos', formData);
                alert('Produto adicionado com sucesso!');
            }
            closeModal();
            fetchProdutos();
        } catch (error) {
            console.error("Erro ao salvar produto:", error);
            alert('Falha ao salvar o produto. Verifique os dados e tente novamente.');
        }
    });

    // --- Inicialização ---
    fetchBrandsAndCategories();
    switchView('pedidos');
});