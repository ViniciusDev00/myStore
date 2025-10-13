package com.store.BACK.controller;

import com.store.BACK.model.Pedido;
import com.store.BACK.model.Usuario;
import com.store.BACK.service.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/usuario")
public class UsuarioController {

    @Autowired
    private PedidoService pedidoService;

    @GetMapping("/meus-dados")
    public ResponseEntity<Usuario> getMeusDados(@AuthenticationPrincipal Usuario usuarioLogado) {
        return ResponseEntity.ok(usuarioLogado);
    }

    @GetMapping("/meus-pedidos")
    public ResponseEntity<List<Pedido>> getMeusPedidos(@AuthenticationPrincipal Usuario usuarioLogado) {
        List<Pedido> pedidos = pedidoService.buscarPorUsuario(usuarioLogado.getId());
        return ResponseEntity.ok(pedidos);
    }
}
