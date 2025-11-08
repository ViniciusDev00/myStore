package com.store.BACK.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.store.BACK.model.PedidoAviso;

@Repository
public interface PedidoAvisoRepository extends JpaRepository<PedidoAviso, Long> {
    List<PedidoAviso> findByPedidoIdOrderByDataAvisoDesc(Long pedidoId);
}
