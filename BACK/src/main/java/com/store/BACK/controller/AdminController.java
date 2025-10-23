package com.store.BACK.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.store.BACK.model.Contato;
import com.store.BACK.model.Pedido;
import com.store.BACK.model.Produto;
import com.store.BACK.model.Usuario; // Import necessário
import com.store.BACK.service.AdminService;
import com.store.BACK.service.PedidoService; // Import necessário
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired; // Import necessário
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor // Mantém o construtor gerado por Lombok
public class AdminController {

    // Injeções via construtor (Lombok)
    private final AdminService adminService;
    private final ObjectMapper objectMapper;

    // Injeção via @Autowired (para PedidoService, como feito antes)
    @Autowired
    private PedidoService pedidoService;

    // --- Endpoint Contatos ---
    @GetMapping("/contatos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Contato>> getAllContatos() {
        // Usa o método correto do AdminService
        return ResponseEntity.ok(adminService.listarTodasAsMensagens()); //
    }

    // --- Endpoints Pedidos ---
    @GetMapping("/pedidos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Pedido>> getAllPedidos() {
        // Usa o método correto do AdminService
        return ResponseEntity.ok(adminService.listarTodosOsPedidos()); //
    }

    @PatchMapping("/pedidos/{pedidoId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Pedido> updatePedidoStatus(@PathVariable Long pedidoId, @RequestBody Map<String, String> statusUpdate) {
        String status = statusUpdate.get("status");
        // Usa o método correto do AdminService
        return ResponseEntity.ok(adminService.atualizarStatusPedido(pedidoId, status)); //
    }

    // Endpoint para buscar detalhes do pedido (Usa PedidoService)
    @GetMapping("/pedidos/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Pedido> getPedidoDetails(@PathVariable Long id) {
        // Usa o método correto do PedidoService (que foi adicionado para esta funcionalidade)
        Pedido pedido = pedidoService.getPedidoDetailsById(id); //
        if (pedido == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(pedido);
    }

    // --- Endpoints Produtos ---
    @GetMapping("/produtos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Produto>> getAllProdutos() {
        // Usa o método correto do AdminService
        return ResponseEntity.ok(adminService.listarTodosOsProdutos()); //
    }

    @PostMapping("/produtos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Produto> createProduto(
            @RequestParam("produto") String produtoJson,
            @RequestParam(value = "imagem", required = false) MultipartFile imagemFile) throws IOException {
        Produto produto = objectMapper.readValue(produtoJson, Produto.class);
        // Usa o método correto do AdminService
        Produto produtoSalvo = adminService.adicionarProduto(produto, imagemFile); //
        return ResponseEntity.ok(produtoSalvo);
    }

    @PutMapping("/produtos/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Produto> updateProduto(
            @PathVariable Long id,
            @RequestParam("produto") String produtoJson,
            @RequestParam(value = "imagem", required = false) MultipartFile imagemFile) throws IOException {
        Produto produtoDetails = objectMapper.readValue(produtoJson, Produto.class);
        // Usa o método correto do AdminService
        Produto produtoAtualizado = adminService.atualizarProduto(id, produtoDetails, imagemFile); //
        return ResponseEntity.ok(produtoAtualizado);
    }

    @DeleteMapping("/produtos/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduto(@PathVariable Long id) {
        // Usa o método correto do AdminService
        adminService.deletarProduto(id); //
        return ResponseEntity.noContent().build();
    }

    // --- Endpoints Usuários ---
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Usuario>> getAllUsers() {
        // *** VERIFICADO: Usa findAllUsers() que existe no AdminService ***
        return ResponseEntity.ok(adminService.findAllUsers()); //
    }

    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Usuario> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> roleMap) {
        try {
            String role = roleMap.get("role");
            // *** VERIFICADO: Usa updateUserRoleById() que existe no AdminService ***
            Usuario updatedUser = adminService.updateUserRoleById(id, role); //
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            System.err.println("Erro ao atualizar role do usuário ID " + id + ": " + e.getMessage());
            return ResponseEntity.badRequest().build(); // Retorna badRequest em caso de erro interno
        }
    }
}