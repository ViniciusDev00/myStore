package com.store.BACK.security;

import com.store.BACK.model.Usuario;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

import java.util.Date;

public class JwtUtil {
    private static final String SECRET_KEY = "sua-chave-secreta";

    public static String gerarToken(Usuario usuario) {
        return Jwts.builder()
                .claim("nome", usuario.getNome())
                .claim("email", usuario.getEmail())
                .setSubject(usuario.getEmail())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 1 dia
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY.getBytes())
                .compact();
    }
}