package com.store.BACK.service;

import com.store.BACK.model.Pedido;
import com.store.BACK.model.Produto;
import com.store.BACK.repository.PedidoRepository;
import com.store.BACK.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final PedidoRepository pedidoRepository;
    private final ProdutoRepository produtoRepository;

    public List<Pedido> listarTodosOsPedidos() {
        return pedidoRepository.findAll();
    }

    @Transactional
    public Pedido atualizarStatusPedido(Long pedidoId, String status) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
        pedido.setStatus(status);
        return pedidoRepository.save(pedido);
    }

    @Transactional
    public Produto adicionarProduto(Produto produto) {
        return produtoRepository.save(produto);
    }

    @Transactional
    public Produto atualizarProduto(Long id, Produto produtoDetails) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
        produto.setNome(produtoDetails.getNome());
        produto.setDescricao(produtoDetails.getDescricao());
        produto.setPreco(produtoDetails.getPreco());
        produto.setPrecoOriginal(produtoDetails.getPrecoOriginal());
        produto.setImagemUrl(produtoDetails.getImagemUrl());
        produto.setEstoque(produtoDetails.getEstoque());
        produto.setMarca(produtoDetails.getMarca());
        produto.setCategoria(produtoDetails.getCategoria());
        return produtoRepository.save(produto);
    }

    @Transactional
    public void deletarProduto(Long id) {
        produtoRepository.deleteById(id);
    }
}