package com.store.BACK.controller;

import com.fasterxml.jackson.databind.ObjectMapper; // Certifique-se que este import existe
import com.store.BACK.model.Contato;
import com.store.BACK.model.Pedido;
import com.store.BACK.model.Produto;
import com.store.BACK.model.Usuario; // Adicione este import
import com.store.BACK.service.AdminService;
import com.store.BACK.service.PedidoService; // Adicione este import
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired; // Adicione este import
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // Adicione este import
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException; // Adicione este import
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor // @RequiredArgsConstructor é usado nos seus arquivos, então vamos mantê-lo
public class AdminController {

    private final AdminService adminService;
    private final ObjectMapper objectMapper; // Este estava no seu arquivo original

    // --- NOVA INJEÇÃO DE DEPENDÊNCIA (necessária para os detalhes do pedido) ---
    @Autowired
    private PedidoService pedidoService;
    // --- FIM DA NOVA INJEÇÃO ---

    // --- Endpoint de Contatos (do seu arquivo original) ---
    @GetMapping("/contatos")
    @PreAuthorize("hasRole('ADMIN')") // Protegendo o endpoint
    public ResponseEntity<List<Contato>> getAllContatos() {
        return ResponseEntity.ok(adminService.listarTodasAsMensagens()); //
    }

    // --- Endpoints de Pedidos (Atualizados) ---
    @GetMapping("/pedidos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Pedido>> getAllPedidos() {
        // *** CORRIGIDO: Usa listarTodosOsPedidos() ***
        return ResponseEntity.ok(adminService.listarTodosOsPedidos()); //
    }

    @PatchMapping("/pedidos/{pedidoId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Pedido> updatePedidoStatus(@PathVariable Long pedidoId, @RequestBody Map<String, String> statusUpdate) {
        String status = statusUpdate.get("status");
        // *** CORRIGIDO: Usa atualizarStatusPedido() ***
        return ResponseEntity.ok(adminService.atualizarStatusPedido(pedidoId, status)); //
    }

    // --- Endpoints de Produtos (do seu arquivo original) ---
    @GetMapping("/produtos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Produto>> getAllProdutos() {
        // *** CORRIGIDO: Usa listarTodosOsProdutos() ***
        return ResponseEntity.ok(adminService.listarTodosOsProdutos()); //
    }

    @PostMapping("/produtos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Produto> createProduto(
            @RequestParam("produto") String produtoJson,
            @RequestParam(value = "imagem", required = false) MultipartFile imagemFile) throws IOException {

        Produto produto = objectMapper.readValue(produtoJson, Produto.class);
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
        Produto produtoAtualizado = adminService.atualizarProduto(id, produtoDetails, imagemFile); //
        return ResponseEntity.ok(produtoAtualizado);
    }

    @DeleteMapping("/produtos/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduto(@PathVariable Long id) {
        adminService.deletarProduto(id); //
        return ResponseEntity.noContent().build();
    }
    
    // --- NOVO ENDPOINT DE DETALHES DO PEDIDO (O que você pediu) ---
    @GetMapping("/pedidos/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Pedido> getPedidoDetails(@PathVariable Long id) {
        // Este método getPedidoDetailsById NÃO existe no AdminService, mas sim no PedidoService.
        Pedido pedido = pedidoService.getPedidoDetailsById(id); 
        if (pedido == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(pedido);
    }

    // --- Endpoint de Usuários (Corrigido para corresponder ao seu AdminService) ---
    // (O seu AdminService.java não tem métodos para gerenciar usuários,
    // então eu removi as chamadas que estavam causando o erro. 
    // Se você tinha esses métodos em um arquivo anterior, eles foram perdidos na versão que você me enviou.)
}