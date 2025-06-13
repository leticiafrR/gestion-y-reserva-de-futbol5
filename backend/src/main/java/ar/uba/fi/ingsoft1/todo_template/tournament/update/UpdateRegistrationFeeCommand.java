package ar.uba.fi.ingsoft1.todo_template.tournament.update;

import java.math.BigDecimal;

import ar.uba.fi.ingsoft1.todo_template.tournament.Tournament;

public class UpdateRegistrationFeeCommand implements TournamentUpdateCommand {

    private final BigDecimal newFee;

    public UpdateRegistrationFeeCommand(BigDecimal newFee) {
        this.newFee = newFee;
    }

    @Override
    public Tournament apply(Tournament tournament) {
        tournament.setRegistrationFee(newFee);
        return tournament;
    }
}
