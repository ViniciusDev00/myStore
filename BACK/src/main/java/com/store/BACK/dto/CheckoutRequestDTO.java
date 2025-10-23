// BACK/src/main/java/com/store/BACK/dto/CheckoutRequestDTO.java
package com.store.BACK.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class CheckoutRequestDTO {
    private List<ItemPedidoDTO> itens;
    private Long enderecoEntregaId; // Campo para receber o ID do endereço
}