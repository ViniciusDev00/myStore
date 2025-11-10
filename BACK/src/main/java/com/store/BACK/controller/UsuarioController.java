package com.store.BACK.controller;

import com.store.BACK.dto.UsuarioDTO;
import com.store.BACK.model.Pedido;
import com.store.BACK.model.Usuario;
import com.store.BACK.service.PedidoService;
import com.store.BACK.service.UsuarioService;
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

    @Autowired
    private UsuarioService usuarioService;

    @GetMapping("/meus-dados")
    public ResponseEntity<UsuarioDTO> getMeusDados(@AuthenticationPrincipal Usuario usuarioLogado) {
        UsuarioDTO usuarioDTO = usuarioService.getDadosUsuario(usuarioLogado);
        return ResponseEntity.ok(usuarioDTO);
    }

    @GetMapping("/meus-pedidos")
    public ResponseEntity<List<Pedido>> getMeusPedidos(@AuthenticationPrincipal Usuario usuarioLogado) {
        // --- CORREÇÃO APLICADA AQUI ---
        List<Pedido> pedidos = pedidoService.getPedidosByUsuarioId(usuarioLogado.getId());
        return ResponseEntity.ok(pedidos);
    }
}