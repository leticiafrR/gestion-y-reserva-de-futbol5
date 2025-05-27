package ar.uba.fi.ingsoft1.todo_template.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "User search result information")
public record UserSearchResultDTO(
    @Schema(description = "User's unique identifier")
    String userId,
    
    @Schema(description = "User's first name")
    String name,
    
    @Schema(description = "User's last name")
    String lastName,
    
    @Schema(description = "URL to user's profile picture")
    String profilePicture,
    
    @Schema(description = "User's gender")
    String gender
) {} 