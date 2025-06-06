package ar.uba.fi.ingsoft1.todo_template.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "User profile information")
public record UserProfileDTO(

        @Schema(description = "User email address") @NotBlank(message = "User email cannot be blank") @Email String email,
        @Schema(description = "User first name") @NotBlank(message = "User name cannot be blank") String name,
        @Schema(description = "User last name") @NotBlank(message = "User last name cannot be blank") String last_name,
        @Schema(description = "User age") @NotNull String age,
        @Schema(description = "User gender") @NotBlank(message = "User gender cannot be blank") String gender,
        @Schema(description = "User zone") @NotBlank(message = "User gender cannot be blank") String zone,
        @Schema(description = "User role") @NotBlank(message = "User role cannot be blank") String role) {

}
