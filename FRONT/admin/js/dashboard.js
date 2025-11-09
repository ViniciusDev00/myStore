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

            document.getElementById('vendas-totais').textContent = `R$ ${stats.vendasTotais.toFixed(2).replace('.', ',')}`;
            document.getElementById('total-pedidos').textContent = stats.totalDePedidos;
            document.getElementById('total-clientes').textContent = stats.totalDeClientes;
            document.getElementById('produtos-estoque').textContent = stats.produtosEmEstoque;

        } catch (error) {
            console.error("Erro ao buscar estatísticas do dashboard:", error);
        }
    };

    fetchDashboardStats();
});
