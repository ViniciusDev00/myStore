package com.store.BACK.service;

import com.store.BACK.model.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtTokenService {

    // --- CHAVE SECRETA (Mantida constante) ---
    private static final String SECRET_KEY_STRING = "ZEdWemEyVnlJR05sY25ScFptbGpZWFJsTFdWNGRISmhZMk52ZFc1MA==";
    private final SecretKey secretKey;

    public JwtTokenService() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY_STRING);
        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
    }
    // ------------------------------------------

    private final long jwtExpiration = 86400000; // 24 horas

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();

        // CORREÇÃO: Adiciona as permissões (roles) do usuário ao token
        claims.put("authorities", userDetails.getAuthorities());

        if (userDetails instanceof Usuario) {
            Usuario user = (Usuario) userDetails;
            claims.put("nome", user.getNome());
        }
        return createToken(claims, userDetails.getUsername());
    }

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
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(secretKey)
                .compact();
    }
}