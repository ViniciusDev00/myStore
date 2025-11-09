package com.store.BACK.service;

import com.store.BACK.repository.PedidoRepository;
import com.store.BACK.repository.ProdutoRepository;
import com.store.BACK.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final PedidoRepository pedidoRepository;
    private final ProdutoRepository produtoRepository;
    private final UsuarioRepository usuarioRepository;

    public Map<String, Object> getDashboardStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("vendasTotais", pedidoRepository.findTotalVendas().orElse(BigDecimal.ZERO));
        stats.put("totalDePedidos", pedidoRepository.count());
        stats.put("totalDeClientes", usuarioRepository.count());
        stats.put("produtosEmEstoque", produtoRepository.sumEstoque().orElse(0L));
        return stats;
    }
}
