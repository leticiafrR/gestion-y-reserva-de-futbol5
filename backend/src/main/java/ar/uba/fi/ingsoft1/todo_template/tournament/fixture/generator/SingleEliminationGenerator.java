package ar.uba.fi.ingsoft1.todo_template.tournament.fixture.generator;

import ar.uba.fi.ingsoft1.todo_template.tournament.Tournament;
import ar.uba.fi.ingsoft1.todo_template.tournament.TeamRegisteredTournament;
import ar.uba.fi.ingsoft1.todo_template.tournament.fixture.TournamentMatch;
import ar.uba.fi.ingsoft1.todo_template.tournament.fixture.MatchStatus;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class SingleEliminationGenerator implements FixtureGenerator {
    @Override
    public List<TournamentMatch> generateFixture(Tournament tournament, List<TeamRegisteredTournament> teams) {
        List<TeamRegisteredTournament> shuffledTeams = new ArrayList<>(teams);
        Collections.shuffle(shuffledTeams);

        // Calculate number of rounds and necessary "byes" for non-power-of-two teams
        int numTeams = shuffledTeams.size();
        int numRounds = (int) Math.ceil(Math.log(numTeams) / Math.log(2));
        int totalSlotsInFirstRound = (int) Math.pow(2, numRounds);
        int numByes = totalSlotsInFirstRound - numTeams;

        // Generate all matches for all rounds without teams first
        List<TournamentMatch> allMatches = new ArrayList<>();
        int matchCounter = 1;
        for (int round = 1; round <= numRounds; round++) {
            int matchesInThisRound = (int) Math.pow(2, numRounds - round);
            for (int i = 0; i < matchesInThisRound; i++) {
                TournamentMatch match = new TournamentMatch();
                match.setTournament(tournament);
                match.setRoundNumber(round);
                match.setMatchNumber(matchCounter++);
                match.setStatus(MatchStatus.SCHEDULED);
                allMatches.add(match);
            }
        }

        // Link matches to their next match
        for (int i = 0; i < allMatches.size() - 1; i++) {
            TournamentMatch currentMatch = allMatches.get(i);
            if (currentMatch.getRoundNumber() < numRounds) {
                // The next match is found by looking at the start of the next round's matches
                int matchesInCurrentRound = (int) Math.pow(2, numRounds - currentMatch.getRoundNumber());
                int matchesInNextRound = (int) Math.pow(2, numRounds - (currentMatch.getRoundNumber() + 1));
                int baseIndexOfCurrentRound = (int) Math.pow(2, numRounds) - (int) Math.pow(2, numRounds - currentMatch.getRoundNumber() + 1);
                int baseIndexOfNextRound = baseIndexOfCurrentRound + matchesInCurrentRound;

                int matchIndexInRound = i - baseIndexOfCurrentRound;
                int nextMatchIndex = baseIndexOfNextRound + (matchIndexInRound / 2);

                if (nextMatchIndex < allMatches.size()) {
                    TournamentMatch nextMatch = allMatches.get(nextMatchIndex);
                    currentMatch.setNextMatch(nextMatch);
                    currentMatch.setHomeTeamNextMatch(matchIndexInRound % 2 == 0);
                }
            }
        }

        // Assign teams to the first round
        List<TournamentMatch> firstRoundMatches = allMatches.stream()
                .filter(m -> m.getRoundNumber() == 1)
                .collect(Collectors.toList());

        int teamIndex = 0;
        int byesToGive = numByes;

        for (TournamentMatch match : firstRoundMatches) {
            // Teams with byes advance automatically
            if (byesToGive > 0) {
                match.setHomeTeam(shuffledTeams.get(teamIndex++));
                match.setAwayTeam(null); // This team has a bye
                byesToGive--;

                // Automatically advance the team with the bye
                updateNextMatchWithWinner(match, match.getHomeTeam());

            } else {
                if (teamIndex < shuffledTeams.size()) {
                    match.setHomeTeam(shuffledTeams.get(teamIndex++));
                }
                if (teamIndex < shuffledTeams.size()) {
                    match.setAwayTeam(shuffledTeams.get(teamIndex++));
                }
            }
        }

        return allMatches;
    }

    private void updateNextMatchWithWinner(TournamentMatch completedMatch, TeamRegisteredTournament winner) {
        TournamentMatch nextMatch = completedMatch.getNextMatch();
        if (nextMatch != null) {
            if (completedMatch.isHomeTeamNextMatch()) {
                nextMatch.setHomeTeam(winner);
            } else {
                nextMatch.setAwayTeam(winner);
            }
        }
    }
}