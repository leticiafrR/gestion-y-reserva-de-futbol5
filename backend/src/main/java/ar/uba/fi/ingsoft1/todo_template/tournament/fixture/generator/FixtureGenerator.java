package ar.uba.fi.ingsoft1.todo_template.tournament.fixture.generator;

import ar.uba.fi.ingsoft1.todo_template.tournament.Tournament;
import ar.uba.fi.ingsoft1.todo_template.tournament.fixture.TournamentMatch;

import java.util.List;

public interface FixtureGenerator {
    List<TournamentMatch> generateFixture(Tournament tournament, List<TeamRegistration> teams);
}
