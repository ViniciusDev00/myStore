package com.store.BACK.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.store.BACK.model.Contato;
import com.store.BACK.model.Pedido;
import com.store.BACK.model.Produto;
import com.store.BACK.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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

    // --- NOVO ENDPOINT PARA MENSAGENS ---
    @GetMapping("/contatos")
    public ResponseEntity<List<Contato>> getAllContatos() {
        return ResponseEntity.ok(adminService.listarTodasAsMensagens());
    }

    // Endpoints de Pedidos
    @GetMapping("/pedidos")
    public ResponseEntity<List<Pedido>> getAllPedidos() {
        return ResponseEntity.ok(adminService.listarTodosOsPedidos());
    }

    @PatchMapping("/pedidos/{pedidoId}/status")
    public ResponseEntity<Pedido> updatePedidoStatus(@PathVariable Long pedidoId, @RequestBody Map<String, String> statusUpdate) {
        String status = statusUpdate.get("status");
        return ResponseEntity.ok(adminService.atualizarStatusPedido(pedidoId, status));
    }

    // Endpoints de Produtos
    @GetMapping("/produtos")
    public ResponseEntity<List<Produto>> getAllProdutos() {
        return ResponseEntity.ok(adminService.listarTodosOsProdutos());
    }

    @PostMapping("/produtos")
    public ResponseEntity<Produto> createProduto(
            @RequestParam("produto") String produtoJson,
            @RequestParam(value = "imagem", required = false) MultipartFile imagemFile) throws IOException {

        Produto produto = objectMapper.readValue(produtoJson, Produto.class);
        Produto produtoSalvo = adminService.adicionarProduto(produto, imagemFile);
        return ResponseEntity.ok(produtoSalvo);
    }

    @PutMapping("/produtos/{id}")
    public ResponseEntity<Produto> updateProduto(
            @PathVariable Long id,
            @RequestParam("produto") String produtoJson,
            @RequestParam(value = "imagem", required = false) MultipartFile imagemFile) throws IOException {

        Produto produtoDetails = objectMapper.readValue(produtoJson, Produto.class);
        Produto produtoAtualizado = adminService.atualizarProduto(id, produtoDetails, imagemFile);
        return ResponseEntity.ok(produtoAtualizado);
    }

    @DeleteMapping("/produtos/{id}")
    public ResponseEntity<Void> deleteProduto(@PathVariable Long id) {
        adminService.deletarProduto(id);
        return ResponseEntity.noContent().build();
    }
}