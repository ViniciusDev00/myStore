package com.store.BACK.dto;

import com.store.BACK.model.Usuario;

public class UsuarioDTO {
    private Long id;
    private String nome;
    private String email;
    private String role;

    public UsuarioDTO() {
        // construtor padrão
    }

    public UsuarioDTO(Usuario usuario) {
        this.id = usuario.getId();
        this.nome = usuario.getNome();
        this.email = usuario.getEmail();
        this.role = usuario.getRole();
    }

    // Getters
    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getEmail() { return email; }
    public String getRole() { return role; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setNome(String nome) { this.nome = nome; }
    public void setEmail(String email) { this.email = email; }
    public void setRole(String role) { this.role = role; }
}