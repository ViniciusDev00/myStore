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

        System.out.println("\n🔍 [FILTRO JWT] URL: " + request.getRequestURI());
        System.out.println("📋 [FILTRO JWT] Método: " + request.getMethod());

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("⚠️ [FILTRO JWT] Sem token de autorização");
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        System.out.println("🎫 [FILTRO JWT] Token recebido: " + jwt.substring(0, 20) + "...");
        
        try {
            userEmail = jwtTokenService.extractUsername(jwt);
            System.out.println("👤 [FILTRO JWT] Email extraído: " + userEmail);
        } catch (Exception e) {
            System.err.println("❌ [FILTRO JWT] ERRO ao extrair email: " + e.getMessage());
            e.printStackTrace();
            filterChain.doFilter(request, response);
            return;
        }

        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                
                if (jwtTokenService.isTokenValid(jwt, userDetails)) {
                    System.out.println("✅ [FILTRO JWT] Token VÁLIDO para: " + userEmail);
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } else {
                    System.err.println("❌ [FILTRO JWT] Token INVÁLIDO para: " + userEmail);
                }
            } catch (Exception e) {
                System.err.println("❌ [FILTRO JWT] ERRO na validação: " + e.getMessage());
                e.printStackTrace();
            }
        }

        filterChain.doFilter(request, response);
    }
}