package ar.uba.fi.ingsoft1.todo_template.tournament.update;

import java.time.LocalDate;

import ar.uba.fi.ingsoft1.todo_template.tournament.Tournament;

public class UpdateStartDateCommand implements TournamentUpdateCommand {
    private final LocalDate newStartDate;

    public UpdateStartDateCommand(LocalDate newStartDate) {
        this.newStartDate = newStartDate;
    }

    @Override
    public Tournament apply(Tournament tournament) {
        LocalDate today = LocalDate.now();

        if (newStartDate.isBefore(today)) {
            throw new IllegalArgumentException("Start date cannot be in the past.");
        }

        if (tournament.getEndDate() != null && newStartDate.isAfter(tournament.getEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date.");
        }

        tournament.setStartDate(newStartDate);
        return tournament;
    }

}
