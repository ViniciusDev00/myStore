package com.store.BACK.dto;

// Este DTO define que para o registro, apenas nome, email e senha são necessários.
public record RegistroRequestDTO(String nome, String email, String senha) {
}
