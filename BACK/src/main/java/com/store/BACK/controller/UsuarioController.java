package com.store.BACK.controller;

import com.store.BACK.model.Pedido;
import com.store.BACK.model.Usuario;
import com.store.BACK.service.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/usuario") // Nova rota base para dados do usuário logado
public class UsuarioController {

    @Autowired
    private PedidoService pedidoService;

    /**
     * Endpoint para buscar os dados do usuário atualmente autenticado.
     * A anotação @AuthenticationPrincipal injeta automaticamente o objeto do usuário
     * que fez a requisição, garantindo que ele só possa ver seus próprios dados.
     */
    @GetMapping("/meus-dados")
    public ResponseEntity<Usuario> getMeusDados(@AuthenticationPrincipal Usuario usuarioLogado) {
        // Como o Spring Security já identificou o usuário pelo token JWT,
        // podemos simplesmente retorná-lo.
        return ResponseEntity.ok(usuarioLogado);
    }

    /**
     * Endpoint para buscar a lista de pedidos do usuário atualmente autenticado.
     */
    @GetMapping("/meus-pedidos")
    public ResponseEntity<List<Pedido>> getMeusPedidos(@AuthenticationPrincipal Usuario usuarioLogado) {
        // Usamos o ID do usuário logado para buscar seus pedidos através do PedidoService.
        List<Pedido> pedidos = pedidoService.buscarPorUsuario(usuarioLogado.getId());
        return ResponseEntity.ok(pedidos);
    }
}