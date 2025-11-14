package com.store.BACK.controller;

import com.store.BACK.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

import com.store.BACK.dto.DashboardStatsDTO;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStatistics() {
        return ResponseEntity.ok(dashboardService.getDashboardStatistics());
    }

    @GetMapping("/sales-over-time")
    @SuppressWarnings("unchecked") // Adicionado para suprimir o warning do cast
    public ResponseEntity<List<Map<String, Object>>> getSalesOverTime() {
        // CORREÇÃO: Cast para forçar a compatibilidade de tipo e resolver o erro de compilação
        return ResponseEntity.ok((List<Map<String, Object>>) dashboardService.getSalesOverTime());
    }

    @GetMapping("/order-status-distribution")
    @SuppressWarnings("unchecked") // Adicionado para suprimir o warning do cast
    public ResponseEntity<Map<String, Long>> getOrderStatusDistribution() {
        // CORREÇÃO: Cast para forçar a compatibilidade de tipo e resolver o erro de compilação
        // (Isso também corrige o erro se o serviço estiver retornando List em vez de Map)
        return ResponseEntity.ok((Map<String, Long>) dashboardService.getOrderStatusDistribution());
    }
}