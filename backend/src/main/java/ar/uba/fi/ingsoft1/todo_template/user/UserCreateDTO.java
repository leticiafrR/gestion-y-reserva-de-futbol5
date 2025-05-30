package ar.uba.fi.ingsoft1.todo_template.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;

import java.util.function.Function;

import io.swagger.v3.oas.annotations.media.Schema;

public record UserCreateDTO(
        @Schema(description = "Username address") @NotBlank(message = "The username cannot be empty to register a user.") String username,
        @Schema(description = "User's email address") @NotBlank(message = "The user email cannot be empty to register a user.") @Email String email,
        @Schema(description = "User's password") @NotBlank(message = "The user's password cannot be empty to register a user.") String password,
        @Schema(description = "User's role") @NotBlank(message = "The user role cannot be empty to register a user.") String role,
        @Schema(description = "User's gender") @NotBlank(message = "The user gender cannot be empty to register a user.") String gender,
        @Schema(description = "User's age") @NotBlank(message = "The user age cannot be empty to register a user.") String age,
        @Schema(description = "User's address") @NotBlank(message = "The user address cannot be empty to register a user.") String address)

        implements UserCredentials {

    public User asUser(Function<String, String> encryptPassword) {
        return new User(username, email,
                encryptPassword.apply(password), role, gender,
                age, address);
    }

}
