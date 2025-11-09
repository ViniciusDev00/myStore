package com.store.BACK.service;

import com.store.BACK.repository.PedidoRepository;
import com.store.BACK.repository.ProdutoRepository;
import com.store.BACK.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.store.BACK.dto.DashboardStatsDTO;
import java.math.BigDecimal;

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
}
