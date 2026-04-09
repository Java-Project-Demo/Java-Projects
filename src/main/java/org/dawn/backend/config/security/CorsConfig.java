package org.dawn.backend.config.security;

import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Component
public class CorsConfig {
    public final String[] ALLOWED_DOMAINS = {
            "http://localhost:3000",
            "http://localhost:4200",
            "http://localhost:5173"};

    private final String[] ALLOWED_HEADERS = {
            "Authorization",
            "Cache-Control",
            "Content-Type",
            "X-Requested-With",
            "Accept",
            "Origin"};


    private final String[] ALLOWED_METHODS = {
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
    };

    @Bean
    public UrlBasedCorsConfigurationSource config() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOriginPatterns(List.of("*"));

        config.setAllowedHeaders(List.of(ALLOWED_HEADERS));
        config.setAllowedMethods(List.of(ALLOWED_METHODS));
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
