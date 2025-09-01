package com.store.BACK.service;

import com.store.BACK.model.ItemPedido;
import com.store.BACK.model.Pedido;
import com.store.BACK.model.Produto;
import com.store.BACK.model.Usuario;
import com.store.BACK.repository.PedidoRepository;
import com.store.BACK.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    public List<Pedido> buscarPorUsuario(Long usuarioId) {
        return pedidoRepository.findByUsuarioId(usuarioId);
    }

    @Transactional
    public Pedido criarPedido(List<Map<String, Object>> cartItems, Usuario usuario) {
        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);
        pedido.setDataPedido(LocalDateTime.now());
        pedido.setStatus("PENDENTE");

        List<ItemPedido> itensDoPedido = new ArrayList<>();
        BigDecimal valorTotal = BigDecimal.ZERO;

        for (Map<String, Object> item : cartItems) {
            Long produtoId = Long.parseLong(item.get("id").toString());
            int quantidade = Integer.parseInt(item.get("quantity").toString());

            Produto produto = produtoRepository.findById(produtoId)
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado com ID: " + produtoId));

            ItemPedido itemPedido = new ItemPedido();
            itemPedido.setProduto(produto);
            itemPedido.setQuantidade(quantidade);
            itemPedido.setPrecoUnitario(produto.getPreco());
            itemPedido.setPedido(pedido);
            itensDoPedido.add(itemPedido);

            valorTotal = valorTotal.add(produto.getPreco().multiply(BigDecimal.valueOf(quantidade)));
        }

        pedido.setItens(itensDoPedido);
        pedido.setValorTotal(valorTotal);

        return pedidoRepository.save(pedido);
    }
}