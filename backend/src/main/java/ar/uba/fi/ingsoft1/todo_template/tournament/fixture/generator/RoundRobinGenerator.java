package ar.uba.fi.ingsoft1.todo_template.tournament.fixture.generator;

import ar.uba.fi.ingsoft1.todo_template.tournament.Tournament;
import ar.uba.fi.ingsoft1.todo_template.tournament.TeamRegisteredTournament;
import ar.uba.fi.ingsoft1.todo_template.tournament.fixture.TournamentMatch;
import ar.uba.fi.ingsoft1.todo_template.tournament.fixture.MatchStatus;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class RoundRobinGenerator implements FixtureGenerator {
    @Override
    public List<TournamentMatch> generateFixture(Tournament tournament, List<TeamRegisteredTournament> teams) {
        List<TournamentMatch> matches = new ArrayList<>();
        int numTeams = teams.size();
        int numRounds = numTeams - 1;
        int matchesPerRound = numTeams / 2;

        for (int round = 1; round <= numRounds; round++) {
            for (int match = 1; match <= matchesPerRound; match++) {
                TournamentMatch fixture = new TournamentMatch();
                fixture.setTournament(tournament);
                fixture.setRoundNumber(round);
                fixture.setMatchNumber(match);
                fixture.setStatus(MatchStatus.SCHEDULED);
                matches.add(fixture);
            }
        }

        List<TeamRegisteredTournament> rotatingTeams = new ArrayList<>(teams);
        for (int round = 0; round < numRounds; round++) {
            for (int match = 0; match < matchesPerRound; match++) {
                int homeIndex = match;
                int awayIndex = numTeams - 1 - match;

                TournamentMatch currentMatch = matches.get(round * matchesPerRound + match);
                currentMatch.setHomeTeam(rotatingTeams.get(homeIndex));
                currentMatch.setAwayTeam(rotatingTeams.get(awayIndex));
            }

            rotatingTeams.add(1, rotatingTeams.remove(rotatingTeams.size() - 1));
        }

        return matches;
    }
}