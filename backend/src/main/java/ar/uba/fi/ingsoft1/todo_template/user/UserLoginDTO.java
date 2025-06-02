package ar.uba.fi.ingsoft1.todo_template.user;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UserLoginDTO(

        @Schema(description = "User's name") @NotBlank(message = "To log in, the username cannot be empty") @Email String username,
        @Schema(description = "User's password") @NotBlank(message = "The user's password cannot be empty to register a user.") String password)
        implements UserCredentials {
}
