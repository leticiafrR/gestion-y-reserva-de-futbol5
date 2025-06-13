package ar.uba.fi.ingsoft1.todo_template.tournament;

import java.time.LocalDate;

public record TournamentSummaryDTO(
        String name,
        LocalDate startDate,
        TournamentFormat format,
        TournamentState state) {
}