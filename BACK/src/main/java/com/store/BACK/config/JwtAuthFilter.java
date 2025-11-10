package com.store.BACK.config;

import com.store.BACK.service.JwtTokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtTokenService jwtTokenService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        System.out.println("\n--- [FILTRO JWT] Recebido pedido para o URL: " + request.getRequestURI());

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("--- [FILTRO JWT] Cabeçalho de autorização não existe ou não começa com 'Bearer '. A continuar sem autenticação JWT.");
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        try {
            userEmail = jwtTokenService.extractUsername(jwt);
        } catch (Exception e) {
            System.out.println("!!! [FILTRO JWT] FALHA: Não foi possível extrair o email do token. Erro: " + e.getMessage());
            filterChain.doFilter(request, response);
            return;
        }

        System.out.println("--- [FILTRO JWT] Email extraído do token: " + userEmail);

        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            System.out.println("--- [FILTRO JWT] Email presente no token e não há autenticação no contexto. A tentar carregar detalhes do utilizador...");
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            if (jwtTokenService.isTokenValid(jwt, userDetails)) {
                System.out.println(">>> [FILTRO JWT] SUCESSO: Token é válido. A definir autenticação no contexto de segurança.");
                // CORREÇÃO: Usa as autoridades carregadas do UserDetails
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                System.out.println(">>> [FILTRO JWT] Autenticação definida com sucesso para: " + userDetails.getUsername() + " com permissões " + userDetails.getAuthorities());
            } else {
                System.out.println("!!! [FILTRO JWT] FALHA: A validação do token falhou.");
            }
        } else {
            System.out.println("--- [FILTRO JWT] Email é nulo ou já existe uma autenticação no contexto de segurança. Nada a fazer.");
        }

        filterChain.doFilter(request, response);
    }
}