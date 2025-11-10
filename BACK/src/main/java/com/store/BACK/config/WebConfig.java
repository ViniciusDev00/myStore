package com.store.BACK.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // CORREÇÃO: Mapeia /uploads/** para a pasta física correta
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:src/main/resources/static/uploads/")
                .setCachePeriod(3600); // Cache de 1 hora

        // Mapeia /FRONT/** para a pasta física de assets do frontend
        registry.addResourceHandler("/FRONT/**")
                .addResourceLocations("file:./FRONT/")
                .setCachePeriod(3600); // Cache de 1 hora
    }
}
