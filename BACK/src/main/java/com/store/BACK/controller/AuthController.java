// Local: BACK/src/main/java/com/store/BACK/controller/AuthController.java
package com.store.BACK.controller;

import com.store.BACK.dto.LoginRequestDTO;
import com.store.BACK.dto.RegistroRequestDTO;
import com.store.BACK.model.Usuario;
import com.store.BACK.repository.UsuarioRepository;
import com.store.BACK.service.JwtTokenService;
import com.store.BACK.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final JwtTokenService jwtTokenService;
    private final PasswordEncoder passwordEncoder;
    private final UsuarioService usuarioService;

    // SEU MÉTODO ORIGINAL (COPIADO DO ARQUIVO)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO loginRequestDTO) {
        var usernamePassword = new UsernamePasswordAuthenticationToken(loginRequestDTO.email(), loginRequestDTO.senha());
        var auth = this.authenticationManager.authenticate(usernamePassword);
        var token = jwtTokenService.generateToken((Usuario) auth.getPrincipal());
        return ResponseEntity.ok(Map.of("token", token));
    }

    // SEU MÉTODO ORIGINAL (COPIADO DO ARQUIVO)
    @PostMapping("/registro")
    public ResponseEntity<?> registro(@RequestBody RegistroRequestDTO registroRequestDTO) {
        if (this.usuarioRepository.findByEmail(registroRequestDTO.email()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "E-mail já cadastrado."));
        }
        Usuario newUser = new Usuario();
        // Setters corrigidos via Lombok
        newUser.setNome(registroRequestDTO.nome());
        newUser.setCpf(registroRequestDTO.cpf());
        newUser.setEmail(registroRequestDTO.email());
        newUser.setSenha(passwordEncoder.encode(registroRequestDTO.senha()));
        newUser.setRole("ROLE_USER");
        this.usuarioRepository.save(newUser);
        return ResponseEntity.ok(Map.of("message", "Usuário registrado com sucesso"));
    }

    // NOVO ENDPOINT
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            usuarioService.createPasswordResetToken(email);
            return ResponseEntity.ok(Map.of("message", "E-mail de redefinição enviado com sucesso. Verifique sua caixa de entrada."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // NOVO ENDPOINT
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String token, @RequestBody Map<String, String> request) {
        try {
            String newPassword = request.get("newPassword");
            if (newPassword == null || newPassword.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "A nova senha não pode estar vazia."));
            }
            usuarioService.resetPassword(token, newPassword);
            return ResponseEntity.ok(Map.of("message", "Senha redefinida com sucesso."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}