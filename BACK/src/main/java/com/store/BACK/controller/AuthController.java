package com.store.BACK.controller;

import com.store.BACK.dto.LoginRequestDTO;
import com.store.BACK.dto.UsuarioDTO;
import com.store.BACK.model.Usuario;
import com.store.BACK.security.JwtUtil;
import com.store.BACK.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getSenha())
            );
            Usuario usuario = usuarioService.buscarPorEmail(loginRequest.getEmail());
            String jwt = JwtUtil.gerarToken(usuario);

            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            response.put("usuario", new UsuarioDTO(usuario));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Credenciais inválidas");
        }
    }
}