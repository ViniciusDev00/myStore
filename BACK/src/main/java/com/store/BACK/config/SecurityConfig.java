package com.store.BACK.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod; // Import necessário
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity; // Mantido
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

// import static org.springframework.security.config.Customizer.withDefaults; // Removido withDefaults se não usar

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Mantido para @PreAuthorize
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;
    // Removida a injeção automática de CorsConfigurationSource se definirmos o Bean abaixo

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Usa o Bean definido abaixo
                .csrf(csrf -> csrf.disable()) // Desabilita CSRF
                .authorizeHttpRequests(auth -> auth
                        // Permite acesso público a rotas de autenticação, produtos (GET), e uploads estáticos
                        .requestMatchers("/api/auth/**", "/uploads/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/produtos/**").permitAll() // Permite GET em produtos para todos
                        // Rotas que exigem autenticação (USER ou ADMIN)
                        .requestMatchers("/api/usuario/**", "/api/pedidos/**", "/api/enderecos/**").authenticated() // Usuário logado
                        // Rotas exclusivas do ADMIN
                        .requestMatchers("/api/admin/**").hasRole("ADMIN") // Garante que SÓ ADMIN acessa /api/admin/*
                        // Qualquer outra requisição precisa estar autenticada
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Sessão stateless
                .authenticationProvider(authenticationProvider) // Define o provedor de autenticação
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class); // Adiciona o filtro JWT

        return http.build();
    }

    // *** BEAN CORS RESTAURADO ***
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Define as origens permitidas explicitamente
        configuration.setAllowedOrigins(List.of(
                "http://127.0.0.1:5500", // Origem comum para Live Server VSCode
                "http://localhost:5500",
                "http://127.0.0.1:5501", // Outra porta possível
                "http://localhost:5501",
                "https://japa-front-production.up.railway.app", // Seu frontend em produção
                "https://www.japauniverse.com.br", // Domínio principal
                "https://japauniverse.com.br" // Domínio sem www
                // Adicione outras origens se necessário
        ));
        // Métodos HTTP permitidos
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        // Cabeçalhos permitidos (usar "*" permite todos, incluindo Authorization)
        configuration.setAllowedHeaders(List.of("*"));
        // Permite credenciais (cookies, tokens de autorização)
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Aplica a configuração a todas as rotas ("/**")
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    // *** FIM DO BEAN CORS ***
}