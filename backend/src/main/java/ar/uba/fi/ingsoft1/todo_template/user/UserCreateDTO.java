package ar.uba.fi.ingsoft1.todo_template.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;

import java.util.function.Function;

public record UserCreateDTO(
        @NotBlank String username,
        @NotBlank String password,
        @NotBlank @Email String email
) implements UserCredentials {
    public User asUser(Function<String, String> encryptPassword) {
        return new User(username, email, encryptPassword.apply(password));
    }
}
