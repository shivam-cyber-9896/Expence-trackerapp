package com.shivam.monocept.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Department Expense System API")
                        .version("1.0.0")
                        .description("API documentation for the Department Expense System application."))
                .addSecurityItem(new SecurityRequirement().addList("basicScheme"))
                .components(new Components()
                        .addSecuritySchemes("basicScheme", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("basic")
                                .description("Basic authentication credentials to access the API")));
    }
}
