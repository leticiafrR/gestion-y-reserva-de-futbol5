package ar.uba.fi.ingsoft1.todo_template.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.tags.Tag;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashSet;

import static ar.uba.fi.ingsoft1.todo_template.config.security.SecurityConfig.PUBLIC_ENDPOINTS;

@OpenAPIDefinition(
        info = @Info(title = "Simple To-Do App Backend")
)
@SecurityScheme(
        name = OpenApiConfiguration.BEARER_AUTH_SCHEME_KEY,
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT"
)
@Component
public class OpenApiConfiguration {

    public static final String BEARER_AUTH_SCHEME_KEY = "Bearer Authentication";

    @Bean
    public OpenApiCustomizer customerGlobalHeaderOpenApiCustomizer() {
        return openApi -> {
            var tags = new HashSet<String>();

            // Iterate over what spring calls controllers (OpenAPI paths) and paths (OpenAPI operations)
            for (var entry: openApi.getPaths().entrySet()) {
                for (var operation: entry.getValue().readOperations()) {
                    tags.addAll(operation.getTags());
                    if (Arrays.asList(PUBLIC_ENDPOINTS).contains(entry.getKey())) {
                        operation.getResponses().remove("403");
                    } else {
                        operation.addSecurityItem(new SecurityRequirement().addList(BEARER_AUTH_SCHEME_KEY));
                    }
                }
            }

            openApi.setTags(tags.stream()
                    .sorted()
                    .map(name -> new Tag().name(name))
                    .toList());
        };
    }
}