package com.store.BACK.controller;

import com.store.BACK.model.Categoria;
import com.store.BACK.model.Marca;
import com.store.BACK.model.Produto;
import com.store.BACK.repository.CategoriaRepository;
import com.store.BACK.repository.MarcaRepository;
import com.store.BACK.service.ProdutoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {

    @Autowired
    private ProdutoService produtoService;

    // --- NOVAS DEPENDÊNCIAS INJETADAS ---
    @Autowired
    private MarcaRepository marcaRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;
    // --- FIM DA INJEÇÃO ---

    @GetMapping
    public List<Produto> listarProdutos(
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) Long marcaId,
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false, defaultValue = "default") String ordenacao) {

        // ALTERAÇÃO: A ordenação foi removida daqui e passada para a camada Service/Repository.
        List<Produto> produtos = produtoService.buscarProdutosFiltrados(nome, marcaId, categoriaId, ordenacao);

        return produtos;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Produto> getProdutoById(@PathVariable Long id) {
        return produtoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // --- NOVOS ENDPOINTS PÚBLICOS ADICIONADOS ---
    @GetMapping("/marcas")
    public List<Marca> listarMarcas() {
        return marcaRepository.findAll();
    }

    @GetMapping("/categorias")
    public List<Categoria> listarCategorias() {
        return categoriaRepository.findAll();
    }
    // --- FIM DA ADIÇÃO ---
}
