package com.store.BACK.service;

import com.store.BACK.model.Produto;
import com.store.BACK.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProdutoService {

    @Autowired
    private ProdutoRepository produtoRepository;

    public List<Produto> buscarProdutosFiltrados(String nome, Long marcaId) {
        return produtoRepository.findWithFilters(nome, marcaId);
    }

    public Optional<Produto> buscarPorId(Long id) {
        return produtoRepository.findById(id);
    }
}