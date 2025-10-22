package com.store.BACK.controller;

import com.store.BACK.model.Pedido;
import com.store.BACK.model.Produto;
import com.store.BACK.model.Usuario;
import com.store.BACK.service.AdminService;
import com.store.BACK.service.PedidoService; // Importa PedidoService
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

    @Autowired
    private PedidoService pedidoService; // Injeção do PedidoService (mantida)

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Usuario>> getAllUsers() {
        // *** CORRIGIDO: Usa findAllUsers() ***
        return ResponseEntity.ok(adminService.findAllUsers());
    }

    @GetMapping("/pedidos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Pedido>> getAllPedidos() {
        // *** CORRIGIDO: Usa findAllPedidos() ***
        return ResponseEntity.ok(adminService.findAllPedidos());
    }

    @GetMapping("/produtos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Produto>> getAllProdutos() {
        // *** CORRIGIDO: Usa findAllProdutos() ***
        return ResponseEntity.ok(adminService.findAllProdutos());
    }

    /**
     * Busca os detalhes completos de um pedido específico.
     * Protegido para acesso exclusivo do ADMIN.
     * (Este método estava correto e foi mantido)
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

    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Usuario> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> roleMap) {
        try {
            String role = roleMap.get("role");
            // *** CORRIGIDO: Usa updateUserRoleById() ***
            Usuario updatedUser = adminService.updateUserRoleById(id, role);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            // Log do erro pode ser útil aqui
            System.err.println("Erro ao atualizar role do usuário ID " + id + ": " + e.getMessage());
            return ResponseEntity.badRequest().build(); // Retorna badRequest em caso de erro
        }
    }
}