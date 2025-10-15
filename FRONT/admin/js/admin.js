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
        window.location.href = '../../../login/HTML/login.html';
        return;
    }

    // --- Configuração do Cliente API ---
    const apiClient = axios.create({
        baseURL: 'https://api.japauniverse.com.br/api/admin',
        headers: { 
            'Authorization': `Bearer ${token}`,
        }
    });
    const publicApiClient = axios.create({ baseURL: 'https://api.japauniverse.com.br/api' });

    // --- Elementos do DOM ---
    const pedidosSection = document.getElementById('pedidos-section');
    const produtosSection = document.getElementById('produtos-section');
    const mensagensSection = document.getElementById('mensagens-section');
    const navPedidos = document.getElementById('nav-pedidos');
    const navProdutos = document.getElementById('nav-produtos');
    const navMensagens = document.getElementById('nav-mensagens');
    const pedidosTableBody = document.getElementById('pedidos-table-body');
    const produtosTableBody = document.getElementById('produtos-table-body');
    const mensagensTableBody = document.getElementById('mensagens-table-body');
    const productModal = document.getElementById('product-modal');
    const modalTitle = document.getElementById('modal-title');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const addProductBtn = document.getElementById('add-product-btn');
    const productForm = document.getElementById('product-form');
    const brandSelect = document.getElementById('product-brand');
    const categorySelect = document.getElementById('product-category');
    const productImageInput = document.getElementById('product-image');
    const imagePreview = document.getElementById('image-preview');
    const imagePreviewText = document.getElementById('image-preview-text');
    const messageModal = document.getElementById('message-modal');
    const closeMessageModalBtn = document.getElementById('close-message-modal-btn');
    const messageModalBody = document.getElementById('message-modal-body');
    const messageModalTitle = document.getElementById('message-modal-title');
    let adminMessages = [];

    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    const toggleBtn = document.querySelector('.mobile-admin-toggle');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.add('active');
            overlay.classList.add('active');
        });
    }

    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }

    const getImageUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) {
            return path;
        }
        return `/${path}`;
    };

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
        }
    };

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
                <td><button class="btn btn-primary btn-sm update-status-btn" data-pedido-id="${pedido.id}">Atualizar</button></td>
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

    const renderMensagens = (mensagens) => {
        adminMessages = mensagens;
        mensagens.sort((a, b) => new Date(b.dataEnvio) - new Date(a.dataEnvio));
        mensagensTableBody.innerHTML = mensagens.map(msg => `
            <tr>
                <td>${msg.id}</td>
                <td>${msg.nome}</td>
                <td>${msg.email}</td>
                <td>${msg.assunto}</td>
                <td>${new Date(msg.dataEnvio).toLocaleString('pt-BR')}</td>
                <td><button class="btn btn-primary btn-sm view-message-btn" data-message-id="${msg.id}">Visualizar</button></td>
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

    const fetchMensagens = async () => {
        try {
            const response = await apiClient.get('/contatos');
            renderMensagens(response.data);
        } catch (error) {
            console.error("Erro ao buscar mensagens:", error);
            mensagensTableBody.innerHTML = '<tr><td colspan="6">Não foi possível carregar as mensagens.</td></tr>';
        }
    };

    const switchView = (view) => {
        [pedidosSection, produtosSection, mensagensSection].forEach(s => s.classList.remove('active'));
        [navPedidos, navProdutos, navMensagens].forEach(n => n.classList.remove('active'));
        
        if (view === 'pedidos') {
            pedidosSection.classList.add('active');
            navPedidos.classList.add('active');
            fetchPedidos();
        } else if (view === 'produtos') {
            produtosSection.classList.add('active');
            navProdutos.classList.add('active');
            fetchProdutos();
        } else if (view === 'mensagens') {
            mensagensSection.classList.add('active');
            navMensagens.classList.add('active');
            fetchMensagens();
        }
    };

    navPedidos.addEventListener('click', (e) => { e.preventDefault(); switchView('pedidos'); });
    navProdutos.addEventListener('click', (e) => { e.preventDefault(); switchView('produtos'); });
    navMensagens.addEventListener('click', (e) => { e.preventDefault(); switchView('mensagens'); });

    const openModal = (produto = null) => {
        productForm.reset();
        productImageInput.value = '';
        imagePreview.classList.add('hidden');
        imagePreview.src = '#';
        imagePreviewText.textContent = 'Nenhuma imagem selecionada.';
        
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
            if (produto.imagemUrl) {
                imagePreview.src = getImageUrl(produto.imagemUrl);
                imagePreview.classList.remove('hidden');
                imagePreviewText.textContent = 'Imagem atual do produto.';
            }
        } else {
            modalTitle.textContent = 'Adicionar Novo Produto';
            document.getElementById('product-id').value = '';
        }
        productModal.classList.add('active');
    };

    const closeModal = () => productModal.classList.remove('active');
    const openMessageModal = (message) => {
        messageModalTitle.textContent = `Mensagem de: ${message.nome}`;
        messageModalBody.innerHTML = `<p><strong>De:</strong> ${message.nome} (${message.email})</p><p><strong>Data:</strong> ${new Date(message.dataEnvio).toLocaleString('pt-BR')}</p><h4>Assunto: ${message.assunto}</h4><p>${message.mensagem}</p>`;
        messageModal.classList.add('active');
    };
    const closeMessageModal = () => messageModal.classList.remove('active');
    
    addProductBtn.addEventListener('click', () => openModal());
    closeModalBtn.addEventListener('click', closeModal);
    productModal.addEventListener('click', (e) => { if (e.target === productModal) closeModal(); });
    closeMessageModalBtn.addEventListener('click', closeMessageModal);
    messageModal.addEventListener('click', (e) => { if (e.target === messageModal) closeMessageModal(); });
    
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
        } else if (!document.getElementById('product-id').value) {
            imagePreview.classList.add('hidden');
            imagePreview.src = '#';
            imagePreviewText.textContent = 'Nenhuma imagem selecionada.';
        }
    });

    pedidosTableBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('update-status-btn')) {
            const pedidoId = e.target.dataset.pedidoId;
            const newStatus = document.querySelector(`.status-select[data-pedido-id="${pedidoId}"]`).value;
            try {
                await apiClient.patch(`/pedidos/${pedidoId}/status`, { status: newStatus });
                alert(`Status do pedido #${pedidoId} atualizado.`);
                fetchPedidos();
            } catch (error) {
                alert('Falha ao atualizar o status.');
            }
        }
    });
    
    produtosTableBody.addEventListener('click', async (e) => {
        const target = e.target.closest('button');
        if (!target) return;
        const productId = target.dataset.productId;
        if (target.classList.contains('btn-edit')) {
            try {
                const response = await publicApiClient.get(`/produtos/${productId}`);
                openModal(response.data);
            } catch (error) {
                alert('Não foi possível carregar os dados do produto.');
            }
        } else if (target.classList.contains('btn-delete')) {
            if (confirm(`Tem certeza que deseja excluir o produto ID ${productId}?`)) {
                try {
                    await apiClient.delete(`/produtos/${productId}`);
                    alert('Produto excluído!');
                    fetchProdutos();
                } catch (error) {
                    alert('Falha ao excluir o produto.');
                }
            }
        }
    });

    mensagensTableBody.addEventListener('click', (e) => {
        const target = e.target.closest('.view-message-btn');
        if (target) {
            const message = adminMessages.find(m => m.id === parseInt(target.dataset.messageId, 10));
            if (message) openMessageModal(message);
        }
    });

    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const [brandId, categoryId] = [parseInt(brandSelect.value, 10), parseInt(categorySelect.value, 10)];
        if (isNaN(brandId) || isNaN(categoryId)) {
            alert('Selecione marca e categoria.');
            return;
        }
        
        const id = document.getElementById('product-id').value;
        const formData = new FormData();
        formData.append('produto', JSON.stringify({
            nome: document.getElementById('product-name').value,
            marca: { id: brandId },
            categoria: { id: categoryId },
            preco: parseFloat(document.getElementById('product-price').value),
            precoOriginal: document.getElementById('product-original-price').value ? parseFloat(document.getElementById('product-original-price').value) : null,
            estoque: parseInt(document.getElementById('product-stock').value),
            descricao: document.getElementById('product-description').value,
        }));
        
        if (productImageInput.files[0]) formData.append('imagem', productImageInput.files[0]);

        try {
            const url = id ? `/produtos/${id}` : '/produtos';
            const method = id ? 'put' : 'post';
            await apiClient[method](url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            alert(`Produto ${id ? 'atualizado' : 'adicionado'}!`);
            closeModal();
            fetchProdutos();
        } catch (error) {
            alert('Falha ao salvar o produto.');
        }
    });

    fetchBrandsAndCategories();
    switchView('pedidos');
});