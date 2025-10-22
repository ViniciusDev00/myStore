package com.store.BACK.controller;

import com.store.BACK.model.Pedido;
import com.store.BACK.model.Produto;
import com.store.BACK.model.Usuario;
import com.store.BACK.service.AdminService;
import com.store.BACK.service.PedidoService; // NOVO: Importa PedidoService
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    // --- NOVA INJEÇÃO DE DEPENDÊNCIA ---
    @Autowired
    private PedidoService pedidoService;
    // --- FIM NOVA INJEÇÃO ---

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Usuario>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/pedidos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Pedido>> getAllPedidos() {
        return ResponseEntity.ok(adminService.getAllPedidos());
    }

    @GetMapping("/produtos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Produto>> getAllProdutos() {
        return ResponseEntity.ok(adminService.getAllProdutos());
    }

    // --- NOVO ENDPOINT ADICIONADO ---
    /**
     * Busca os detalhes completos de um pedido específico.
     * Protegido para acesso exclusivo do ADMIN.
     */
    @GetMapping("/pedidos/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Pedido> getPedidoDetails(@PathVariable Long id) {
        Pedido pedido = pedidoService.getPedidoDetailsById(id);
        if (pedido == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(pedido);
    }
    // --- FIM NOVO ENDPOINT ---

    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Usuario> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> roleMap) {
        try {
            String role = roleMap.get("role");
            Usuario updatedUser = adminService.updateUserRole(id, role);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}