package com.store.BACK.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // AJUSTE DE ROBUSTEZ: Usar classpath:/uploads/ é mais seguro para recursos dentro do JAR.
        // O Spring Security já permite o acesso a /uploads/**
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("classpath:/static/uploads/")
                .setCachePeriod(3600); // Cache de 1 hora

        // Mapeia /FRONT/** para a pasta física de assets do frontend
        registry.addResourceHandler("/FRONT/**")
                .addResourceLocations("file:./FRONT/")
                .setCachePeriod(3600); // Cache de 1 hora
    }
}