package ar.uba.fi.ingsoft1.todo_template.tournament.fixture.generator;

import ar.uba.fi.ingsoft1.todo_template.tournament.Tournament;
import ar.uba.fi.ingsoft1.todo_template.tournament.TeamRegistration;
import ar.uba.fi.ingsoft1.todo_template.tournament.fixture.TournamentMatch;
import ar.uba.fi.ingsoft1.todo_template.tournament.fixture.MatchStatus;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Component
public class SingleEliminationGenerator implements FixtureGenerator {
    @Override
    public List<TournamentMatch> generateFixture(Tournament tournament, List<TeamRegistration> teams) {
        List<TournamentMatch> matches = new ArrayList<>();
        int numTeams = teams.size();
        int numRounds = (int) Math.ceil(Math.log(numTeams) / Math.log(2));
        int numMatches = (int) Math.pow(2, numRounds - 1);

        // Shuffle teams for random seeding
        Collections.shuffle(teams);

        for (int i = 0; i < numMatches; i++) {
            TournamentMatch match = new TournamentMatch();
            match.setTournament(tournament);
            match.setRoundNumber(1);
            match.setMatchNumber(i + 1);
            match.setStatus(MatchStatus.SCHEDULED);

            if (i * 2 < teams.size()) {
                match.setHomeTeam(teams.get(i * 2));
            }
            if (i * 2 + 1 < teams.size()) {
                match.setAwayTeam(teams.get(i * 2 + 1));
            }

            matches.add(match);
        }

        for (int round = 2; round <= numRounds; round++) {
            int matchesInRound = numMatches / (int) Math.pow(2, round - 1);
            for (int i = 0; i < matchesInRound; i++) {
                TournamentMatch match = new TournamentMatch();
                match.setTournament(tournament);
                match.setRoundNumber(round);
                match.setMatchNumber(i + 1);
                match.setStatus(MatchStatus.SCHEDULED);
                matches.add(match);
            }
        }

        for (int round = 1; round < numRounds; round++) {
            final int currentRound = round;
            int matchesInCurrentRound = numMatches / (int) Math.pow(2, round - 1);
            int matchesInNextRound = matchesInCurrentRound / 2;

            for (int i = 0; i < matchesInCurrentRound; i++) {
                final int currentMatchNumber = i;
                TournamentMatch currentMatch = matches.stream()
                        .filter(m -> m.getRoundNumber() == currentRound && m.getMatchNumber() == currentMatchNumber + 1)
                        .findFirst()
                        .get();

                TournamentMatch nextMatch = matches.stream()
                        .filter(m -> m.getRoundNumber() == currentRound + 1 && m.getMatchNumber() == (currentMatchNumber / 2) + 1)
                        .findFirst()
                        .get();

                currentMatch.setNextMatch(nextMatch);
                currentMatch.setHomeTeamNextMatch(currentMatchNumber % 2 == 0);
            }
        }

        return matches;
    }
}