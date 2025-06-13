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
    /*
     * public Tournament apply(Tournament tournament) {
     * if (tournament.getRegisteredTeams().size() > newMaxTeams) {
     * throw new
     * IllegalArgumentException("Cannot reduce max teams below current number of registrations."
     * );
     * }
     * tournament.setMaxTeams(newMaxTeams);
     * return tournament;
     * }
     */

}
