package com.store.BACK.controller;

import com.store.BACK.dto.LoginRequestDTO;
import com.store.BACK.dto.LoginResponseDTO; // Import necessário
import com.store.BACK.dto.RegistroRequestDTO;
import com.store.BACK.dto.UsuarioDTO;
import com.store.BACK.model.Usuario;
import com.store.BACK.service.JwtTokenService;
import com.store.BACK.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenService jwtTokenService;

    @Autowired
    private UserDetailsService userDetailsService;

    @PostMapping("/registrar")
    public ResponseEntity<UsuarioDTO> registrar(@RequestBody RegistroRequestDTO registroRequest) {
        try {
            Usuario novoUsuario = new Usuario();
            novoUsuario.setNome(registroRequest.nome());
            novoUsuario.setEmail(registroRequest.email());
            novoUsuario.setSenha(registroRequest.senha());

            UsuarioDTO usuarioSalvo = usuarioService.registrarUsuario(novoUsuario);
            return ResponseEntity.ok(usuarioSalvo);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // --- CÓDIGO CORRIGIDO PARA LOGIN ---
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO loginRequest) {
        try {
            // 1. Tenta autenticar o usuário com a sintaxe correta do Record (email() e senha())
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.email(), loginRequest.senha())
            );

            // 2. Se a autenticação passar, carrega os detalhes do usuário
            final UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.email());

            // 3. Gera o token JWT com base nos detalhes do usuário
            final String jwt = jwtTokenService.generateToken(userDetails);

            // 4. Retorna o token no formato DTO esperado pelo Frontend
            return ResponseEntity.ok(new LoginResponseDTO(jwt));

        } catch (Exception e) {
            // Em caso de falha de autenticação (senha incorreta, etc.), retorna 401
            return ResponseEntity.status(401).body("Credenciais inválidas");
        }
    }
}