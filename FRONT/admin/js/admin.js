document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwtToken');
    // Se não houver token, redireciona imediatamente para o login
    if (!token) {
        console.error("Token JWT não encontrado. Redirecionando para login.");
        window.location.href = '../../login/HTML/login.html'; 
        return; // Interrompe a execução do script
    }

    // Configuração do Axios com o token Bearer
    const apiClient = axios.create({
        baseURL: 'https://api.japauniverse.com.br/api', 
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    // --- Seletores de Elementos da UI ---
    const tabs = document.querySelectorAll('.nav-tab');
    const contents = document.querySelectorAll('.tab-content');
    
    // Seletores das tabelas (tbody)
    const orderList = document.getElementById('admin-order-list');
    const productList = document.getElementById('admin-product-list');
    const userList = document.getElementById('admin-user-list'); 

    // Seletores das Estatísticas do Dashboard
    const statTotalPedidos = document.getElementById('stat-total-pedidos');
    const statTotalUsuarios = document.getElementById('stat-total-usuarios');
    const statTotalProdutos = document.getElementById('stat-total-produtos');

    // Seletores do Modal de Detalhes do Pedido
    const orderDetailModal = document.getElementById('orderDetailModal');
    const closeModalBtn = document.getElementById('closeOrderDetailModal');
    const modalContent = document.getElementById('modalOrderDetailContent');
    const modalPedidoId = document.getElementById('modal-pedido-id');

    // --- Navegação por Abas ---
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const activeContent = document.getElementById(tab.dataset.tab);
            if (activeContent) {
                activeContent.classList.add('active');
            } else {
                console.warn(`Conteúdo da aba '${tab.dataset.tab}' não encontrado.`);
            }
        });
    });

    // --- Funções de Formatação ---
    const formatCurrency = (value) => value != null ? `R$ ${Number(value).toFixed(2).replace('.', ',')}` : 'R$ --,--';
    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A';
    const formatDateTime = (dateString) => dateString ? new Date(dateString).toLocaleString('pt-BR') : 'N/A';

    // --- Funções de Renderização das Tabelas ---

    // Renderiza a tabela de Pedidos
    const renderPedidos = (pedidos) => {
        if (!orderList) return;
        orderList.innerHTML = ''; 
        if (!pedidos || pedidos.length === 0) {
            orderList.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px;">Nenhum pedido encontrado.</td></tr>';
            return;
        }

        pedidos.sort((a, b) => b.id - a.id); // Ordena mais recentes primeiro

        pedidos.forEach(pedido => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${pedido.id}</td>
                <td>${formatDate(pedido.dataPedido)}</td>
                <td>${pedido.usuario?.nome || 'Usuário Indisponível'}</td> 
                <td>${formatCurrency(pedido.valorTotal)}</td>
                <td><span class="status-badge status-${pedido.status || 'DESCONHECIDO'}">${pedido.status || 'N/A'}</span></td>
                <td>
                    <button class="btn-secondary btn-sm view-details-btn" data-id="${pedido.id}">
                        <i class="fas fa-eye"></i> Detalhes
                    </button>
                    </td>
            `;
            orderList.appendChild(row);
        });
    };

    // Renderiza a tabela de Produtos
    const renderProdutos = (produtos) => {
        if (!productList) return;
        productList.innerHTML = '';
        if (!produtos || produtos.length === 0) {
            productList.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 20px;">Nenhum produto encontrado.</td></tr>';
            return;
        }
        produtos.forEach(produto => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${produto.id}</td>
                <td>${produto.nome || 'Sem nome'}</td>
                <td>${produto.marca?.nome || 'Sem marca'}</td>
                <td>${produto.categoria?.nome || 'Sem categoria'}</td> 
                <td>${produto.estoque || 0}</td>
                <td>${formatCurrency(produto.preco)}</td>
                <td>
                    <button class="btn btn-secondary btn-sm edit-product-btn" data-id="${produto.id}">Editar</button>
                    <button class="btn btn-danger btn-sm delete-product-btn" data-id="${produto.id}">Excluir</button>
                </td>
            `;
            productList.appendChild(row);
        });
    };

    // Renderiza a tabela de Usuários
    const renderUsuarios = (usuarios) => {
        if (!userList) return; 
        userList.innerHTML = ''; 
        if (!usuarios || usuarios.length === 0) {
            userList.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">Nenhum usuário encontrado.</td></tr>';
            return;
        }
        usuarios.forEach(usuario => {
            const row = document.createElement('tr');
            const isAdmin = usuario.role === 'ADMIN';
            row.innerHTML = `
                <td>${usuario.id}</td>
                <td>${usuario.nome || 'Sem nome'}</td>
                <td>${usuario.email || 'Sem email'}</td>
                <td>${usuario.role || 'Sem role'}</td>
                <td>
                    <select class="action-select user-role-select" data-user-id="${usuario.id}" ${isAdmin ? 'disabled title="Não é possível alterar a role do próprio admin."' : ''}>
                        <option value="USER" ${!isAdmin ? 'selected' : ''}>USER</option>
                        <option value="ADMIN" ${isAdmin ? 'selected' : ''}>ADMIN</option>
                    </select>
                </td>
            `;
            userList.appendChild(row);
        });
    };

    // --- Funções de API ---

    // Carrega TODOS os dados iniciais (Dashboard e Tabelas)
    const loadDashboardData = async () => {
        // Mostra estado inicial de carregamento
        if (statTotalPedidos) statTotalPedidos.textContent = '...';
        if (statTotalUsuarios) statTotalUsuarios.textContent = '...';
        if (statTotalProdutos) statTotalProdutos.textContent = '...';
        if (orderList) orderList.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px;">Carregando pedidos...</td></tr>';
        if (productList) productList.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 20px;">Carregando produtos...</td></tr>';
        if (userList) userList.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">Carregando usuários...</td></tr>';


        try {
            // Faz as chamadas em paralelo
            const [pedidosRes, usuariosRes, produtosRes] = await Promise.all([
                apiClient.get('/admin/pedidos'),
                apiClient.get('/admin/users'), // Busca usuários
                apiClient.get('/admin/produtos')
            ]);

            // Renderiza as tabelas com os dados recebidos
            renderPedidos(pedidosRes.data);
            renderProdutos(produtosRes.data);
            renderUsuarios(usuariosRes.data); // Renderiza usuários

            // Atualiza as estatísticas do dashboard
            if (statTotalPedidos) statTotalPedidos.textContent = pedidosRes.data.length;
            if (statTotalUsuarios) statTotalUsuarios.textContent = usuariosRes.data.length; // Atualiza contagem de usuários
            if (statTotalProdutos) statTotalProdutos.textContent = produtosRes.data.length;

        } catch (error) {
            console.error('Erro fatal ao carregar dados do admin:', error);
            // Trata erro de permissão (401 ou 403) de forma mais robusta
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                alert('Acesso negado. Sua sessão pode ter expirado ou você não tem permissão de administrador. Redirecionando para login.');
                localStorage.removeItem('jwtToken'); // Limpa token potencialmente inválido
                window.location.href = '../../login/HTML/login.html'; // Redireciona
            } else {
                // Outro tipo de erro (rede, servidor fora do ar, etc.)
                alert('Falha ao carregar dados do painel. Verifique sua conexão e tente recarregar a página.');
                // Pode exibir uma mensagem mais detalhada no painel se preferir
                 if (orderList) orderList.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px; color: var(--error-color);">Erro ao carregar pedidos.</td></tr>';
                 if (productList) productList.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 20px; color: var(--error-color);">Erro ao carregar produtos.</td></tr>';
                 if (userList) userList.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px; color: var(--error-color);">Erro ao carregar usuários.</td></tr>';
            }
        }
    };

    // Atualiza a Role de um Usuário via API
    const updateUserRole = async (userId, newRole) => {
        if (!userId || !newRole) {
             console.error("ID do usuário ou nova role ausente para atualização.");
             alert("Erro interno ao tentar atualizar permissão.");
             return; 
        }
        
        // Confirmação (opcional, mas recomendado)
        // if (!confirm(`Tem certeza que deseja alterar a permissão do usuário ${userId} para ${newRole}?`)) {
        //     // Restaura o valor visualmente se cancelado
        //     const selectEl = userList.querySelector(`select[data-user-id="${userId}"]`);
        //      if (selectEl) {
        //          const originalRole = newRole === 'ADMIN' ? 'USER' : 'ADMIN'; 
        //          selectEl.value = originalRole; 
        //      }
        //     return;
        // }

        console.log(`Tentando atualizar usuário ${userId} para role ${newRole}`); // Log para debug
        try {
            await apiClient.put(`/admin/users/${userId}/role`, { role: newRole });
            alert(`Permissão do usuário ${userId} atualizada para ${newRole} com sucesso!`);
            // Recarrega apenas a lista de usuários para performance, se desejado
            // Ou recarrega tudo:
            // loadDashboardData(); 
        } catch (error) {
            console.error(`Erro ao atualizar permissão para usuário ${userId}:`, error);
            alert(`Falha ao atualizar permissão para ${newRole}. Verifique o console.`);
            // Desfaz a mudança visual no select em caso de erro
             const selectEl = userList.querySelector(`select[data-user-id="${userId}"]`);
             if (selectEl) {
                 const originalRole = newRole === 'ADMIN' ? 'USER' : 'ADMIN'; 
                 selectEl.value = originalRole; 
             }
        }
    };

    // --- Funções do Modal de Detalhes do Pedido ---

    // Adiciona listener DELEGADO ao tbody da tabela de pedidos
    const addDetailButtonListeners = () => {
        if (!orderList) return;
        // Escuta cliques no tbody inteiro
        orderList.addEventListener('click', (e) => {
            // Verifica se o elemento clicado (ou um pai próximo) é o botão de detalhes
            const button = e.target.closest('.view-details-btn'); 
            if (button) {
                const pedidoId = button.dataset.id; 
                if (pedidoId) {
                    openOrderDetailModal(pedidoId); // Abre o modal se achou o ID
                } else {
                     console.error("Botão de detalhes clicado, mas sem data-id.");
                }
            }
        });
    };

    // Abre o modal e busca os dados do pedido via API
    const openOrderDetailModal = async (pedidoId) => {
        if (!orderDetailModal || !modalPedidoId || !modalContent) {
             console.error("Elementos do modal de detalhes não encontrados.");
             return;
        }
        
        // Mostra o modal e overlay
        orderDetailModal.style.display = 'flex'; 
        setTimeout(() => orderDetailModal.classList.add('show'), 10); 
        
        modalPedidoId.textContent = pedidoId; // Atualiza o título do modal
        // Define estado de carregamento
        modalContent.innerHTML = `<div class="modal-loading"><i class="fas fa-spinner fa-spin"></i> Carregando detalhes...</div>`;

        try {
            // Chama o endpoint GET /api/admin/pedidos/{id}
            const response = await apiClient.get(`/admin/pedidos/${pedidoId}`);
            // Renderiza os detalhes se a chamada for bem-sucedida
            renderPedidoDetails(response.data); 
        } catch (error) {
            console.error(`Erro ao buscar detalhes do pedido #${pedidoId}:`, error);
            let errorMsg = 'Erro ao carregar os detalhes do pedido.';
             if (error.response && error.response.status === 404) {
                 errorMsg = `Pedido #${pedidoId} não encontrado.`;
             } else if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                 errorMsg = 'Sessão expirada ou permissão negada.';
                 // Poderia redirecionar para login aqui também
             }
            modalContent.innerHTML = `<div class="modal-loading" style="color: var(--error-color);">${errorMsg}</div>`;
        }
    };

    // Fecha o modal de detalhes
    const closeOrderDetailModal = () => {
        if (!orderDetailModal) return;
        orderDetailModal.classList.remove('show'); 
        // Esconde o elemento após a animação de saída
        setTimeout(() => {
            orderDetailModal.style.display = 'none'; 
            modalContent.innerHTML = ''; // Limpa o conteúdo anterior
        }, 300); // Tempo da animação (deve bater com o CSS)
    };

    // Renderiza o HTML interno do modal com os detalhes do pedido
    const renderPedidoDetails = (pedido) => {
        if (!modalContent || !pedido) {
            modalContent.innerHTML = `<div class="modal-loading" style="color: var(--error-color);">Falha ao processar detalhes do pedido.</div>`;
            return;
        }

        // Formata o endereço (com verificação se existe)
        const endereco = pedido.enderecoDeEntrega;
        const enderecoCompleto = endereco 
            ? `${endereco.rua || ''}, ${endereco.numero || ''} ${endereco.complemento || ''} - ${endereco.cidade || ''}/${endereco.estado || ''} - CEP: ${endereco.cep || ''}`
            : 'Endereço não informado';
        
        // Gera o HTML do corpo do modal
        modalContent.innerHTML = `
            <div class="detail-section">
                <h3>Destinatário & Entrega</h3>
                <div class="detail-grid">
                    <div class="detail-group">
                        <div class="detail-item"><label>Nome Destinatário</label><span>${pedido.nomeDestinatario || 'Não informado'}</span></div>
                        <div class="detail-item"><label>CPF Destinatário</label><span>${pedido.cpfDestinatario || 'Não informado'}</span></div>
                        <div class="detail-item"><label>Telefone Destinatário</label><span>${pedido.telefoneDestinatario || 'Não informado'}</span></div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-item"><label>Cliente (Comprador)</label><span>${pedido.usuario?.nome || 'N/A'} (${pedido.usuario?.email || 'N/A'})</span></div>
                        <div class="detail-item"><label>Endereço de Entrega</label><span>${enderecoCompleto}</span></div>
                        <div class="detail-item"><label>Observações</label><span>${pedido.observacoes || 'Nenhuma'}</span></div>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3>Itens do Pedido (${pedido.itens?.length || 0})</h3>
                ${(pedido.itens && pedido.itens.length > 0) ? `
                <div class="table-container">
                    <table class="modal-items-table">
                        <thead>
                            <tr><th>Produto</th><th>Tamanho</th><th>Qtd.</th><th>Preço Unit.</th><th>Subtotal</th></tr>
                        </thead>
                        <tbody>
                            ${pedido.itens.map(item => {
                                const produto = item.produto;
                                // Constrói URL da imagem com fallback
                                const imgUrl = produto?.imagemUrl 
                                    ? (produto.imagemUrl.startsWith('http') ? produto.imagemUrl : `https://api.japauniverse.com.br/${produto.imagemUrl}`) 
                                    : '../../assets/images/placeholder-product.jpg'; // Caminho relativo ao admin.html
                                return `
                                <tr>
                                    <td class="item-name-cell">
                                        <img src="${imgUrl}" alt="${produto?.nome || 'Produto'}">
                                        <span>${produto?.nome || 'Produto Removido'}</span>
                                    </td>
                                    <td>${item.tamanho || 'N/A'}</td>
                                    <td>${item.quantidade || 0}</td>
                                    <td>${formatCurrency(item.precoUnitario)}</td>
                                    <td>${formatCurrency((item.precoUnitario || 0) * (item.quantidade || 0))}</td>
                                </tr>
                            `}).join('')}
                        </tbody>
                    </table>
                </div>
                ` : '<p style="color: var(--text-secondary); text-align: center;">Nenhum item encontrado neste pedido.</p>'}
            </div>

            <div class="detail-section">
                <h3>Financeiro & Status</h3>
                <div class="detail-grid">
                    <div class="detail-group">
                        <div class="detail-item"><label>Status</label><span><span class="status-badge status-${pedido.status || 'DESCONHECIDO'}">${pedido.status || 'N/A'}</span></span></div>
                        <div class="detail-item"><label>Data do Pedido</label><span>${formatDateTime(pedido.dataPedido)}</span></div>
                         <div class="detail-item"><label>Valor Total</label><span style="font-size: 1.2rem; font-weight: 700; color: var(--primary);">${formatCurrency(pedido.valorTotal)}</span></div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-item"><label>Código PIX (Copia e Cola)</label><span style="font-size: 0.9rem; word-break: break-all; max-height: 100px; overflow-y: auto;">${pedido.pixCopiaECola || 'Não gerado ou não aplicável'}</span></div>
                        </div>
                </div>
            </div>
        `;
    };

    // --- Inicialização ---

    // Adiciona listeners para fechar o modal (Botão X, clique fora, ESC)
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeOrderDetailModal);
    }
    if (orderDetailModal) {
        orderDetailModal.addEventListener('click', (e) => {
            if (e.target === orderDetailModal) { // Fecha só se clicar no overlay
                closeOrderDetailModal();
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && orderDetailModal.classList.contains('show')) {
                closeOrderDetailModal();
            }
        });
    }

    // Adiciona listener DELEGADO para os selects de role na tabela de usuários
    if (userList) {
        userList.addEventListener('change', (e) => {
            if (e.target.classList.contains('user-role-select') && !e.target.disabled) {
                const userId = e.target.dataset.userId;
                const newRole = e.target.value;
                updateUserRole(userId, newRole); 
            }
        });
    }
    
    // Adiciona listener DELEGADO para os botões de detalhes na tabela de pedidos
    addDetailButtonListeners(); 

    // Carrega os dados do dashboard assim que o DOM estiver pronto
    loadDashboardData();
    
    // --- Lógica Adicional (Ex: Modal de Produto - Mantida do seu código) ---
    const productModal = document.getElementById('productModal');
    const closeProductModalBtn = document.getElementById('closeProductModal');
    const cancelProductFormBtn = document.getElementById('cancelProductForm');
    const addProductBtn = document.getElementById('add-product-btn');
    const productForm = document.getElementById('productForm');
    const productModalTitle = document.getElementById('productModalTitle');
    const productImagePreview = document.getElementById('productImagePreview');
    const productImageInput = document.getElementById('productImage');

     const marcaSelect = document.getElementById('productBrand');
     const categoriaSelect = document.getElementById('productCategory');
     
     // Função para popular selects (Marcas/Categorias)
     const populateSelect = async (selectElement, apiUrl, nameField) => {
         try {
             const response = await apiClient.get(apiUrl);
             selectElement.innerHTML = '<option value="">Selecione...</option>'; // Limpa e adiciona placeholder
             response.data.forEach(item => {
                 const option = document.createElement('option');
                 option.value = item.id;
                 option.textContent = item[nameField];
                 selectElement.appendChild(option);
             });
         } catch (error) {
             console.error(`Erro ao carregar ${nameField}s:`, error);
             selectElement.innerHTML = '<option value="">Erro ao carregar</option>';
         }
     };

     // Carrega Marcas e Categorias ao inicializar
     populateSelect(marcaSelect, '/produtos/marcas', 'nome');
     populateSelect(categoriaSelect, '/produtos/categorias', 'nome');


     // Abre o modal de produto (Adicionar)
     if (addProductBtn) {
         addProductBtn.addEventListener('click', () => {
             productForm.reset(); // Limpa o formulário
             document.getElementById('productId').value = ''; // Garante que ID está vazio
             productModalTitle.textContent = 'Adicionar Novo Produto';
             productImagePreview.style.display = 'none'; // Esconde preview
             productImagePreview.src = '#';
             if (productModal) {
                 productModal.style.display = 'flex';
                 setTimeout(() => productModal.classList.add('show'), 10);
             }
         });
     }

     // Fecha o modal de produto
     const closeProductModal = () => {
         if (productModal) {
             productModal.classList.remove('show');
             setTimeout(() => productModal.style.display = 'none', 300);
         }
     };
     if (closeProductModalBtn) closeProductModalBtn.addEventListener('click', closeProductModal);
     if (cancelProductFormBtn) cancelProductFormBtn.addEventListener('click', closeProductModal);
     if (productModal) {
         productModal.addEventListener('click', (e) => {
             if (e.target === productModal) closeProductModal();
         });
     }
     
     // Preview da imagem
     if (productImageInput && productImagePreview) {
         productImageInput.addEventListener('change', (event) => {
             const file = event.target.files[0];
             if (file) {
                 const reader = new FileReader();
                 reader.onload = (e) => {
                     productImagePreview.src = e.target.result;
                     productImagePreview.style.display = 'block';
                 }
                 reader.readAsDataURL(file);
             } else {
                 productImagePreview.style.display = 'none';
                 productImagePreview.src = '#';
             }
         });
     }

     // Submissão do formulário de produto (Adicionar/Editar)
     if (productForm) {
         productForm.addEventListener('submit', async (e) => {
             e.preventDefault();
             const productId = document.getElementById('productId').value;
             const isEditing = !!productId;

             // Monta o objeto 'produto' com dados do formulário
             const produto = {
                 nome: document.getElementById('productName').value,
                 marca: { id: parseInt(document.getElementById('productBrand').value) }, // Envia objeto com ID
                 categoria: { id: parseInt(document.getElementById('productCategory').value) }, // Envia objeto com ID
                 estoque: parseInt(document.getElementById('productStock').value),
                 preco: parseFloat(document.getElementById('productPrice').value),
                 descricao: document.getElementById('productDescription').value
             };
             
             // Cria FormData para enviar produto (JSON) e imagem (arquivo)
             const formData = new FormData();
             formData.append('produto', JSON.stringify(produto)); 
             
             const imagemFile = document.getElementById('productImage').files[0];
             if (imagemFile) {
                 formData.append('imagem', imagemFile);
             }

             try {
                 let response;
                 if (isEditing) {
                     // Requisição PUT para editar
                     response = await apiClient.put(`/admin/produtos/${productId}`, formData, {
                         headers: { 'Content-Type': 'multipart/form-data' }
                     });
                     alert('Produto atualizado com sucesso!');
                 } else {
                     // Requisição POST para adicionar
                     response = await apiClient.post('/admin/produtos', formData, {
                         headers: { 'Content-Type': 'multipart/form-data' }
                     });
                     alert('Produto adicionado com sucesso!');
                 }
                 closeProductModal(); // Fecha o modal
                 loadDashboardData(); // Recarrega os dados para mostrar a mudança
             } catch (error) {
                 console.error('Erro ao salvar produto:', error);
                 alert('Erro ao salvar produto. Verifique os dados e tente novamente.');
             }
         });
     }
     
     // Lógica para Editar Produto (abre modal com dados preenchidos)
     if (productList) {
         productList.addEventListener('click', async (e) => {
             const editButton = e.target.closest('.edit-product-btn');
             if (editButton) {
                 const productId = editButton.dataset.id;
                 try {
                     // Busca os dados completos do produto específico
                     // Usaremos o endpoint público GET /api/produtos/{id}
                     const response = await apiClient.get(`/produtos/${productId}`); 
                     const produto = response.data;

                     // Preenche o formulário no modal
                     document.getElementById('productId').value = produto.id;
                     document.getElementById('productName').value = produto.nome || '';
                     document.getElementById('productBrand').value = produto.marca?.id || '';
                     document.getElementById('productCategory').value = produto.categoria?.id || '';
                     document.getElementById('productStock').value = produto.estoque || 0;
                     document.getElementById('productPrice').value = produto.preco || '';
                     document.getElementById('productDescription').value = produto.descricao || '';
                     
                     // Mostra preview da imagem existente
                     if (produto.imagemUrl) {
                        const imgUrl = produto.imagemUrl.startsWith('http') ? produto.imagemUrl : `https://api.japauniverse.com.br/${produto.imagemUrl}`;
                         productImagePreview.src = imgUrl;
                         productImagePreview.style.display = 'block';
                     } else {
                         productImagePreview.style.display = 'none';
                         productImagePreview.src = '#';
                     }
                     
                     productImageInput.value = ''; // Limpa seleção de arquivo anterior

                     // Abre o modal para edição
                     productModalTitle.textContent = 'Editar Produto';
                     if (productModal) {
                         productModal.style.display = 'flex';
                         setTimeout(() => productModal.classList.add('show'), 10);
                     }

                 } catch (error) {
                     console.error(`Erro ao carregar produto ${productId} para edição:`, error);
                     alert('Erro ao carregar dados do produto para edição.');
                 }
             }
             
             // Lógica para Excluir Produto
             const deleteButton = e.target.closest('.delete-product-btn');
             if (deleteButton) {
                 const productId = deleteButton.dataset.id;
                 if (confirm(`Tem certeza que deseja excluir o produto ID ${productId}? Esta ação não pode ser desfeita.`)) {
                     try {
                         await apiClient.delete(`/admin/produtos/${productId}`);
                         alert(`Produto ID ${productId} excluído com sucesso.`);
                         loadDashboardData(); // Recarrega a lista
                     } catch (error) {
                         console.error(`Erro ao excluir produto ${productId}:`, error);
                         alert('Erro ao excluir produto.');
                     }
                 }
             }
         });
     }

}); // Fim do DOMContentLoaded