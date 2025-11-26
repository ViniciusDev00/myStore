package com.store.BACK.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // CORREÇÃO: Adicionado "file:src/main/resources/static/uploads/"
        // Isso permite que o servidor leia o arquivo que acabou de ser salvo na pasta física
        // sem precisar reiniciar o projeto.
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:src/main/resources/static/uploads/", "classpath:/static/uploads/")
                .setCachePeriod(3600);

        // Mapeia /FRONT/** para a pasta física de assets do frontend
        registry.addResourceHandler("/FRONT/**")
                .addResourceLocations("file:./FRONT/")
                .setCachePeriod(3600);
    }
}