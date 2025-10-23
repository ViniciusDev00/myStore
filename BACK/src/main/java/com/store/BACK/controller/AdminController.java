package com.store.BACK.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.store.BACK.model.Contato;
import com.store.BACK.model.Pedido;
import com.store.BACK.model.Produto;
import com.store.BACK.model.Usuario; // Adicionado import
import com.store.BACK.service.AdminService;
import com.store.BACK.service.PedidoService; // Adicionado import
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired; // Adicionado import
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final ObjectMapper objectMapper; 

    // Injeção do PedidoService para buscar detalhes
    @Autowired 
    private PedidoService pedidoService;

    // --- Endpoints Mantidos (Contatos, Produtos) ---
    @GetMapping("/contatos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Contato>> getAllContatos() {
        return ResponseEntity.ok(adminService.listarTodasAsMensagens()); // Método do seu AdminService
    }

    @GetMapping("/produtos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Produto>> getAllProdutos() {
        return ResponseEntity.ok(adminService.listarTodosOsProdutos()); // Método do seu AdminService
    }

    @PostMapping("/produtos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Produto> createProduto(
            @RequestParam("produto") String produtoJson,
            @RequestParam(value = "imagem", required = false) MultipartFile imagemFile) throws IOException {
        Produto produto = objectMapper.readValue(produtoJson, Produto.class);
        Produto produtoSalvo = adminService.adicionarProduto(produto, imagemFile); // Método do seu AdminService
        return ResponseEntity.ok(produtoSalvo);
    }

    @PutMapping("/produtos/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Produto> updateProduto(
            @PathVariable Long id,
            @RequestParam("produto") String produtoJson,
            @RequestParam(value = "imagem", required = false) MultipartFile imagemFile) throws IOException {
        Produto produtoDetails = objectMapper.readValue(produtoJson, Produto.class);
        Produto produtoAtualizado = adminService.atualizarProduto(id, produtoDetails, imagemFile); // Método do seu AdminService
        return ResponseEntity.ok(produtoAtualizado);
    }

    @DeleteMapping("/produtos/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduto(@PathVariable Long id) {
        adminService.deletarProduto(id); // Método do seu AdminService
        return ResponseEntity.noContent().build();
    }

    // --- Endpoints de Pedidos (Atualizados/Verificados) ---
    @GetMapping("/pedidos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Pedido>> getAllPedidos() {
        return ResponseEntity.ok(adminService.listarTodosOsPedidos()); // Método do seu AdminService
    }

    @PatchMapping("/pedidos/{pedidoId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Pedido> updatePedidoStatus(@PathVariable Long pedidoId, @RequestBody Map<String, String> statusUpdate) {
        String status = statusUpdate.get("status");
        return ResponseEntity.ok(adminService.atualizarStatusPedido(pedidoId, status)); // Método do seu AdminService
    }

    // Endpoint para buscar detalhes de um pedido específico
    @GetMapping("/pedidos/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Pedido> getPedidoDetails(@PathVariable Long id) {
        Pedido pedido = pedidoService.getPedidoDetailsById(id); // Usa PedidoService
        if (pedido == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(pedido);
    }

    // --- Endpoints de Usuários (Verificados/Corrigidos) ---
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Usuario>> getAllUsers() {
        return ResponseEntity.ok(adminService.findAllUsers()); // Método do seu AdminService
    }

    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Usuario> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> roleMap) {
        try {
            String role = roleMap.get("role");
            Usuario updatedUser = adminService.updateUserRoleById(id, role); // Método do seu AdminService
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            System.err.println("Erro ao atualizar role do usuário ID " + id + ": " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}