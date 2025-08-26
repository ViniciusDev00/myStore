package com.store.BACK.controller;

import com.store.BACK.dto.LoginRequestDTO;
import com.store.BACK.dto.RegistroRequestDTO;
import com.store.BACK.dto.UsuarioDTO;
import com.store.BACK.model.Usuario;
import com.store.BACK.service.JwtTokenService; // 1. IMPORTE O SERVIÇO DE TOKEN
import com.store.BACK.service.UsuarioService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetailsService; // 2. IMPORTE O UserDetailsService
import org.springframework.web.bind.annotation.*;

import java.util.Map; // 3. IMPORTE O MAP PARA A RESPOSTA

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private AuthenticationManager authenticationManager;

    // --- NOVAS INJEÇÕES DE DEPENDÊNCIA ---
    @Autowired
    private JwtTokenService jwtTokenService;

    @Autowired
    private UserDetailsService userDetailsService;
    // ------------------------------------

    // Seu método de registrar está CORRETO!
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

    // --- AJUSTE NO MÉTODO DE LOGIN ---
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO loginRequest) {
        try {
            // 1. O Spring Security valida o email e a senha
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.email(), loginRequest.senha())
            );

            // 2. Se a autenticação passar, buscamos os detalhes do usuário
            var userDetails = userDetailsService.loadUserByUsername(loginRequest.email());

            // 3. Geramos o token JWT com base nos detalhes do usuário
            String token = jwtTokenService.generateToken(userDetails);

            // 4. Retornamos o token em um corpo JSON: { "token": "seu.token.aqui" }
            return ResponseEntity.ok(Map.of("token", token));

        } catch (Exception e) {
            return ResponseEntity.status(401).body("Credenciais inválidas");
        }
    }
}