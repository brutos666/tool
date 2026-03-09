package com.brutos.tool.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
class CorsConfiguration implements WebMvcConfigurer {
    
    private final PropertiesConfig propertiesConfig;

    public CorsConfiguration(PropertiesConfig propertiesConfig) {
        this.propertiesConfig = propertiesConfig;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(propertiesConfig.getCorsAllowedOrigins())
                .allowedMethods("GET", "POST", "PUT", "DELETE");
    }
}
