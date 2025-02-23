package ar.uba.fi.ingsoft1.todo_template.user;

import jakarta.validation.constraints.NotBlank;

import java.util.function.Function;

public record UserCreateDTO(
        @NotBlank String username,
        @NotBlank String password
) implements UserCredentials {
    public User asUser(Function<String, String> encryptPassword) {
        return new User(username, encryptPassword.apply(password));
    }
}
