package ar.uba.fi.ingsoft1.todo_template.user.dto;

import jakarta.validation.constraints.NotNull;

public record TokenDTO(
                @NotNull String accessToken,
                String refreshToken) {
}
