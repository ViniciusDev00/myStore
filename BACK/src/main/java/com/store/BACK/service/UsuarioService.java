// Local: BACK/src/main/java/com/store/BACK/service/UsuarioService.java
package com.store.BACK.service;

import com.store.BACK.model.Usuario;
import com.store.BACK.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder; // NOVO IMPORT
import org.springframework.stereotype.Service;

import java.time.LocalDateTime; // NOVO IMPORT
import java.util.UUID; // NOVO IMPORT

@Service
@RequiredArgsConstructor
public class UsuarioService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder; // NOVO CAMPO
    private final EmailService emailService;     // NOVO CAMPO

    // SEU MÉTODO ORIGINAL (COPIADO DO ARQUIVO)
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado com o e-mail: " + email));
    }

    // SEU MÉTODO ORIGINAL (COPIADO DO ARQUIVO)
    public Usuario getUsuarioLogado() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            throw new RuntimeException("Nenhum usuário autenticado encontrado.");
        }
        String email = (String) authentication.getPrincipal();
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário logado não encontrado no banco de dados."));
    }

    // NOVO MÉTODO
    public void createPasswordResetToken(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com o e-mail: " + email));

        String token = UUID.randomUUID().toString();
        usuario.setPasswordResetToken(token);
        usuario.setTokenExpiryDate(LocalDateTime.now().plusHours(1)); // Token válido por 1 hora

        usuarioRepository.save(usuario);

        emailService.sendPasswordResetEmail(usuario.getEmail(), token);
    }

    // NOVO MÉTODO
    public void resetPassword(String token, String newPassword) {
        Usuario usuario = usuarioRepository.findByPasswordResetToken(token)
                .orElseThrow(() -> new RuntimeException("Token de redefinição inválido ou não encontrado."));

        if (usuario.getTokenExpiryDate().isBefore(LocalDateTime.now())) {
            usuario.setPasswordResetToken(null);
            usuario.setTokenExpiryDate(null);
            usuarioRepository.save(usuario);
            throw new RuntimeException("Token de redefinição expirado.");
        }

        usuario.setSenha(passwordEncoder.encode(newPassword)); // Codifica a nova senha
        usuario.setPasswordResetToken(null); // Limpa o token
        usuario.setTokenExpiryDate(null); // Limpa a data

        usuarioRepository.save(usuario);
    }
}
