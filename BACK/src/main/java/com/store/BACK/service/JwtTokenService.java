package com.store.BACK.service;

import com.store.BACK.model.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import io.jsonwebtoken.io.Decoders;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtTokenService {

    // --- MUDANÇA PRINCIPAL AQUI ---
    // Chave secreta fixa e segura. Em um projeto real, isso viria de um arquivo de configuração.
    // Esta string tem 256 bits, que é o recomendado para HS256.
    private static final String SECRET_KEY_STRING = "SeuSegredoSuperSecretoQueNinguemPodeDescobrir1234567890";
    private final SecretKey secretKey;

    public JwtTokenService() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY_STRING);
        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
    }
    // --- FIM DA MUDANÇA ---

    private final long jwtExpiration = 86400000; // 24 horas

    // Extrai o email do token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Gera um token para o usuário
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();

        if (userDetails instanceof Usuario) {
            Usuario user = (Usuario) userDetails;
            claims.put("nome", user.getNome());
        }

        return createToken(claims, userDetails.getUsername());
    }

    // Valida o token
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(secretKey).build().parseClaimsJws(token).getBody();
    }

    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject) // O email do usuário
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(secretKey)
                .compact();
    }
}