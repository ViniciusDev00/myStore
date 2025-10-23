package com.store.BACK.dto;

import com.store.BACK.model.Endereco;
import com.store.BACK.model.Pedido;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UsuarioDTO {
    private Long id;
    private String nome;
    private String email;
    private String role;

    // --- CORREÇÃO APLICADA AQUI ---
    // Adicionamos os campos que faltavam para endereços e pedidos.
    private List<Endereco> enderecos;
    private List<Pedido> pedidos;
}
