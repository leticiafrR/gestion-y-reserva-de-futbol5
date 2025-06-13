package ar.uba.fi.ingsoft1.todo_template.tournament.update;

import ar.uba.fi.ingsoft1.todo_template.tournament.Tournament;

public class UpdateDescriptionCommand implements TournamentUpdateCommand {

    private final String newDescription;

    public UpdateDescriptionCommand(String newDescription) {
        this.newDescription = newDescription;
    }

    @Override
    public Tournament apply(Tournament tournament) {
        tournament.setDescription(newDescription);
        return tournament;
    }

}
