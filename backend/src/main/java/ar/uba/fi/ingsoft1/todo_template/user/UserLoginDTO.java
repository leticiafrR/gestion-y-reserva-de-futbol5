package ar.uba.fi.ingsoft1.todo_template.user;

import jakarta.validation.constraints.NotBlank;

public record UserLoginDTO(
        @NotBlank String username,
        @NotBlank String password
) implements UserCredentials {}
