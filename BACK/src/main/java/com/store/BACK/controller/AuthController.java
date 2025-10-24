package com.store.BACK.controller;

import com.store.BACK.dto.LoginRequestDTO;
import com.store.BACK.dto.LoginResponseDTO;
import com.store.BACK.dto.RegistroRequestDTO;
import com.store.BACK.dto.UsuarioDTO;
import com.store.BACK.model.Usuario;
import com.store.BACK.service.JwtTokenService;
import com.store.BACK.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtTokenService jwtTokenService;
    private final UsuarioService usuarioService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO request) {
        // 1. Tenta autenticar o usuário. Se a senha estiver incorreta, lança uma exceção (que resulta em 401)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getSenha()
                )
        );

        // 2. Se a autenticação for bem-sucedida, carrega os detalhes do usuário
        final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());

        // 3. Gera o token JWT
        final String jwt = jwtTokenService.generateToken(userDetails);

        // 4. Retorna o token para o cliente
        return ResponseEntity.ok(new LoginResponseDTO(jwt));
    }

    @PostMapping("/registro")
    public ResponseEntity<UsuarioDTO> registrar(@RequestBody RegistroRequestDTO request) {
        // Cria o objeto Usuario a partir do DTO
        Usuario novoUsuario = new Usuario();
        novoUsuario.setNome(request.getNome());
        novoUsuario.setEmail(request.getEmail());
        novoUsuario.setSenha(request.getSenha());
        // Adicione CPF e Telefone aqui, se existirem no RegistroRequestDTO
        // novoUsuario.setCpf(request.getCpf());
        // novoUsuario.setTelefone(request.getTelefone());

        // 1. Tenta registrar o usuário (o serviço já criptografa a senha)
        UsuarioDTO usuarioRegistrado = usuarioService.registrarUsuario(novoUsuario);

        // 2. Retorna o DTO do novo usuário
        return ResponseEntity.ok(usuarioRegistrado);
    }
}