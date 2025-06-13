package ar.uba.fi.ingsoft1.todo_template.tournament.update;

import ar.uba.fi.ingsoft1.todo_template.tournament.Tournament;

public class UpdateNameCommand implements TournamentUpdateCommand {
    private final String newName;

    public UpdateNameCommand(String newName) {
        this.newName = newName;
    }

    @Override
    public Tournament apply(Tournament tournament) {
        tournament.setName(newName);
        return tournament;
    }
}
