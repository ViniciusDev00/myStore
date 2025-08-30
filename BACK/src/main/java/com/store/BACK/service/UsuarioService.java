package com.store.BACK.service;

import com.store.BACK.dto.UsuarioDTO;
import com.store.BACK.model.Usuario;
import com.store.BACK.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        System.out.println("\n--- DENTRO DE loadUserByUsername ---");
        System.out.println("Procurando utilizador com o email: " + email);

        return usuarioRepository.findByEmail(email)
                .map(usuario -> {
                    System.out.println(">>> SUCESSO: Utilizador encontrado na base de dados: " + usuario.getUsername());
                    System.out.println(">>> Permissões do utilizador: " + usuario.getAuthorities());
                    return usuario;
                })
                .orElseThrow(() -> {
                    System.out.println("!!! FALHA: Utilizador não foi encontrado na base de dados com o email: " + email);
                    return new UsernameNotFoundException("Usuário não encontrado com o e-mail: " + email);
                });
    }

    public UsuarioDTO registrarUsuario(Usuario usuario) {
        if (usuarioRepository.findByEmail(usuario.getEmail()).isPresent()) {
            throw new RuntimeException("Email já registrado.");
        }

        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        usuario.setRole("ROLE_USER");

        Usuario novoUsuario = usuarioRepository.save(usuario);
        return convertToDTO(novoUsuario);
    }

    private UsuarioDTO convertToDTO(Usuario usuario) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(usuario.getId());
        dto.setNome(usuario.getNome());
        dto.setEmail(usuario.getEmail());
        dto.setRole(usuario.getRole());
        return dto;
    }
}