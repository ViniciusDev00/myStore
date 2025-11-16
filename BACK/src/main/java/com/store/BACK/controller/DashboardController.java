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
    public ResponseEntity<List<Map<String, Object>>> getSalesOverTime() {
        // Não é mais necessário o cast ou supressão, pois o Service faz a conversão.
        return ResponseEntity.ok(dashboardService.getSalesOverTime());
    }

    @GetMapping("/order-status-distribution")
    public ResponseEntity<Map<String, Long>> getOrderStatusDistribution() {
        // Não é mais necessário o cast ou supressão.
        return ResponseEntity.ok(dashboardService.getOrderStatusDistribution());
    }
}