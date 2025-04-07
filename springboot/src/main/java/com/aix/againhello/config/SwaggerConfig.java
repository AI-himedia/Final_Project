package com.aix.againhello.config;

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
    public OpenAPI openAPI() {
        return new OpenAPI().openapi("3.0.0") // openAPI 버전 명시
                .components(new Components()
                        .addSecuritySchemes("jwt-token",
                                new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")
                                        .in(SecurityScheme.In.HEADER).name("Authorization")))
                .addSecurityItem(new SecurityRequirement().addList("jwt-token"))
                .info(apiInfo());
    }

    private Info apiInfo () {
        return new Info()
                .title("cc-api Swagger")
                .description("cc 유저 및 인증, 공연 등에 관한 REST API")
                .version("1.0.0");
    }


}