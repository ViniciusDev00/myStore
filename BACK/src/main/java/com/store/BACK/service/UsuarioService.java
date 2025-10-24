package com.store.BACK.service;

import com.store.BACK.dto.UsuarioDTO;
import com.store.BACK.model.Usuario;
import com.store.BACK.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsuarioService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Implementação UserDetailsService para o Spring Security
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado com o e-mail: " + email));
    }

    @Transactional
    public UsuarioDTO registrarUsuario(Usuario usuario) {
        if (usuarioRepository.findByEmail(usuario.getEmail()).isPresent()) {
            throw new RuntimeException("Email já registrado.");
        }

        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        // Define a role padrão
        usuario.setRole("ROLE_USER"); 

        Usuario novoUsuario = usuarioRepository.save(usuario);
        return convertToDTO(novoUsuario);
    }

    @Transactional(readOnly = true)
    public UsuarioDTO getDadosUsuario(Usuario usuarioLogado) {
        // Busca o usuário completo do banco (Lazy loading se necessário)
        Usuario usuario = usuarioRepository.findById(usuarioLogado.getId())
            .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));

        return convertToDTO(usuario);
    }

    // Método auxiliar para conversão de Entidade para DTO (Adaptado para sua estrutura)
    private UsuarioDTO convertToDTO(Usuario usuario) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(usuario.getId());
        dto.setNome(usuario.getNome());
        dto.setEmail(usuario.getEmail());
        dto.setRole(usuario.getRole());
        
        // Trata Lazy Loading se as listas forem necessárias no DTO
        if (usuario.getEnderecos() != null) {
            dto.setEnderecos(usuario.getEnderecos().stream().collect(Collectors.toList()));
        }
        if (usuario.getPedidos() != null) {
            dto.setPedidos(usuario.getPedidos().stream().collect(Collectors.toList()));
        }

        return dto;
    }
}