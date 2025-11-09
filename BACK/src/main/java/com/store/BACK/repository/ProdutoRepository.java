package com.store.BACK.repository;

import com.store.BACK.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    @Query("SELECT p FROM Produto p WHERE " +
            "(:nome IS NULL OR lower(p.nome) LIKE lower(concat('%', :nome, '%'))) AND " +
            "(:marcaId IS NULL OR p.marca.id = :marcaId) AND " + // Adicionar AND
            "(:categoriaId IS NULL OR p.categoria.id = :categoriaId)") // Nova linha
    List<Produto> findWithFilters(@Param("nome") String nome,
                                  @Param("marcaId") Long marcaId,
                                  @Param("categoriaId") Long categoriaId); // Novo parâmetro

    @Query("SELECT SUM(p.estoque) FROM Produto p")
    Optional<Long> sumEstoque();
}