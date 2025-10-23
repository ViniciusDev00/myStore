package com.store.BACK.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ItemPedidoDTO {
    private Long produtoId;
    private int quantidade;
    private String tamanho;
}
