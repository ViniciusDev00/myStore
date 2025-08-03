package com.store.BACK.controller;

import com.store.BACK.model.Produto;
import com.store.BACK.service.ProdutoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/produtos")
@CrossOrigin(origins = "*")
public class ProdutoController {

    @Autowired
    private ProdutoService produtoService;

    @GetMapping
    public List<Produto> listarProdutos(
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) Long marcaId,
            @RequestParam(required = false, defaultValue = "default") String ordenacao) {

        List<Produto> produtos = produtoService.buscarProdutosFiltrados(nome, marcaId);

        if ("price-asc".equals(ordenacao)) {
            produtos.sort(Comparator.comparing(Produto::getPreco));
        } else if ("price-desc".equals(ordenacao)) {
            produtos.sort(Comparator.comparing(Produto::getPreco).reversed());
        }

        return produtos;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Produto> getProdutoById(@PathVariable Long id) {
        return produtoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}