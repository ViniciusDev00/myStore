package com.store.BACK.controller;

import com.store.BACK.dto.UsuarioDTO; // 1. IMPORTAR O DTO
import com.store.BACK.model.Pedido;
import com.store.BACK.model.Usuario;
import com.store.BACK.service.PedidoService;
import com.store.BACK.service.UsuarioService; // 2. IMPORTAR O SERVICE
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

    @Autowired // 3. INJETAR O USUARIO SERVICE
    private UsuarioService usuarioService;

    // --- MÉTODO "/meus-dados" CORRIGIDO ---
    @GetMapping("/meus-dados")
    public ResponseEntity<UsuarioDTO> getMeusDados(@AuthenticationPrincipal Usuario usuarioLogado) {
        // 4. CHAMAR O NOVO MÉTODO DO SERVICE QUE RETORNA O DTO
        UsuarioDTO usuarioDTO = usuarioService.getDadosUsuario(usuarioLogado);
        return ResponseEntity.ok(usuarioDTO);
    }

    @GetMapping("/meus-pedidos")
    public ResponseEntity<List<Pedido>> getMeusPedidos(@AuthenticationPrincipal Usuario usuarioLogado) {
        List<Pedido> pedidos = pedidoService.buscarPorUsuario(usuarioLogado.getId());
        return ResponseEntity.ok(pedidos);
    }
}
