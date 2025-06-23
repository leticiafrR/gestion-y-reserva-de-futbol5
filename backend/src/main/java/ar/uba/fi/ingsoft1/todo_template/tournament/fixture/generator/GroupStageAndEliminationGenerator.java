package ar.uba.fi.ingsoft1.todo_template.tournament.fixture.generator;

import ar.uba.fi.ingsoft1.todo_template.tournament.Tournament;
import ar.uba.fi.ingsoft1.todo_template.tournament.teamRegistration.TeamRegisteredTournament;
import ar.uba.fi.ingsoft1.todo_template.tournament.fixture.TournamentMatch;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class GroupStageAndEliminationGenerator implements FixtureGenerator {
    private final RoundRobinGenerator roundRobinGenerator;
    private final SingleEliminationGenerator singleEliminationGenerator;
    private static final int MIN_TEAMS_PER_GROUP = 3;
    private static final int MAX_TEAMS_PER_GROUP = 6;

    public GroupStageAndEliminationGenerator(RoundRobinGenerator roundRobinGenerator,
            SingleEliminationGenerator singleEliminationGenerator) {
        this.roundRobinGenerator = roundRobinGenerator;
        this.singleEliminationGenerator = singleEliminationGenerator;
    }

    @Override
    public List<TournamentMatch> generateFixture(Tournament tournament, List<TeamRegisteredTournament> teams) {
        if (teams.size() < MIN_TEAMS_PER_GROUP * 2) {
            throw new IllegalArgumentException("Not enough teams for group stage");
        }

        List<TournamentMatch> allMatches = new ArrayList<>();

        int numGroups = calculateOptimalGroupCount(teams.size());
        int teamsPerGroup = teams.size() / numGroups;
        int remainingTeams = teams.size() % numGroups;

        List<List<TeamRegisteredTournament>> groups = new ArrayList<>();
        List<TeamRegisteredTournament> shuffledTeams = new ArrayList<>(teams);
        Collections.shuffle(shuffledTeams);

        int currentIndex = 0;
        for (int i = 0; i < numGroups; i++) {
            int groupSize = teamsPerGroup + (i < remainingTeams ? 1 : 0);
            List<TeamRegisteredTournament> group = new ArrayList<>();

            for (int j = 0; j < groupSize; j++) {
                group.add(shuffledTeams.get(currentIndex++));
            }

            groups.add(group);
        }

        for (int i = 0; i < groups.size(); i++) {
            List<TeamRegisteredTournament> group = groups.get(i);
            List<TournamentMatch> groupMatches = roundRobinGenerator.generateFixture(tournament, group);

            for (TournamentMatch match : groupMatches) {
                int groupOffset = (i + 1) * 1000;
                match.setMatchNumber(groupOffset + match.getMatchNumber());
            }

            allMatches.addAll(groupMatches);
        }

        List<TeamRegisteredTournament> advancingTeams = new ArrayList<>();
        for (List<TeamRegisteredTournament> group : groups) {
            advancingTeams.addAll(group.stream().limit(2).collect(Collectors.toList()));
        }

        List<TournamentMatch> eliminationMatches = singleEliminationGenerator.generateFixture(tournament,
                advancingTeams);

        int maxGroupRound = allMatches.stream()
                .mapToInt(TournamentMatch::getRoundNumber)
                .max()
                .orElse(0);

        for (TournamentMatch match : eliminationMatches) {
            match.setRoundNumber(match.getRoundNumber() + maxGroupRound);
        }

        allMatches.addAll(eliminationMatches);
        return allMatches;
    }

    private int calculateOptimalGroupCount(int totalTeams) {
        int minGroups = (int) Math.ceil((double) totalTeams / MAX_TEAMS_PER_GROUP);
        int maxGroups = (int) Math.floor((double) totalTeams / MIN_TEAMS_PER_GROUP);

        for (int i = minGroups; i <= maxGroups; i++) {
            if (isPowerOfTwo(i)) {
                return i;
            }
        }

        return minGroups;
    }

    private boolean isPowerOfTwo(int n) {
        return n > 0 && (n & (n - 1)) == 0;
    }
}