package ar.uba.fi.ingsoft1.todo_template.tournament.fixture.generator;

import ar.uba.fi.ingsoft1.todo_template.tournament.Tournament;
import ar.uba.fi.ingsoft1.todo_template.tournament.fixture.TournamentMatch;
import ar.uba.fi.ingsoft1.todo_template.tournament.teamRegistration.TeamRegisteredTournament;
import ar.uba.fi.ingsoft1.todo_template.tournament.fixture.MatchStatus;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class RoundRobinGenerator implements FixtureGenerator {
    @Override
    public List<TournamentMatch> generateFixture(Tournament tournament, List<TeamRegisteredTournament> teams) {
        List<TournamentMatch> matches = new ArrayList<>();
        List<TeamRegisteredTournament> rotatingTeams = new ArrayList<>(teams);

        if (rotatingTeams.size() % 2 != 0) {
            rotatingTeams.add(null);
        }

        int numTeams = rotatingTeams.size();
        int numRounds = numTeams - 1;
        int matchesPerRound = numTeams / 2;

        for (int round = 0; round < numRounds; round++) {
            for (int i = 0; i < matchesPerRound; i++) {
                TeamRegisteredTournament homeTeam = rotatingTeams.get(i);
                TeamRegisteredTournament awayTeam = rotatingTeams.get(numTeams - 1 - i);

                if (homeTeam != null && awayTeam != null) {
                    TournamentMatch match = new TournamentMatch();
                    match.setTournament(tournament);
                    match.setRoundNumber(round + 1);
                    match.setMatchNumber((round * matchesPerRound) + i + 1);
                    match.setStatus(MatchStatus.SCHEDULED);
                    match.setHomeTeam(homeTeam);
                    match.setAwayTeam(awayTeam);
                    matches.add(match);
                }
            }

            rotatingTeams.add(1, rotatingTeams.remove(rotatingTeams.size() - 1));
        }

        return matches;
    }
}