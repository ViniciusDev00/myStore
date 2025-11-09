package com.store.BACK.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private long totalPedidos;
    private long totalClientes;
    private BigDecimal receitaTotal;
    private long produtosTotais;
}
