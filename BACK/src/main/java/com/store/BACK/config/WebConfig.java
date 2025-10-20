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
                
        // --- CORREÇÃO FINAL: Mapeamento explícito para a pasta FRONT ---
        // Este handler é necessário porque o Spring não mapeia subdiretórios
        // do classpath automaticamente com a mesma URL do handler.
        registry.addResourceHandler("/FRONT/**")
                .addResourceLocations("classpath:/static/FRONT/")
                .setCachePeriod(3600);
        // --- FIM DA CORREÇÃO ---
    }
}