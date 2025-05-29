package ar.uba.fi.ingsoft1.todo_template.user;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UserLoginDTO(
        @NotBlank @Email String username,
        @NotBlank String password
) implements UserCredentials {}
