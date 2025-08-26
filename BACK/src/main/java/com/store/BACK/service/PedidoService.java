package com.store.BACK.service;

import com.store.BACK.model.Pedido;
import com.store.BACK.repository.PedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    /**
     * Busca todos os pedidos associados a um ID de usuário específico.
     * @param usuarioId O ID do usuário para o qual os pedidos serão buscados.
     * @return Uma lista de pedidos do usuário.
     */
    public List<Pedido> buscarPorUsuario(Long usuarioId) {
        // Utiliza o método já existente no PedidoRepository
        return pedidoRepository.findByUsuarioId(usuarioId);
    }

    // Futuramente, você pode adicionar outros métodos aqui, como:
    // - criarPedido(Pedido novoPedido)
    // - cancelarPedido(Long pedidoId)
    // - buscarDetalhesPedido(Long pedidoId)
}