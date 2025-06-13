package ar.uba.fi.ingsoft1.todo_template.tournament;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TournamentCreateDTO(
        @NotBlank String name,
        @NotNull LocalDate startDate,
        @NotNull TournamentFormat format,
        @Positive int maxTeams,
        LocalDate endDate,
        String description,
        String prizes,
        @PositiveOrZero BigDecimal registrationFee
) {
}
