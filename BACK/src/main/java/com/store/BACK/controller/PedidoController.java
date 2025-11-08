package com.store.BACK.controller;

import com.store.BACK.dto.CheckoutRequestDTO; // MODIFICADO: Importa o DTO correto
import com.store.BACK.model.Pedido;
import com.store.BACK.model.Usuario;
import com.store.BACK.service.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos") // A rota base para todos os endpoints de pedido
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    /**
     * Endpoint para criar um novo pedido.
     * Recebe o DTO de checkout que inclui a lista de itens E o ID do endereço.
     */
    @PostMapping
    // MODIFICADO: Receber CheckoutRequestDTO
    public ResponseEntity<Pedido> criarPedido(@RequestBody CheckoutRequestDTO checkoutRequest, @AuthenticationPrincipal Usuario usuarioLogado) {
        // Validação para garantir que o usuário está logado
        if (usuarioLogado == null) {
            return ResponseEntity.status(403).build(); // Retorna "Forbidden" se não houver usuário
        }

        // --- MODIFICADO: Passa o DTO inteiro ---
        Pedido novoPedido = pedidoService.criarPedido(checkoutRequest, usuarioLogado);
        // --- FIM MODIFICAÇÃO ---

        return ResponseEntity.ok(novoPedido);
    }

    // --- NOVO: Endpoint para buscar todos os pedidos do usuário logado ---
    /**
     * Endpoint para buscar todos os pedidos do usuário logado.
     */
    @GetMapping // Mapeia para GET /api/pedidos
    public ResponseEntity<List<Pedido>> getPedidosDoUsuario(@AuthenticationPrincipal Usuario usuarioLogado) {
        if (usuarioLogado == null) {
            return ResponseEntity.status(403).build();
        }
        // Utiliza o ID do usuário logado para buscar os pedidos
        List<Pedido> pedidos = pedidoService.getPedidosByUsuarioId(usuarioLogado.getId());

        return ResponseEntity.ok(pedidos);
    }
    // --- FIM NOVO ---

    /**
     * Endpoint para buscar um pedido específico pelo seu ID.
     * Esta funcionalidade foi restaurada.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Pedido> getPedidoById(@PathVariable Long id) {
        Pedido pedido = pedidoService.getPedidoById(id);
        if (pedido != null) {
            return ResponseEntity.ok(pedido);
        }
        // Retorna "Not Found" se o pedido não existir
        return ResponseEntity.notFound().build();
    }
}