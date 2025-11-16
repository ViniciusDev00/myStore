package com.store.BACK.service;

import com.store.BACK.repository.PedidoRepository;
import com.store.BACK.repository.ProdutoRepository;
import com.store.BACK.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.store.BACK.dto.DashboardStatsDTO;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final PedidoRepository pedidoRepository;
    private final ProdutoRepository produtoRepository;
    private final UsuarioRepository usuarioRepository;

    public DashboardStatsDTO getDashboardStatistics() {
        long totalPedidos = pedidoRepository.count();
        long totalClientes = usuarioRepository.count();
        BigDecimal receitaTotal = pedidoRepository.findTotalVendas().orElse(BigDecimal.ZERO);
        long produtosTotais = produtoRepository.countTotalProdutos();

        return new DashboardStatsDTO(totalPedidos, totalClientes, receitaTotal, produtosTotais);
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getSalesOverTime() {
        // CORREÇÃO: Cast para forçar o tipo correto
        return (List<Map<String, Object>>) pedidoRepository.findSalesOverTime();
    }

    @SuppressWarnings("unchecked")
    public Map<String, Long> getOrderStatusDistribution() {
        // CORREÇÃO: Adicionada supressão de warning. O collector já faz o cast nos objetos internos.
        return (Map<String, Long>) pedidoRepository.countByStatus().stream()
                .collect(Collectors.toMap(
                        record -> (String) record[0],
                        record -> (Long) record[1]
                ));
    }
}