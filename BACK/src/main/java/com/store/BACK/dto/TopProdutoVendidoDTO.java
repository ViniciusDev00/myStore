package com.store.BACK.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopProdutoVendidoDTO {
    private String nomeProduto;
    private Long quantidadeVendida;
}