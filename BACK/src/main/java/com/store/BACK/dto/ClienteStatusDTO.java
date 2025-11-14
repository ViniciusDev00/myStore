package com.store.BACK.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClienteStatusDTO {
    private String status; // Ex: ATIVO, INATIVO, ADMIN
    private Long count;
}