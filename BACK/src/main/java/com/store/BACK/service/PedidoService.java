package com.store.BACK.service;

import com.store.BACK.dto.ItemPedidoDTO;
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

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private ProdutoRepository produtoRepository;
    
    @Autowired
    private EmailService emailService;

    @Transactional
    public Pedido criarPedido(List<ItemPedidoDTO> itensDTO, Usuario usuario) {
        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);
        pedido.setDataPedido(LocalDateTime.now());
        pedido.setStatus("PENDENTE");

        List<ItemPedido> itensPedido = new ArrayList<>();
        BigDecimal valorTotal = BigDecimal.ZERO;

        for (ItemPedidoDTO itemDTO : itensDTO) {
            Produto produto = produtoRepository.findById(itemDTO.getProdutoId())
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado: " + itemDTO.getProdutoId()));

            ItemPedido itemPedido = new ItemPedido();
            itemPedido.setPedido(pedido);
            itemPedido.setProduto(produto);
            itemPedido.setQuantidade(itemDTO.getQuantidade());
            itemPedido.setTamanho(itemDTO.getTamanho());
            itemPedido.setPrecoUnitario(produto.getPreco());

            itensPedido.add(itemPedido);
            valorTotal = valorTotal.add(produto.getPreco().multiply(BigDecimal.valueOf(itemDTO.getQuantidade())));
        }

        pedido.setItens(itensPedido);
        pedido.setValorTotal(valorTotal);
        
        Pedido pedidoSalvo = pedidoRepository.save(pedido);
        
        // Enviar e-mail de confirmação
        emailService.enviarConfirmacaoDePedido(usuario, pedidoSalvo);

        return pedidoSalvo;
    }
    
    public List<Pedido> getPedidosByUsuarioId(Long usuarioId){
        return pedidoRepository.findByUsuarioId(usuarioId);
    }

    public Pedido getPedidoById(Long id) {
        return pedidoRepository.findById(id).orElse(null);
    }
}
