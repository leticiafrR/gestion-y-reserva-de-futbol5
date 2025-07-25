package ar.uba.fi.ingsoft1.todo_template.tournament;

import java.time.LocalDate;

public record TournamentSummaryDTO(
                Long id,
                String name,
                LocalDate startDate,
                LocalDate endDate,
                TournamentFormat format,
                TournamentState state,
                Integer registeredTeams) {
}