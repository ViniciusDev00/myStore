document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('jwtToken'); // **MUDANÇA 1: Usar 'jwtToken' como no código antigo**
    let userRole = '';
    const apiUrl = 'https://api.japauniverse.com.br'; // **URL da API corrigida**

    // Função para decodificar o token JWT (igual ao código antigo)
    const parseJwt = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error("Erro ao decodificar token:", e);
            return null;
        }
    };

    // **MUDANÇA 2: Extrai a role diretamente do token**
    if (token) {
        const decodedToken = parseJwt(token);
        // Verifica se o token foi decodificado e se contém as 'authorities'
        if (decodedToken && decodedToken.authorities && decodedToken.authorities.length > 0) {
            // Pega a primeira autoridade (role) da lista
            userRole = decodedToken.authorities[0].authority;
        } else {
            console.warn("Token decodificado não contém 'authorities' ou está malformado.");
        }
    }

    // **MUDANÇA 3: Compara com 'ROLE_ADMIN' (como no código antigo)**
    if (userRole !== 'ROLE_ADMIN') {
        alert('Acesso negado. Você precisa ser um administrador.');
        // **MUDANÇA 4: Garante que o caminho para o login está correto**
        window.location.href = '/FRONT/login/HTML/login.html'; // Usando caminho absoluto
        return;
    }

    // --- Configuração do Cliente API ---
    // Cria a instância do Axios com a base URL correta e token
    const apiClient = axios.create({
        baseURL: `${apiUrl}/api/admin`, // Endpoint específico do admin
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
     const publicApiClient = axios.create({ baseURL: `${apiUrl}/api` }); // Para endpoints públicos

    // Elementos do DOM (igual ao seu código mais recente)
    const produtosTableBody = document.getElementById('produtos-table-body');
    const pedidosTableBody = document.getElementById('pedidos-table-body');
    const addProdutoForm = document.getElementById('product-form'); // **Correção ID**
    const produtoIdInput = document.getElementById('product-id');  // **Correção ID**
    const nomeInput = document.getElementById('product-name'); // **Correção ID**
    const descricaoInput = document.getElementById('product-description'); // **Correção ID**
    const precoInput = document.getElementById('product-price'); // **Correção ID**
    const precoOriginalInput = document.getElementById('product-original-price'); // **Adicionado**
    const estoqueInput = document.getElementById('product-stock'); // **Adicionado**
    const marcaSelect = document.getElementById('product-brand'); // **Correção ID**
    const categoriaSelect = document.getElementById('product-category'); // **Correção ID**
    const imagemInput = document.getElementById('product-image'); // **Correção ID**
    const formTitle = document.getElementById('modal-title'); // **Correção ID**
    const productModal = document.getElementById('product-modal'); // **Correção ID**
    const closeModalBtn = document.getElementById('close-modal-btn'); // **Correção ID**
    const addProductBtn = document.getElementById('add-product-btn'); // **Correção ID**
    const imagePreview = document.getElementById('image-preview');
    const imagePreviewText = document.getElementById('image-preview-text');

    const pedidosSection = document.getElementById('pedidos-section');
    const produtosSection = document.getElementById('produtos-section');
    const mensagensSection = document.getElementById('mensagens-section');
    const navPedidos = document.getElementById('nav-pedidos');
    const navProdutos = document.getElementById('nav-produtos');
    const navMensagens = document.getElementById('nav-mensagens');
    const mensagensTableBody = document.getElementById('mensagens-table-body');
    const messageModal = document.getElementById('message-modal');
    const closeMessageModalBtn = document.getElementById('close-message-modal-btn');
    const messageModalBody = document.getElementById('message-modal-body');
    const messageModalTitle = document.getElementById('message-modal-title');
    let adminMessages = [];

    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    const toggleBtn = document.querySelector('.mobile-admin-toggle');

    // --- Funções Auxiliares ---

    // Função auxiliar para obter URL da imagem (se necessário ajustar base URL)
    const getImageUrl = (path) => {
        if (!path) return 'placeholder.png'; // Imagem padrão se não houver
        if (path.startsWith('http')) {
            return path;
        }
         // Assumindo que o backend serve as imagens diretamente na raiz + path
        return `${apiUrl}/${path}`;
    };

    const resetForm = () => {
        addProdutoForm.reset();
        produtoIdInput.value = '';
        formTitle.textContent = 'Adicionar Novo Produto';
        imagemInput.required = true;
        imagePreview.classList.add('hidden');
        imagePreview.src = '#';
        imagePreviewText.textContent = 'Nenhuma imagem selecionada.';
        productModal.classList.remove('active'); // Garante que o modal fecha
    };

    // Popula selects de marca e categoria
    const populateSelect = (selectElement, items, placeholder) => {
        selectElement.innerHTML = `<option value="">${placeholder}</option>`;
        items.forEach(item => {
            selectElement.innerHTML += `<option value="${item.id}">${item.nome}</option>`;
        });
    };

    const fetchBrandsAndCategories = async () => {
        try {
            const [brandsRes, categoriesRes] = await Promise.all([
                publicApiClient.get('/produtos/marcas'), // Usa apiClient público
                publicApiClient.get('/produtos/categorias') // Usa apiClient público
            ]);
            populateSelect(marcaSelect, brandsRes.data, 'Selecione uma marca');
            populateSelect(categoriaSelect, categoriesRes.data, 'Selecione uma categoria');
        } catch (error) {
            console.error("Erro ao buscar marcas e categorias:", error);
            alert("Erro ao carregar opções do formulário.");
        }
    };


    // --- Renderização de Tabelas (Função de Pedidos Corrigida) ---

    const renderPedidos = (pedidos) => {
        pedidos.sort((a, b) => new Date(b.dataPedido) - new Date(a.dataPedido));
        pedidosTableBody.innerHTML = pedidos.map(pedido => {
            const nomeCliente = pedido.usuario ? pedido.usuario.nome : 'Usuário Desconhecido';
            const valorFormatado = pedido.valorTotal ? `R$ ${pedido.valorTotal.toFixed(2).replace('.', ',')}` : 'R$ --,--';
            const dataFormatada = pedido.dataPedido ? new Date(pedido.dataPedido).toLocaleDateString('pt-BR') : '--/--/----';

            return `
            <tr>
                <td>#${String(pedido.id).padStart(6, '0')}</td>
                <td>${nomeCliente}</td>
                <td>${dataFormatada}</td>
                <td>${valorFormatado}</td>
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
        `}).join('');
    };

     const renderProdutos = (produtos) => {
        produtosTableBody.innerHTML = produtos.map(produto => `
            <tr>
                <td>${produto.id}</td>
                <td><img src="${getImageUrl(produto.imagemUrl)}" alt="${produto.nome}" width="50" style="border-radius: 4px; object-fit: cover;"></td>
                <td>${produto.nome}</td>
                <td>R$ ${produto.preco.toFixed(2).replace('.', ',')}</td>
                 <td>${produto.marca?.nome || 'N/A'}</td> {/* Usando optional chaining */}
                 <td>${produto.categoria?.nome || 'N/A'}</td> {/* Usando optional chaining */}
                 <td>${produto.estoque || 0}</td> {/* Estoque */}
                <td>
                    <button class="btn btn-warning btn-sm edit-produto-btn" data-product-id="${produto.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger btn-sm delete-produto-btn" data-product-id="${produto.id}"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    };

    const renderMensagens = (mensagens) => {
        adminMessages = mensagens; // Guarda as mensagens para o modal
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

    // --- Carregamento de Dados ---

    const fetchPedidos = async () => {
        try {
            const response = await apiClient.get('/pedidos'); // Usa apiClient autenticado
            renderPedidos(response.data);
        } catch (error) {
            console.error("Erro ao buscar pedidos:", error);
            pedidosTableBody.innerHTML = '<tr><td colspan="6">Não foi possível carregar os pedidos.</td></tr>';
             if (error.response && error.response.status === 403) {
                alert("Sua sessão expirou ou você não tem permissão. Faça login novamente.");
                localStorage.removeItem('jwtToken');
                window.location.href = '/FRONT/login/HTML/login.html';
             }
        }
    };

    const fetchProdutos = async () => {
        try {
            const response = await apiClient.get('/produtos'); // Usa apiClient autenticado
            renderProdutos(response.data);
        } catch (error) {
            console.error("Erro ao buscar produtos:", error);
            produtosTableBody.innerHTML = '<tr><td colspan="8">Não foi possível carregar os produtos.</td></tr>'; // Atualizado colspan
             if (error.response && error.response.status === 403) {
                 alert("Sua sessão expirou ou você não tem permissão. Faça login novamente.");
                 localStorage.removeItem('jwtToken');
                window.location.href = '/FRONT/login/HTML/login.html';
             }
        }
    };

    const fetchMensagens = async () => {
        try {
            const response = await apiClient.get('/contatos'); // Usa apiClient autenticado
            renderMensagens(response.data);
        } catch (error) {
            console.error("Erro ao buscar mensagens:", error);
            mensagensTableBody.innerHTML = '<tr><td colspan="6">Não foi possível carregar as mensagens.</td></tr>';
             if (error.response && error.response.status === 403) {
                 alert("Sua sessão expirou ou você não tem permissão. Faça login novamente.");
                 localStorage.removeItem('jwtToken');
                 window.location.href = '/FRONT/login/HTML/login.html';
             }
        }
    };

    // --- Navegação e Modais ---

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
         // Fecha o sidebar mobile ao trocar de aba
         if (sidebar && overlay && sidebar.classList.contains('active')) {
             sidebar.classList.remove('active');
             overlay.classList.remove('active');
         }
    };

    navPedidos.addEventListener('click', (e) => { e.preventDefault(); switchView('pedidos'); });
    navProdutos.addEventListener('click', (e) => { e.preventDefault(); switchView('produtos'); });
    navMensagens.addEventListener('click', (e) => { e.preventDefault(); switchView('mensagens'); });

    // Abre o modal de produto (para adicionar ou editar)
     const openProductModal = (produto = null) => {
        resetForm(); // Limpa o formulário antes de preencher
        imagemInput.required = !produto; // Imagem obrigatória só ao adicionar

        if (produto) {
            modalTitle.textContent = 'Editar Produto';
            produtoIdInput.value = produto.id;
            nomeInput.value = produto.nome;
            marcaSelect.value = produto.marca?.id || '';
            categoriaSelect.value = produto.categoria?.id || '';
            precoInput.value = produto.preco.toFixed(2);
            precoOriginalInput.value = produto.precoOriginal ? produto.precoOriginal.toFixed(2) : '';
            estoqueInput.value = produto.estoque || 0;
            descricaoInput.value = produto.descricao || '';

            if (produto.imagemUrl) {
                imagePreview.src = getImageUrl(produto.imagemUrl);
                imagePreview.classList.remove('hidden');
                imagePreviewText.textContent = 'Imagem atual. Selecione outra para substituir.';
            }

        } else {
            modalTitle.textContent = 'Adicionar Novo Produto';
        }
        productModal.classList.add('active');
    };

    const closeProductModal = () => productModal.classList.remove('active');

    const openMessageModal = (message) => {
        messageModalTitle.textContent = `Mensagem de: ${message.nome}`;
        messageModalBody.innerHTML = `
            <p class="message-info"><strong>De:</strong> ${message.nome} (${message.email})</p>
            <p class="message-info"><strong>Data:</strong> ${new Date(message.dataEnvio).toLocaleString('pt-BR')}</p>
            <h4>Assunto: ${message.assunto}</h4>
            <p>${message.mensagem}</p>`;
        messageModal.classList.add('active');
    };
    const closeMessageModal = () => messageModal.classList.remove('active');

    // Event Listeners para Modais
    addProductBtn.addEventListener('click', () => openProductModal());
    closeModalBtn.addEventListener('click', closeProductModal);
    productModal.addEventListener('click', (e) => { if (e.target === productModal) closeProductModal(); });
    closeMessageModalBtn.addEventListener('click', closeMessageModal);
    messageModal.addEventListener('click', (e) => { if (e.target === messageModal) closeMessageModal(); });


    // Preview da Imagem
    imagemInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.classList.remove('hidden');
                imagePreviewText.textContent = `Nova imagem: ${file.name}`;
            };
            reader.readAsDataURL(file);
        } else if (!produtoIdInput.value) { // Só limpa se estiver adicionando
            imagePreview.classList.add('hidden');
            imagePreview.src = '#';
            imagePreviewText.textContent = 'Nenhuma imagem selecionada.';
        }
    });

    // --- Manipulação de Eventos das Tabelas ---

    // Event Delegation para botões na tabela de PEDIDOS
    pedidosTableBody.addEventListener('click', async (event) => {
        const target = event.target;
        const pedidoId = target.dataset.pedidoId;

        // Atualizar Status do Pedido
        if (target.classList.contains('update-status-btn')) {
            const selectElement = target.closest('tr').querySelector(`select.status-select`);
            const novoStatus = selectElement.value;

            if (!novoStatus) return;

            if (confirm(`Tem certeza que deseja atualizar o status do pedido #${pedidoId} para ${novoStatus}?`)) {
                try {
                     // **MUDANÇA: Usar PATCH e enviar JSON**
                    await apiClient.patch(`/pedidos/${pedidoId}/status`, { status: novoStatus });
                    alert('Status do pedido atualizado com sucesso!');
                    fetchPedidos(); // Atualiza a tabela
                } catch (error) {
                    alert('Erro ao atualizar o status do pedido.');
                    console.error('Erro ao atualizar status:', error);
                }
            }
        }
    });

    // Event Delegation para botões na tabela de PRODUTOS
    produtosTableBody.addEventListener('click', async (event) => {
        const target = event.target.closest('button'); // Pega o botão clicado
        if (!target) return; // Sai se não clicou num botão

        const productId = target.dataset.productId;

        // Editar Produto
        if (target.classList.contains('edit-produto-btn')) {
            try {
                 // **MUDANÇA: Usar publicApiClient para pegar detalhes do produto**
                const response = await publicApiClient.get(`/produtos/${productId}`);
                openProductModal(response.data); // Abre o modal com os dados
            } catch (error) {
                alert('Erro ao carregar dados do produto para edição.');
                console.error("Erro ao buscar produto para editar:", error);
            }
        }

        // Excluir Produto
        if (target.classList.contains('delete-produto-btn')) {
            if (confirm(`Tem certeza que deseja excluir o produto ID ${productId}?`)) {
                try {
                    await apiClient.delete(`/produtos/${productId}`);
                    alert('Produto excluído com sucesso!');
                    fetchProdutos(); // Atualiza a tabela
                } catch (error) {
                    alert('Erro ao excluir produto.');
                    console.error("Erro ao excluir produto:", error);
                }
            }
        }
    });

     // Event Delegation para botões na tabela de MENSAGENS
     mensagensTableBody.addEventListener('click', (e) => {
        const target = e.target.closest('.view-message-btn');
        if (target) {
            const messageId = parseInt(target.dataset.messageId, 10);
            const message = adminMessages.find(m => m.id === messageId);
            if (message) openMessageModal(message);
        }
    });

    // --- Submissão do Formulário de Produto ---
    addProdutoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = produtoIdInput.value;
        const isEditing = !!id;
        const url = isEditing ? `/produtos/${id}` : '/produtos';
        const method = isEditing ? 'put' : 'post'; // PUT para editar, POST para criar

        // Validar se marca e categoria foram selecionados
        const brandId = marcaSelect.value;
        const categoryId = categoriaSelect.value;
        if (!brandId || !categoryId) {
            alert('Por favor, selecione a marca e a categoria.');
            return;
        }

        const formData = new FormData();

        // Monta o objeto JSON do produto
        const produtoData = {
            nome: nomeInput.value,
            marca: { id: parseInt(brandId) }, // Envia objeto com ID
            categoria: { id: parseInt(categoryId) }, // Envia objeto com ID
            preco: parseFloat(precoInput.value),
            precoOriginal: precoOriginalInput.value ? parseFloat(precoOriginalInput.value) : null,
            estoque: parseInt(estoqueInput.value),
            descricao: descricaoInput.value,
        };
        // Adiciona o JSON como uma parte 'produto'
        formData.append('produto', JSON.stringify(produtoData));

        // Adiciona a imagem se foi selecionada
        if (imagemInput.files.length > 0) {
            formData.append('imagem', imagemInput.files[0]);
        } else if (!isEditing) {
            alert('Por favor, selecione uma imagem para o novo produto.');
            return; // Impede envio sem imagem ao criar
        }

        try {
            await apiClient({
                method: method,
                url: url,
                data: formData,
                headers: { 'Content-Type': 'multipart/form-data' } // Necessário para FormData
            });

            alert(`Produto ${isEditing ? 'atualizado' : 'adicionado'} com sucesso!`);
            closeProductModal(); // Fecha o modal
            fetchProdutos(); // Atualiza a tabela
        } catch (error) {
            alert(`Falha ao ${isEditing ? 'atualizar' : 'adicionar'} o produto.`);
            console.error(`Erro ao salvar produto:`, error.response?.data || error.message);
        }
    });


    // --- Inicialização ---
    if (toggleBtn && sidebar && overlay) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.add('active');
            overlay.classList.add('active');
        });
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }

    await fetchBrandsAndCategories(); // Carrega marcas/categorias primeiro
    switchView('pedidos'); // Inicia na aba de pedidos
});