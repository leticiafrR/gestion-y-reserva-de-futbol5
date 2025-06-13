package ar.uba.fi.ingsoft1.todo_template.tournament.update;

import java.time.LocalDate;

import ar.uba.fi.ingsoft1.todo_template.tournament.Tournament;

public class UpdateEndDateCommand implements TournamentUpdateCommand {

    private final LocalDate newEndDate;

    public UpdateEndDateCommand(LocalDate newEndDate) {
        this.newEndDate = newEndDate;
    }

    @Override
    public Tournament apply(Tournament tournament) {
        LocalDate today = LocalDate.now();

        if (newEndDate.isBefore(today)) {
            throw new IllegalArgumentException("End date cannot be in the past.");
        }

        if (newEndDate.isBefore(tournament.getStartDate())) {
            throw new IllegalArgumentException("End date cannot be before start date.");
        }

        tournament.setEndDate(newEndDate);
        return tournament;
    }
}