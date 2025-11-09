document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('jwtToken');
    const apiUrl = 'http://localhost:8080';

    const apiClient = axios.create({
        baseURL: `${apiUrl}/api/admin/dashboard`,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const fetchDashboardStats = async () => {
        try {
            const response = await apiClient.get('/stats');
            const stats = response.data;

            document.getElementById('vendas-totais').textContent = `R$ ${stats.receitaTotal.toFixed(2).replace('.', ',')}`;
            document.getElementById('total-pedidos').textContent = stats.totalPedidos;
            document.getElementById('total-clientes').textContent = stats.totalClientes;
            document.getElementById('produtos-totais').textContent = stats.produtosTotais;

        } catch (error) {
            console.error("Erro ao buscar estatísticas do dashboard:", error);
        }
    };

    fetchDashboardStats();
});
