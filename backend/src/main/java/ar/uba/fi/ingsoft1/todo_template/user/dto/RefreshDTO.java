package ar.uba.fi.ingsoft1.todo_template.user.dto;

import jakarta.validation.constraints.NotBlank;

public record RefreshDTO(
                @NotBlank String refreshToken) {
}
