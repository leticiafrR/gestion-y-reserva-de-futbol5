package ar.uba.fi.ingsoft1.todo_template.tournament.update;

import ar.uba.fi.ingsoft1.todo_template.tournament.Tournament;

public class UpdateMaxTeamsCommand implements TournamentUpdateCommand {

    private final int newMaxTeams;

    public UpdateMaxTeamsCommand(int newMaxTeams) {
        this.newMaxTeams = newMaxTeams;
    }

    @Override
    public Tournament apply(Tournament tournament) {
        tournament.setMaxTeams(newMaxTeams);
        return tournament;
    }

}
