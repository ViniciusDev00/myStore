package com.store.BACK.repository;

import com.store.BACK.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    List<Pedido> findByUsuarioId(Long usuarioId);

    // --- NOVO MÉTODO ADICIONADO ---
    /**
     * Busca um pedido pelo ID e carrega "eagerly" (antecipadamente) todas as
     * associações necessárias para exibir os detalhes completos no admin.
     * Usa LEFT JOIN FETCH para garantir que funcione mesmo se alguma associação for nula (embora não deva ser).
     */
    @Query("SELECT p FROM Pedido p " +
           "LEFT JOIN FETCH p.usuario u " +
           "LEFT JOIN FETCH p.enderecoDeEntrega e " +
           "LEFT JOIN FETCH p.itens i " +
           "LEFT JOIN FETCH i.produto prod " +
           "WHERE p.id = :id")
    Optional<Pedido> findByIdWithDetails(@Param("id") Long id);
    // --- FIM DO NOVO MÉTODO ---
}