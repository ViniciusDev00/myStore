package com.store.BACK.service;

import com.store.BACK.dto.UsuarioDTO;
import com.store.BACK.model.Usuario;
import com.store.BACK.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Service
public class UsuarioService implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return usuarioRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado com o email: " + username));
    }

    @Transactional(readOnly = true)
    public UsuarioDTO getDadosUsuario(Usuario usuarioLogado) {
        // Re-busca o usuário dentro de uma transação para garantir que a sessão esteja aberta
        Usuario usuario = usuarioRepository.findById(usuarioLogado.getId())
            .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));

        // Agora, podemos acessar as coleções lazy com segurança
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(usuario.getId());
        dto.setNome(usuario.getNome());
        dto.setEmail(usuario.getEmail());
        
        // Inicializa as coleções antes de colocá-las no DTO
        dto.setEnderecos(new ArrayList<>(usuario.getEnderecos()));
        dto.setPedidos(new ArrayList<>(usuario.getPedidos()));

        return dto;
    }
}