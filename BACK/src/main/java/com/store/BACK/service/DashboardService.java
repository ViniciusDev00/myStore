// Localização: .../BACK/src/main/java/com/store/BACK/service/DashboardService.java

package com.store.BACK.service;

import com.store.BACK.dto.CheckoutRequestDTO;
import com.store.BACK.dto.DashboardStatsDTO;
import com.store.BACK.dto.TopProdutoVendidoDTO; // Import NOVO
import com.store.BACK.dto.ClienteStatusDTO;   // Import NOVO
import com.store.BACK.model.Pedido;
import com.store.BACK.model.Usuario;
import com.store.BACK.repository.PedidoRepository;
import com.store.BACK.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;

    // --- MÉTODOS EXISTENTES (Exemplo) ---

    public DashboardStatsDTO getDashboardStatistics() {
        // ... (Seu código existente aqui)

        // Exemplo Mock: Substitua pela sua lógica real
        long totalPedidos = 150;
        long totalUsuarios = 100;
        BigDecimal receitaTotal = BigDecimal.valueOf(25000.75);
        long pedidosPendentes = 10;

        return new DashboardStatsDTO(totalPedidos, totalUsuarios, receitaTotal, pedidosPendentes);
    }

    public List<Object[]> getSalesOverTime() {
        // ... (Seu código existente aqui)

        // Exemplo Mock: Substitua pela sua lógica real de PedidoRepository
        return Arrays.asList(
                new Object[]{LocalDate.now().minusDays(3), BigDecimal.valueOf(120.50)},
                new Object[]{LocalDate.now().minusDays(2), BigDecimal.valueOf(500.00)},
                new Object[]{LocalDate.now().minusDays(1), BigDecimal.valueOf(300.25)},
                new Object[]{LocalDate.now(), BigDecimal.valueOf(450.99)}
        );
    }

    public List<Object[]> getOrderStatusDistribution() {
        // ... (Seu código existente aqui)

        // Exemplo Mock: Substitua pela sua lógica real de PedidoRepository
        return Arrays.asList(
                new Object[]{"PAGO", 80L},
                new Object[]{"PENDENTE", 10L},
                new Object[]{"ENVIADO", 5L},
                new Object[]{"CANCELADO", 5L}
        );
    }

    // --- NOVOS MÉTODOS ---

    /**
     * NOVO DASHBOARD 1: Busca o top 5 de produtos mais vendidos por quantidade.
     * @return Lista de TopProdutoVendidoDTO.
     */
    public List<TopProdutoVendidoDTO> getTopVendidos() {
        // !!! SUBSTITUA A LÓGICA ABAIXO POR SUA CONSULTA JPA/SQL REAL !!!

        // Exemplo Mock (para testar o Front-end)
        return Arrays.asList(
                new TopProdutoVendidoDTO("Tênis Drift Black", 150L),
                new TopProdutoVendidoDTO("Camisa Dry-Fit", 90L),
                new TopProdutoVendidoDTO("Meia Esportiva", 75L),
                new TopProdutoVendidoDTO("Boné Trucker", 50L),
                new TopProdutoVendidoDTO("Pulseira Fitness", 30L)
        );
    }

    /**
     * NOVO DASHBOARD 2: Busca a distribuição de clientes por status/role.
     * @return Lista de ClienteStatusDTO.
     */
    public List<ClienteStatusDTO> getDistribuicaoClientes() {
        // !!! SUBSTITUA A LÓGICA ABAIXO POR SUA CONSULTA JPA/SQL REAL !!!

        // Exemplo Mock (para testar o Front-end)
        // Se você não tiver um campo 'status', pode usar o 'role' como fizemos:
        return Arrays.asList(
                new ClienteStatusDTO("ROLE_USER", 80L),
                new ClienteStatusDTO("ROLE_ADMIN", 5L),
                new ClienteStatusDTO("INATIVO", 15L) // Exemplo de status
        );
    }
}