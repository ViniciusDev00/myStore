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

    const fetchChartData = async () => {
        try {
            const [salesResponse, statusResponse] = await Promise.all([
                apiClient.get('/sales-over-time'),
                apiClient.get('/order-status-distribution')
            ]);

            renderSalesChart(salesResponse.data);
            renderStatusChart(statusResponse.data);

        } catch (error) {
            console.error("Erro ao buscar dados para os gráficos:", error);
        }
    };

    const renderSalesChart = (data) => {
        const ctx = document.getElementById('sales-over-time-chart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(item => new Date(item.date).toLocaleDateString()),
                datasets: [{
                    label: 'Vendas por Dia',
                    data: data.map(item => item.total),
                    borderColor: 'rgba(255, 159, 64, 1)',
                    backgroundColor: 'rgba(255, 159, 64, 0.2)',
                    fill: true,
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    };

    const renderStatusChart = (data) => {
        const ctx = document.getElementById('order-status-chart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(data),
                datasets: [{
                    label: 'Status de Pedidos',
                    data: Object.values(data),
                    backgroundColor: [
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                    ],
                }]
            },
            options: {
                responsive: true,
            }
        });
    };

    fetchDashboardStats();
    fetchChartData();
});
