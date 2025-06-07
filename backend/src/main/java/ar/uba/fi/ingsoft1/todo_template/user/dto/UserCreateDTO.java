package ar.uba.fi.ingsoft1.todo_template.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;

import java.util.function.Function;

import ar.uba.fi.ingsoft1.todo_template.user.User;
import ar.uba.fi.ingsoft1.todo_template.user.UserCredentials;
import io.swagger.v3.oas.annotations.media.Schema;

public record UserCreateDTO(
        @Schema(description = "User's name") @NotBlank(message = "The username cannot be empty to register a user.") String name,
        @Schema(description = "User's last name") @NotBlank(message = "The username cannot be empty to register a user.") String last_name,
        @Schema(description = "Username address") @NotBlank(message = "The username cannot be empty to register a user.") @Email String username,
        @Schema(description = "User's password") @NotBlank(message = "The user's password cannot be empty to register a user.") String password,
        @Schema(description = "User's role") @NotBlank(message = "The user role cannot be empty to register a user.") String role,
        @Schema(description = "User's gender") @NotBlank(message = "The user gender cannot be empty to register a user.") String gender,
        @Schema(description = "User's age") @NotBlank(message = "The user age cannot be empty to register a user.") String age,
        @Schema(description = "User's zone") @NotBlank(message = "The user address cannot be empty to register a user.") String zone)

        implements UserCredentials {

    public User asUser(Function<String, String> encryptPassword) {
        return new User(username,
                encryptPassword.apply(password), role, gender,
                age, zone, name, last_name);
    }

}
