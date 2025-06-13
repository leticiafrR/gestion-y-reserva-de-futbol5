package ar.uba.fi.ingsoft1.todo_template.tournament.update;

import ar.uba.fi.ingsoft1.todo_template.tournament.Tournament;

public class UpdatePrizesCommand implements TournamentUpdateCommand {

    private final String newPrizes;

    public UpdatePrizesCommand(String newPrizes) {
        this.newPrizes = newPrizes;
    }

    @Override
    public Tournament apply(Tournament tournament) {
        tournament.setPrizes(newPrizes);
        return tournament;
    }

}
