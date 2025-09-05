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
            userRole = decodedToken.authorities[0];
        }
    }

    // Se não for admin, redireciona para a página de login
    if (userRole !== 'ROLE_ADMIN') {
        alert('Acesso negado. Você precisa ser um administrador.');
        window.location.href = '../../login/HTML/login.html';
        return;
    }

    // --- Configuração do Cliente API ---
    const apiClient = axios.create({
        baseURL: 'http://localhost:8080/api/admin',
        headers: { 'Authorization': `Bearer ${token}` }
    });

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

    // --- Funções de Carregamento de Dados ---
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
            const response = await apiClient.get('/produtos'); // Usando endpoint público por enquanto
            const publicApiClient = axios.create({ baseURL: 'http://localhost:8080/api' });
            const allProducts = await publicApiClient.get('/produtos');
            renderProdutos(allProducts.data);
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
        if (produto) {
            modalTitle.textContent = 'Editar Produto';
            document.getElementById('product-id').value = produto.id;
            document.getElementById('product-name').value = produto.nome;
            document.getElementById('product-brand').value = produto.marca.id;
            document.getElementById('product-category').value = produto.categoria.id;
            document.getElementById('product-price').value = produto.preco;
            document.getElementById('product-original-price').value = produto.precoOriginal || '';
            document.getElementById('product-stock').value = produto.estoque;
            document.getElementById('product-image-url').value = produto.imagemUrl;
            document.getElementById('product-description').value = produto.descricao;
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

    // --- Lógica de Ações ---
    pedidosTableBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('update-status-btn')) {
            const pedidoId = e.target.dataset.pedidoId;
            const status = document.querySelector(`.status-select[data-pedido-id="${pedidoId}"]`).value;
            try {
                await apiClient.patch(`/pedidos/${pedidoId}/status`, { status });
                alert('Status do pedido atualizado com sucesso!');
                fetchPedidos();
            } catch (error) {
                console.error("Erro ao atualizar status:", error);
                alert('Falha ao atualizar o status.');
            }
        }
    });
    
    produtosTableBody.addEventListener('click', async (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        const productId = target.dataset.productId;

        if (target.classList.contains('btn-delete')) {
            if (confirm('Tem certeza que deseja excluir este produto?')) {
                try {
                    await apiClient.delete(`/produtos/${productId}`);
                    alert('Produto excluído com sucesso!');
                    fetchProdutos();
                } catch (error) {
                    console.error("Erro ao excluir produto:", error);
                    alert('Falha ao excluir o produto.');
                }
            }
        }
        
        if (target.classList.contains('btn-edit')) {
            try {
                const publicApiClient = axios.create({ baseURL: 'http://localhost:8080/api' });
                const response = await publicApiClient.get(`/produtos/${productId}`);
                openModal(response.data);
            } catch (error) {
                 console.error("Erro ao buscar dados do produto para edição:", error);
                 alert('Não foi possível carregar os dados do produto.');
            }
        }
    });

    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('product-id').value;
        const produtoData = {
            nome: document.getElementById('product-name').value,
            marca: { id: parseInt(document.getElementById('product-brand').value) },
            categoria: { id: parseInt(document.getElementById('product-category').value) },
            preco: parseFloat(document.getElementById('product-price').value),
            precoOriginal: document.getElementById('product-original-price').value ? parseFloat(document.getElementById('product-original-price').value) : null,
            estoque: parseInt(document.getElementById('product-stock').value),
            imagemUrl: document.getElementById('product-image-url').value,
            descricao: document.getElementById('product-description').value,
        };

        try {
            if (id) {
                // Atualizar
                await apiClient.put(`/produtos/${id}`, produtoData);
                alert('Produto atualizado com sucesso!');
            } else {
                // Criar
                await apiClient.post('/produtos', produtoData);
                alert('Produto adicionado com sucesso!');
            }
            closeModal();
            fetchProdutos();
        } catch (error) {
            console.error("Erro ao salvar produto:", error);
            alert('Falha ao salvar o produto.');
        }
    });

    // --- Inicialização ---
    switchView('pedidos');
});