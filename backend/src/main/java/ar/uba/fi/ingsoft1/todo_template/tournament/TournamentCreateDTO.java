package ar.uba.fi.ingsoft1.todo_template.tournament;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TournamentCreateDTO(
                String name,
                LocalDate startDate,
                TournamentFormat format,
                @Positive Integer maxTeams,
                LocalDate endDate,
                String description,
                String prizes,
                @PositiveOrZero BigDecimal registrationFee) {
}
