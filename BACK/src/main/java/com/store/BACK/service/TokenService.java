package com.store.BACK.service;

import com.store.BACK.model.Usuario;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class TokenService {

    @Value("${jwt.secret}") // Crie esta propriedade no application.properties
    private String jwtSecret;

    @Value("${jwt.expiration}") // E esta também
    private long jwtExpiration;

    public String generateToken(Authentication authentication) {
        Usuario usuario = (Usuario) authentication.getPrincipal();

        return Jwts.builder()
                .setSubject(usuario.getEmail())
                .claim("nome", usuario.getNome()) // <-- A CHAVE! Adicionando o nome ao token
                .claim("role", usuario.getRole())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(SignatureAlgorithm.HS512, jwtSecret)
                .compact();
    }
}