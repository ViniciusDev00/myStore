package com.store.BACK.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Mapeia /uploads/** para a pasta física de uploads
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("classpath:/static/uploads/")
                .setCachePeriod(3600); // Cache de 1 hora
                
        // --- CORREÇÃO: Mapeamento explícito para a pasta FRONT que contém as imagens ---
        // Garante que o servidor consegue localizar arquivos como /FRONT/inicio/IMG/recentes/tnOreo.webp
        registry.addResourceHandler("/FRONT/**")
                .addResourceLocations("classpath:/static/FRONT/")
                .setCachePeriod(3600);
        // --- FIM DA CORREÇÃO ---
    }
}