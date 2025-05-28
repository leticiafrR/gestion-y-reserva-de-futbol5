package ar.uba.fi.ingsoft1.todo_template.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;

import java.util.function.Function;

public record UserCreateDTO(
        @NotBlank String username,
        @NotBlank String password,
        @NotBlank @Email String email,
        String gender,
        String age,
        String address
) implements UserCredentials {
    public User asUser(Function<String, String> encryptPassword) {
        return new User(username, encryptPassword.apply(password), email, gender, age, address);
    }
}
