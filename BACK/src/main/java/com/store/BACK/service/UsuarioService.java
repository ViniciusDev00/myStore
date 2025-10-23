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
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

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

    @Transactional // Adicione Transactional para garantir a persistência
    public UsuarioDTO registrarUsuario(Usuario usuario) {
        if (usuarioRepository.findByEmail(usuario.getEmail()).isPresent()) {
            throw new RuntimeException("Email já registrado.");
        }

        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        // --- CORREÇÃO: Usando setRole ---
        usuario.setRole("ROLE_USER");

        // Adicione CPF e Telefone se vierem do registro
        // usuario.setCpf(registroRequestDTO.cpf()); // Exemplo
        // usuario.setTelefone(registroRequestDTO.telefone()); // Exemplo

        Usuario novoUsuario = usuarioRepository.save(usuario);
        return convertToDTO(novoUsuario); // Converte para DTO após salvar
    }

    @Transactional(readOnly = true)
    public UsuarioDTO getDadosUsuario(Usuario usuarioLogado) {
        // Busca o usuário completo do banco para garantir que EAGER loading funcione se necessário
        Usuario usuario = usuarioRepository.findById(usuarioLogado.getId())
            .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado com ID: " + usuarioLogado.getId()));

        return convertToDTO(usuario); // Usa o método de conversão
    }

    // Método para converter Entidade para DTO
    private UsuarioDTO convertToDTO(Usuario usuario) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(usuario.getId());
        dto.setNome(usuario.getNome());
        dto.setEmail(usuario.getEmail());
        // --- CORREÇÃO: Usando getRole ---
        dto.setRole(usuario.getRole());

        // Carrega explicitamente se LAZY (embora getDadosUsuario agora busque EAGER se configurado)
        // Garante que a lista seja copiada para evitar problemas de sessão fechada
        if (usuario.getEnderecos() != null) {
            dto.setEnderecos(usuario.getEnderecos().stream().collect(Collectors.toList()));
        }
        if (usuario.getPedidos() != null) {
            dto.setPedidos(usuario.getPedidos().stream().collect(Collectors.toList()));
        }

        // Adicione CPF e Telefone ao DTO se precisar deles no frontend
        // dto.setCpf(usuario.getCpf());
        // dto.setTelefone(usuario.getTelefone());

        return dto;
    }
}