package ar.uba.fi.ingsoft1.todo_template.tournament.fixture.generator;

import ar.uba.fi.ingsoft1.todo_template.tournament.Tournament;
import ar.uba.fi.ingsoft1.todo_template.tournament.fixture.TournamentMatch;
import ar.uba.fi.ingsoft1.todo_template.tournament.teamRegistration.TeamRegisteredTournament;

import java.util.List;

public interface FixtureGenerator {
    List<TournamentMatch> generateFixture(Tournament tournament, List<TeamRegisteredTournament> teams);
}
