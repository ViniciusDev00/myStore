package com.store.BACK.controller;

import com.store.BACK.model.Pedido;
import com.store.BACK.model.Produto;
import com.store.BACK.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

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
    @PostMapping("/produtos")
    public ResponseEntity<Produto> createProduto(@RequestBody Produto produto) {
        return ResponseEntity.ok(adminService.adicionarProduto(produto));
    }

    @PutMapping("/produtos/{id}")
    public ResponseEntity<Produto> updateProduto(@PathVariable Long id, @RequestBody Produto produto) {
        return ResponseEntity.ok(adminService.atualizarProduto(id, produto));
    }

    @DeleteMapping("/produtos/{id}")
    public ResponseEntity<Void> deleteProduto(@PathVariable Long id) {
        adminService.deletarProduto(id);
        return ResponseEntity.noContent().build();
    }
}