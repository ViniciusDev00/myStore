package com.store.BACK.repository;

import com.store.BACK.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    // Consulta correta para forçar o carregamento de Pedido -> Itens -> Produto
    @Query("SELECT p FROM Pedido p JOIN FETCH p.itens i JOIN FETCH i.produto WHERE p.usuario.id = :usuarioId")
    List<Pedido> findByUsuarioId(@Param("usuarioId") Long usuarioId);
}