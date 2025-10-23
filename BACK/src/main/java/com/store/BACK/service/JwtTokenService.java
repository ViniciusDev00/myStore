package com.store.BACK.service;

import com.store.BACK.model.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtTokenService {

    // CORREÇÃO: Usar variável de ambiente ou application.properties
    @Value("${jwt.secret:ZEdWemEyVnlJR05sY25ScFptbGpZWFJsTFdWNGRISmhZMk52ZFc1MA==}")
    private String SECRET_KEY_STRING;
    
    private SecretKey secretKey;
    
    // Tempo de expiração: 24 horas (em milissegundos)
    private final long jwtExpiration = 86400000;

    // Inicializa a chave quando o serviço é criado
    private SecretKey getSigningKey() {
        if (secretKey == null) {
            byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY_STRING);
            secretKey = Keys.hmacShaKeyFor(keyBytes);
        }
        return secretKey;
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("authorities", userDetails.getAuthorities());
        
        if (userDetails instanceof Usuario) {
            Usuario user = (Usuario) userDetails;
            claims.put("nome", user.getNome());
        }
        
        return createToken(claims, userDetails.getUsername());
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            boolean isValid = (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
            
            // LOG PARA DEBUG
            System.out.println("🔐 Validando token para usuário: " + username);
            System.out.println("✅ Token válido: " + isValid);
            
            return isValid;
        } catch (Exception e) {
            System.err.println("❌ Erro ao validar token: " + e.getMessage());
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        try {
            Date expiration = extractExpiration(token);
            boolean expired = expiration.before(new Date());
            
            if (expired) {
                System.out.println("⏰ Token expirado em: " + expiration);
            }
            
            return expired;
        } catch (Exception e) {
            System.err.println("❌ Erro ao verificar expiração: " + e.getMessage());
            return true; // Se não conseguir verificar, considera expirado
        }
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private String createToken(Map<String, Object> claims, String subject) {
        Date now = new Date(System.currentTimeMillis());
        Date expiration = new Date(System.currentTimeMillis() + jwtExpiration);
        
        System.out.println("🔑 Criando token para: " + subject);
        System.out.println("⏰ Expira em: " + expiration);
        
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiration)
                .signWith(getSigningKey())
                .compact();
    }
}