package com.store.BACK.service;

import com.store.BACK.model.Contato;
import com.store.BACK.model.Pedido;
import com.store.BACK.model.Produto;
import com.store.BACK.repository.ContatoRepository;
import com.store.BACK.repository.PedidoRepository;
import com.store.BACK.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final PedidoRepository pedidoRepository;
    private final ProdutoRepository produtoRepository;
    private final FileStorageService fileStorageService;
    private final ContatoRepository contatoRepository; // Dependência adicionada

    public List<Pedido> listarTodosOsPedidos() {
        return pedidoRepository.findAll();
    }

    public List<Produto> listarTodosOsProdutos() {
        return produtoRepository.findAll();
    }

    // Novo método para buscar todas as mensagens de contato
    public List<Contato> listarTodasAsMensagens() {
        return contatoRepository.findAll();
    }

    @Transactional
    public Pedido atualizarStatusPedido(Long pedidoId, String status) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
        pedido.setStatus(status);
        return pedidoRepository.save(pedido);
    }

    @Transactional
    public Produto adicionarProduto(Produto produto, MultipartFile imagemFile) {
        if (imagemFile != null && !imagemFile.isEmpty()) {
            String imagemUrl = fileStorageService.store(imagemFile);
            produto.setImagemUrl(imagemUrl);
        }
        return produtoRepository.save(produto);
    }

    @Transactional
    public Produto atualizarProduto(Long id, Produto produtoDetails, MultipartFile imagemFile) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        if (imagemFile != null && !imagemFile.isEmpty()) {
            String imagemUrl = fileStorageService.store(imagemFile);
            produto.setImagemUrl(imagemUrl);
        }

        produto.setNome(produtoDetails.getNome());
        produto.setDescricao(produtoDetails.getDescricao());
        produto.setPreco(produtoDetails.getPreco());
        produto.setPrecoOriginal(produtoDetails.getPrecoOriginal());
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