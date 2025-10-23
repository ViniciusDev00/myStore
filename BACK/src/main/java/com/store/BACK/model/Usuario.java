package com.store.BACK.model;

import com.fasterxml.jackson.annotation.JsonManagedReference; // Certifique-se que é ManagedReference aqui
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.Builder; // Adicione se usar @Builder
import lombok.NoArgsConstructor; // Adicione se usar @Builder
import lombok.AllArgsConstructor; // Adicione se usar @Builder
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "tb_usuario") // Sua tabela pode ser tb_usuario ou usuarios
@Getter
@Setter
@Builder // Adicione se precisar do Builder
@NoArgsConstructor // Adicione se precisar do Builder
@AllArgsConstructor // Adicione se precisar do Builder
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, unique = true)
    private String email;

    // Adicione os campos que faltavam baseados no seu erro de build
    @Column(nullable = true, unique = true) // CPF pode ser nulo ou não, ajuste conforme necessário
    private String cpf;

    @Column(nullable = true) // Telefone pode ser nulo ou não
    private String telefone;
    // --- Fim da adição ---

    @Column(nullable = false)
    private String senha;

    // --- CORREÇÃO: Voltando para 'role' ---
    @Column(nullable = false)
    private String role = "ROLE_USER"; // Garante valor padrão
    // --- FIM DA CORREÇÃO ---

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference("usuario-enderecos") // Garante que é ManagedReference
    private List<Endereco> enderecos;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference("usuario-pedidos") // Garante que é ManagedReference
    private List<Pedido> pedidos;


    // --- MÉTODOS UserDetails ---
    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public String getPassword() {
        return senha;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // --- CORREÇÃO: Usando 'role' novamente ---
        return List.of(new SimpleGrantedAuthority(this.role));
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}