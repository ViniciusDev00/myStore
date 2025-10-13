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
import org.springframework.transaction.annotation.Transactional; // Importe a anotação Transactional

import java.util.stream.Collectors; // Importe Collectors

@Service
public class UsuarioService implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado com o e-mail: " + email));
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

    // --- MÉTODO NOVO E CORRIGIDO ADICIONADO AQUI ---
    @Transactional(readOnly = true)
    public UsuarioDTO getDadosUsuario(Usuario usuarioLogado) {
        Usuario usuario = usuarioRepository.findById(usuarioLogado.getId())
            .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));

        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(usuario.getId());
        dto.setNome(usuario.getNome());
        dto.setEmail(usuario.getEmail());
        dto.setRole(usuario.getRole());
        
        // Inicializa as coleções "preguiçosas" dentro da transação
        dto.setEnderecos(usuario.getEnderecos().stream().collect(Collectors.toList()));
        dto.setPedidos(usuario.getPedidos().stream().collect(Collectors.toList()));

        return dto;
    }
    // --- FIM DA ADIÇÃO ---

    private UsuarioDTO convertToDTO(Usuario usuario) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(usuario.getId());
        dto.setNome(usuario.getNome());
        dto.setEmail(usuario.getEmail());
        dto.setRole(usuario.getRole());
        return dto;
    }
}
