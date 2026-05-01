package com.stayiq.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Value("${FRONTEND_URL:http://localhost:3000}")
    private String frontendUrl;

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                List<String> origins = new ArrayList<>(Arrays.asList("http://localhost:3000", "http://localhost:5000"));
                if (frontendUrl != null && !frontendUrl.isEmpty()) {
                    origins.addAll(Arrays.asList(frontendUrl.split(",")));
                }
                
                registry.addMapping("/**")
                        .allowedOriginPatterns(origins.toArray(new String[0]))
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}
