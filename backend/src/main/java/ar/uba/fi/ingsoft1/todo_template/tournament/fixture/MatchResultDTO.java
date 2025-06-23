package ar.uba.fi.ingsoft1.todo_template.tournament.fixture;

import jakarta.validation.constraints.Min;

public record MatchResultDTO(@Min(0) int homeTeamScore,
                             @Min(0) int awayTeamScore) {
}
