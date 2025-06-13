package ar.uba.fi.ingsoft1.todo_template.tournament.update;

import ar.uba.fi.ingsoft1.todo_template.tournament.Tournament;

public interface TournamentUpdateCommand {
    Tournament apply(Tournament tournament);
}
