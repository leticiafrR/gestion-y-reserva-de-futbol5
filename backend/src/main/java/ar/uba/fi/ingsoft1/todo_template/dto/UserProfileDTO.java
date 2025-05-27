package ar.uba.fi.ingsoft1.todo_template.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

@Schema(description = "User profile information")
public record UserProfileDTO(
    @Schema(description = "User's unique identifier")
    @NotBlank String userId,
    
    @Schema(description = "User's email address")
    @NotBlank @Email String email,
    
    @Schema(description = "User's first name")
    @NotBlank String name,
    
    @Schema(description = "User's last name")
    @NotBlank String lastName,
    
    @Schema(description = "URL to user's profile picture")
    String profilePicture,
    
    @Schema(description = "User's birth date")
    @NotNull LocalDate birthDate,
    
    @Schema(description = "User's gender")
    @NotBlank String gender
) {} 