document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        window.location.href = '../../login/HTML/login.html';
        return;
    }

    // Configuração do Axios
    const apiClient = axios.create({
        baseURL: 'https://api.japauniverse.com.br/api',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    // Elementos da UI
    const tabs = document.querySelectorAll('.nav-tab');
    const contents = document.querySelectorAll('.tab-content');

    // Elementos das Listas
    const orderList = document.getElementById('admin-order-list');
    const productList = document.getElementById('admin-product-list');
    const userList = document.getElementById('admin-user-list');

    // Elementos das Estatísticas
    const statTotalPedidos = document.getElementById('stat-total-pedidos');
    const statTotalUsuarios = document.getElementById('stat-total-usuarios');
    const statTotalProdutos = document.getElementById('stat-total-produtos');

    // --- NOVO: Elementos do Modal ---
    const orderDetailModal = document.getElementById('orderDetailModal');
    const closeModalBtn = document.getElementById('closeOrderDetailModal');
    const modalContent = document.getElementById('modalOrderDetailContent');
    const modalPedidoId = document.getElementById('modal-pedido-id');
    // --- FIM Elementos do Modal ---

    // Navegação por Abas
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });

    // --- FUNÇÕES DE RENDERIZAÇÃO ---

    // Renderiza Pedidos
    const renderPedidos = (pedidos) => {
        if (!orderList) return;
        orderList.innerHTML = ''; // Limpa a lista
        if (!pedidos || pedidos.length === 0) {
            orderList.innerHTML = '<tr><td colspan="6">Nenhum pedido encontrado.</td></tr>';
            return;
        }

        pedidos.sort((a, b) => b.id - a.id); // Ordena por ID mais recente

        pedidos.forEach(pedido => {
            const row = document.createElement('tr');
            // Formata data e valor
            const dataFormatada = pedido.dataPedido ? new Date(pedido.dataPedido).toLocaleDateString('pt-BR') : 'N/A';
            const valorFormatado = pedido.valorTotal ? `R$ ${pedido.valorTotal.toFixed(2).replace('.', ',')}` : 'R$ 0,00';

            row.innerHTML = `
                <td>#${pedido.id}</td>
                <td>${dataFormatada}</td>
                <td>${pedido.usuario?.nome || 'Usuário Deletado'}</td>
                <td>${valorFormatado}</td>
                <td><span class="status-badge status-${pedido.status}">${pedido.status}</span></td>
                <td>
                    <button class="btn-secondary btn-sm view-details-btn" data-id="${pedido.id}">
                        <i class="fas fa-eye"></i> Detalhes
                    </button>
                </td>
            `;
            orderList.appendChild(row);
        });

        // *** NOVO: Adiciona listener aos botões de detalhes após renderizar ***
        addDetailButtonListeners();
    };

    // Renderiza Produtos (sem alteração)
    const renderProdutos = (produtos) => {
        if (!productList) return;
        productList.innerHTML = '';
        if (!produtos || produtos.length === 0) {
            productList.innerHTML = '<tr><td colspan="6">Nenhum produto encontrado.</td></tr>';
            return;
        }
        produtos.forEach(produto => {
            const row = document.createElement('tr');
             const precoFormatado = produto.preco ? `R$ ${produto.preco.toFixed(2).replace('.', ',')}` : 'R$ 0,00';
            row.innerHTML = `
                <td>${produto.id}</td>
                <td>${produto.nome || 'Sem nome'}</td>
                <td>${produto.marca?.nome || 'Sem marca'}</td>
                <td>${produto.estoque || 0}</td>
                <td>${precoFormatado}</td>
                <td><button class="btn btn-secondary btn-sm">Editar</button></td>
            `;
            productList.appendChild(row);
        });
    };

    // Renderiza Usuários (sem alteração)
    const renderUsuarios = (usuarios) => {
        if (!userList) return;
        userList.innerHTML = '';
        if (!usuarios || usuarios.length === 0) {
            userList.innerHTML = '<tr><td colspan="5">Nenhum usuário encontrado.</td></tr>';
            return;
        }
        usuarios.forEach(usuario => {
            const row = document.createElement('tr');
            const isAdmin = usuario.role === 'ADMIN';
            row.innerHTML = `
                <td>${usuario.id}</td>
                <td>${usuario.nome || 'Sem nome'}</td>
                <td>${usuario.email}</td>
                <td>${usuario.role}</td>
                <td>
                    <select class="action-select" data-user-id="${usuario.id}" ${isAdmin ? 'disabled' : ''}>
                        <option value="USER" ${!isAdmin ? 'selected' : ''}>USER</option>
                        <option value="ADMIN" ${isAdmin ? 'selected' : ''}>ADMIN</option>
                    </select>
                </td>
            `;
            userList.appendChild(row);
        });

        // Adiciona listeners aos selects de role
        userList.querySelectorAll('.action-select').forEach(select => {
             // Remove listener antigo se houver (para evitar duplicação em recargas)
            select.replaceWith(select.cloneNode(true));
        });
         userList.querySelectorAll('.action-select').forEach(select => { // Seleciona os novos nós
            if (!select.disabled) { // Só adiciona se não estiver desabilitado
                select.addEventListener('change', (e) => {
                    const userId = e.target.dataset.userId;
                    const newRole = e.target.value;
                    updateUserRole(userId, newRole);
                });
            }
        });
    };

    // --- FUNÇÕES DE API ---

    // Carrega todos os dados do dashboard
    const loadDashboardData = async () => {
        try {
            // Faz as chamadas em paralelo
            const [pedidosRes, usuariosRes, produtosRes] = await Promise.all([
                apiClient.get('/admin/pedidos'),
                apiClient.get('/admin/users'),
                apiClient.get('/admin/produtos')
            ]);

            // Renderiza as tabelas com os dados recebidos
            renderPedidos(pedidosRes.data);
            renderProdutos(produtosRes.data);
            renderUsuarios(usuariosRes.data);

            // Atualiza as estatísticas
            if (statTotalPedidos) statTotalPedidos.textContent = pedidosRes.data.length;
            if (statTotalUsuarios) statTotalUsuarios.textContent = usuariosRes.data.length;
            if (statTotalProdutos) statTotalProdutos.textContent = produtosRes.data.length;

        } catch (error) {
            console.error('Erro ao carregar dados do admin:', error);
            // Trata erro de autenticação ou autorização
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                alert('Sessão expirada ou acesso negado. Faça login como administrador.');
                localStorage.removeItem('jwtToken'); // Limpa token inválido
                window.location.href = '../../login/HTML/login.html'; // Redireciona para login
            } else {
                // Outro erro de rede ou servidor
                alert('Erro ao carregar dados do painel. Verifique a conexão ou tente mais tarde.');
            }
        }
    };

    // Atualiza Role do Usuário (sem alteração)
    const updateUserRole = async (userId, newRole) => {
        if (!userId || !newRole) return; // Segurança básica
        try {
            await apiClient.put(`/admin/users/${userId}/role`, { role: newRole });
            alert('Permissão do usuário atualizada com sucesso!');
            loadDashboardData(); // Recarrega os dados para refletir a mudança
        } catch (error) {
            console.error('Erro ao atualizar permissão:', error);
            alert('Falha ao atualizar permissão. Verifique o console para mais detalhes.');
        }
    };

    // --- NOVO: FUNÇÕES DO MODAL DE DETALHES ---

    // Adiciona listeners aos botões "Ver Detalhes" (chamado após renderPedidos)
    const addDetailButtonListeners = () => {
        // Garante que só adicionamos listeners uma vez ou que eles funcionem após recarga
        orderList.addEventListener('click', (e) => {
            const button = e.target.closest('.view-details-btn');
            if (button) {
                const pedidoId = button.dataset.id;
                openOrderDetailModal(pedidoId);
            }
        });
    };

    // Abre o modal e busca os dados do pedido
    const openOrderDetailModal = async (pedidoId) => {
        if (!orderDetailModal || !modalPedidoId || !modalContent) return; // Verifica se elementos existem

        // Mostra o modal e o overlay
        orderDetailModal.style.display = 'flex'; // Torna o overlay visível
        setTimeout(() => orderDetailModal.classList.add('show'), 10); // Adiciona classe para animar entrada

        modalPedidoId.textContent = pedidoId; // Atualiza o ID no título
        // Mostra o estado de carregamento
        modalContent.innerHTML = `<div class="modal-loading"><i class="fas fa-spinner fa-spin"></i> Carregando detalhes do pedido...</div>`;

        try {
            // Chama o NOVO endpoint do AdminController para buscar detalhes
            const response = await apiClient.get(`/admin/pedidos/${pedidoId}`);
            renderPedidoDetails(response.data); // Renderiza os detalhes recebidos
        } catch (error) {
            console.error(`Erro ao buscar detalhes do pedido #${pedidoId}:`, error);
            // Mostra mensagem de erro no modal
            modalContent.innerHTML = `<div class="modal-loading" style="color: var(--error-color);">Erro ao carregar detalhes. Tente novamente.</div>`;
        }
    };

    // Fecha o modal
    const closeOrderDetailModal = () => {
        if (!orderDetailModal) return;
        orderDetailModal.classList.remove('show'); // Remove classe para animar saída
        // Esconde o overlay após a animação
        setTimeout(() => {
            orderDetailModal.style.display = 'none'; 
            modalContent.innerHTML = ''; // Limpa o conteúdo
        }, 300); // Deve ser igual à duração da transição CSS
    };

    // Renderiza o conteúdo HTML do modal com os detalhes do pedido
    const renderPedidoDetails = (pedido) => {
        if (!modalContent || !pedido) return; // Segurança

        // Formata o endereço completo
        const endereco = pedido.enderecoDeEntrega;
        const enderecoCompleto = endereco 
            ? `${endereco.rua}, ${endereco.numero} ${endereco.complemento || ''} - ${endereco.cidade}/${endereco.estado} - CEP: ${endereco.cep}`
            : 'Endereço não disponível';

        // Formata os valores monetários
        const formatCurrency = (value) => value ? `R$ ${value.toFixed(2).replace('.', ',')}` : 'R$ 0,00';

        // Monta o HTML do corpo do modal
        modalContent.innerHTML = `
            <div class="detail-section">
                <h3>Destinatário & Entrega</h3>
                <div class="detail-grid">
                    <div class="detail-group">
                        <div class="detail-item">
                            <label>Nome Destinatário</label>
                            <span>${pedido.nomeDestinatario || 'Não informado'}</span>
                        </div>
                        <div class="detail-item">
                            <label>CPF Destinatário</label>
                            <span>${pedido.cpfDestinatario || 'Não informado'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Telefone Destinatário</label>
                            <span>${pedido.telefoneDestinatario || 'Não informado'}</span>
                        </div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-item">
                            <label>Cliente (Comprador)</label>
                            <span>${pedido.usuario?.nome || 'Usuário não encontrado'} (${pedido.usuario?.email || 'N/A'})</span>
                        </div>
                        <div class="detail-item">
                            <label>Endereço de Entrega</label>
                            <span>${enderecoCompleto}</span>
                        </div>
                        <div class="detail-item">
                            <label>Observações</label>
                            <span>${pedido.observacoes || 'Nenhuma'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3>Itens do Pedido (${pedido.itens?.length || 0})</h3>
                ${(pedido.itens && pedido.itens.length > 0) ? `
                <table class="modal-items-table">
                    <thead>
                        <tr>
                            <th>Produto</th>
                            <th>Tamanho</th>
                            <th>Qtd.</th>
                            <th>Preço Unit.</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pedido.itens.map(item => {
                            const produto = item.produto;
                            const imgUrl = produto?.imagemUrl 
                                ? (produto.imagemUrl.startsWith('http') ? produto.imagemUrl : `https://api.japauniverse.com.br/${produto.imagemUrl}`) 
                                : '../../FRONT/assets/images/placeholder-product.jpg'; // Placeholder
                            return `
                            <tr>
                                <td class="item-name-cell">
                                    <img src="${imgUrl}" alt="${produto?.nome || 'Produto'}">
                                    <span>${produto?.nome || 'Produto não encontrado'}</span>
                                </td>
                                <td>${item.tamanho || 'N/A'}</td>
                                <td>${item.quantidade}</td>
                                <td>${formatCurrency(item.precoUnitario)}</td>
                                <td>${formatCurrency(item.precoUnitario * item.quantidade)}</td>
                            </tr>
                        `}).join('')}
                    </tbody>
                </table>
                ` : '<p>Nenhum item encontrado neste pedido.</p>'}
            </div>

            <div class="detail-section">
                <h3>Financeiro</h3>
                <div class="detail-grid">
                    <div class="detail-group">
                        <div class="detail-item">
                            <label>Status</label>
                            <span><span class="status-badge status-${pedido.status}">${pedido.status}</span></span>
                        </div>
                         <div class="detail-item">
                            <label>Data do Pedido</label>
                            <span>${pedido.dataPedido ? new Date(pedido.dataPedido).toLocaleString('pt-BR') : 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Valor Total</label>
                            <span style="font-size: 1.2rem; font-weight: 700; color: var(--primary);">${formatCurrency(pedido.valorTotal)}</span>
                        </div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-item">
                            <label>Código PIX (Copia e Cola)</label>
                            <span style="font-size: 0.9rem; word-break: break-all;">${pedido.pixCopiaECola || 'Não gerado ou não aplicável'}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };

    // --- FIM FUNÇÕES DO MODAL ---

    // Inicialização dos listeners do modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeOrderDetailModal);
    }
    if (orderDetailModal) {
        // Fecha se clicar fora (no overlay)
        orderDetailModal.addEventListener('click', (e) => {
            if (e.target === orderDetailModal) {
                closeOrderDetailModal();
            }
        });
         // Fecha com a tecla ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && orderDetailModal.classList.contains('show')) {
                closeOrderDetailModal();
            }
        });
    }

    // Carrega os dados iniciais do dashboard ao entrar na página
    loadDashboardData();
});