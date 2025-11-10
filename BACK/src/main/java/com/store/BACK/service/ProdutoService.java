package com.store.BACK.service;

import com.store.BACK.model.Produto;
import com.store.BACK.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Sort; // NOVO IMPORT NECESSÁRIO

import java.util.List;
import java.util.Optional;

@Service
public class ProdutoService {

    @Autowired
    private ProdutoRepository produtoRepository;

    // ALTERAÇÃO: Adicionado o parâmetro 'ordenacao'
    public List<Produto> buscarProdutosFiltrados(String nome, Long marcaId, Long categoriaId, String ordenacao) {
        
        // Lógica de conversão da string de ordenação para objeto Sort do Spring Data JPA
        Sort sort = Sort.unsorted();
        if ("price-asc".equals(ordenacao)) {
            // Ordena por preço crescente
            sort = Sort.by(Sort.Direction.ASC, "preco");
        } else if ("price-desc".equals(ordenacao)) {
            // Ordena por preço decrescente. Adicionamos "nome" como critério secundário para desempate.
            sort = Sort.by(Sort.Direction.DESC, "preco").and(Sort.by(Sort.Direction.ASC, "nome"));
        }

        // ALTERAÇÃO CRÍTICA: Chamada ao repositório agora inclui o objeto Sort.
        // **IMPORTANTE:** Certifique-se de que o seu ProdutoRepository.findWithFilters foi atualizado para aceitar o parâmetro Sort.
        return produtoRepository.findWithFilters(nome, marcaId, categoriaId, sort);
    }

    public Optional<Produto> buscarPorId(Long id) {
        return produtoRepository.findById(id);
    }
}
