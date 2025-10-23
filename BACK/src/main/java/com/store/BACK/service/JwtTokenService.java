package com.store.BACK.service;

import com.store.BACK.model.Usuario; // Import necessário se você adicionar claims extras como 'nome'
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority; // Import necessário
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors; // Import necessário

@Service
public class JwtTokenService {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long jwtExpiration; // Tempo de expiração em milissegundos

    // Extrai o nome de usuário (geralmente email) do token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Extrai uma informação específica (claim) do token
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // Gera um token para o usuário com claims padrão
    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails); // Chama a versão com claims extras
    }

    // Gera um token para o usuário com claims extras
    public String generateToken(
            Map<String, Object> extraClaims,
            UserDetails userDetails
    ) {
        // --- INCLUSÃO DAS ROLES/AUTHORITIES NOS CLAIMS ---
        // Converte a coleção de GrantedAuthority para uma String separada por vírgulas
        String authorities = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));
        extraClaims.put("authorities", authorities); // Adiciona as roles como um claim chamado "authorities"
        // --- FIM DA INCLUSÃO ---

        // Adiciona o nome do usuário como um claim extra (opcional, mas útil)
        if (userDetails instanceof Usuario) {
             extraClaims.put("nome", ((Usuario) userDetails).getNome());
        }

        return buildToken(extraClaims, userDetails, jwtExpiration);
    }

    // Constrói o token JWT com os claims fornecidos
    private String buildToken(
            Map<String, Object> extraClaims,
            UserDetails userDetails,
            long expiration
    ) {
        return Jwts
                .builder()
                .setClaims(extraClaims) // Adiciona todos os claims (incluindo "authorities" e "nome")
                .setSubject(userDetails.getUsername()) // Define o "subject" (identificador principal) como o email/username
                .setIssuedAt(new Date(System.currentTimeMillis())) // Data de emissão do token
                .setExpiration(new Date(System.currentTimeMillis() + expiration)) // Data de expiração
                .signWith(getSignInKey(), SignatureAlgorithm.HS256) // Assina o token com a chave secreta e algoritmo HS256
                .compact(); // Finaliza e retorna a string do token
    }

    // Verifica se o token é válido para o usuário fornecido
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        // O token é válido se o username no token for igual ao do UserDetails
        // e o token não estiver expirado
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    // Verifica se o token expirou
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date()); // Compara a data de expiração com a data atual
    }

    // Extrai a data de expiração do token
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // Extrai todos os claims do token
    private Claims extractAllClaims(String token) {
        // Faz o parse do token usando a chave secreta para verificar a assinatura
        return Jwts
                .parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody(); // Retorna o "corpo" do token (os claims)
    }

    // Obtém a chave de assinatura (Key) a partir da string secreta (secretKey)
    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey); // Decodifica a chave secreta de Base64
        return Keys.hmacShaKeyFor(keyBytes); // Gera a chave para o algoritmo HMAC-SHA
    }
}
