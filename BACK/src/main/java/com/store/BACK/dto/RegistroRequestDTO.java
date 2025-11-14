package com.store.BACK.dto;

// CORREÇÃO: Adicionando 'cpf' ao DTO para ser acessível no AuthController
public record RegistroRequestDTO(String nome, String cpf, String email, String senha) {
}