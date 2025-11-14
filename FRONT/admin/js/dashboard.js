document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('jwtToken');
    const apiUrl = 'http://localhost:8080';

    const apiClient = axios.create({
        baseURL: `${apiUrl}/api/admin/dashboard`,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    // Variáveis para armazenar as instâncias dos gráficos
    let salesChartInstance = null;
    let statusChartInstance = null;
    
    const CHART_COLORS = [
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 99, 132, 0.7)',
        'rgba(153, 102, 255, 0.7)',
    ];

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
            // Em caso de erro (ex: token inválido, 401/403), o ideal é redirecionar para o login
        }
    };

    const renderSalesChart = (data) => {
        const ctx = document.getElementById('sales-over-time-chart').getContext('2d');
        const labels = data.map(item => new Date(item.date).toLocaleDateString());
        const totals = data.map(item => item.total);

        if (salesChartInstance) {
            // Se o gráfico já existe, apenas atualiza os dados
            salesChartInstance.data.labels = labels;
            salesChartInstance.data.datasets[0].data = totals;
            salesChartInstance.update();
        } else {
            // Inicializa o gráfico na primeira vez
            salesChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Vendas por Dia',
                        data: totals,
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
                    },
                    // Desabilita animação para atualizações rápidas
                    animation: false 
                }
            });
        }
    };

    const renderStatusChart = (data) => {
        const ctx = document.getElementById('order-status-chart').getContext('2d');
        const labels = Object.keys(data);
        const values = Object.values(data);

        if (statusChartInstance) {
            // Se o gráfico já existe, apenas atualiza os dados
            statusChartInstance.data.labels = labels;
            statusChartInstance.data.datasets[0].data = values;
            statusChartInstance.data.datasets[0].backgroundColor = CHART_COLORS.slice(0, labels.length);
            statusChartInstance.update();
        } else {
            // Inicializa o gráfico na primeira vez
            statusChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Status de Pedidos',
                        data: values,
                        backgroundColor: CHART_COLORS.slice(0, labels.length),
                    }]
                },
                options: {
                    responsive: true,
                    // Desabilita animação para atualizações rápidas
                    animation: false
                }
            });
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
    
    // Função para atualizar todo o dashboard
    const updateDashboard = () => {
        fetchDashboardStats();
        fetchChartData();
    };

    // Chamada inicial para carregar os dados
    updateDashboard();

    // Configura a atualização a cada 5 segundos para simular o tempo real
    setInterval(updateDashboard, 5000); 
});