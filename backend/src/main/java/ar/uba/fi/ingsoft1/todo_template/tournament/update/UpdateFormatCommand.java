package ar.uba.fi.ingsoft1.todo_template.tournament.update;

import ar.uba.fi.ingsoft1.todo_template.tournament.Tournament;
import ar.uba.fi.ingsoft1.todo_template.tournament.TournamentFormat;

public class UpdateFormatCommand implements TournamentUpdateCommand {

    private final TournamentFormat newFormat;

    public UpdateFormatCommand(TournamentFormat newFormat) {
        this.newFormat = newFormat;
    }

    @Override
    public Tournament apply(Tournament tournament) {
        tournament.setFormat(newFormat);
        return tournament;
    }
}
