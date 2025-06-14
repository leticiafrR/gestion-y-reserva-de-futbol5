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
public class GroupStageAndEliminationGenerator implements FixtureGenerator {
    private final RoundRobinGenerator roundRobinGenerator;

    public GroupStageAndEliminationGenerator(RoundRobinGenerator roundRobinGenerator) {
        this.roundRobinGenerator = roundRobinGenerator;
    }

    @Override
    public List<TournamentMatch> generateFixture(Tournament tournament, List<TeamRegistration> teams) {
        List<TournamentMatch> matches = new ArrayList<>();

        // 1. Dividir equipos en grupos
        List<List<TeamRegistration>> groups = createGroups(teams);

        // 2. Generar partidos de fase de grupos
        int matchNumber = 1;
        for (int groupIndex = 0; groupIndex < groups.size(); groupIndex++) {
            List<TeamRegistration> groupTeams = groups.get(groupIndex);
            List<TournamentMatch> groupMatches = roundRobinGenerator.generateFixture(tournament, groupTeams);

            // Asignar números de partido y ronda
            for (TournamentMatch match : groupMatches) {
                match.setMatchNumber(matchNumber++);
                match.setRoundNumber(1);
            }

            matches.addAll(groupMatches);
        }

        // 3. Seleccionar equipos que avanzan
        List<TeamRegistration> advancingTeams = selectAdvancingTeams(groups);

        // 4. Generar partidos de eliminación
        List<TournamentMatch> eliminationMatches = generateEliminationMatches(tournament, advancingTeams, matchNumber);
        matches.addAll(eliminationMatches);

        return matches;
    }

    private List<List<TeamRegistration>> createGroups(List<TeamRegistration> teams) {
        int numTeams = teams.size();
        int numGroups = numTeams >= 8 ? 4 : 2;
        int teamsPerGroup = (int) Math.ceil((double) numTeams / numGroups);

        // Mezclar equipos para distribución aleatoria
        Collections.shuffle(teams);

        // Crear grupos
        List<List<TeamRegistration>> groups = new ArrayList<>();
        for (int i = 0; i < numGroups; i++) {
            groups.add(new ArrayList<>());
        }

        // Distribuir equipos en grupos
        for (int i = 0; i < teams.size(); i++) {
            groups.get(i % numGroups).add(teams.get(i));
        }

        return groups;
    }

    private List<TeamRegistration> selectAdvancingTeams(List<List<TeamRegistration>> groups) {
        List<TeamRegistration> advancingTeams = new ArrayList<>();

        for (List<TeamRegistration> group : groups) {
            // Ordenar equipos por puntos, diferencia de goles y goles a favor
            group.sort((a, b) -> {
                int pointsCompare = Integer.compare(b.getPoints(), a.getPoints());
                if (pointsCompare != 0) return pointsCompare;

                int goalDiffCompare = Integer.compare(b.getGoalDifference(), a.getGoalDifference());
                if (goalDiffCompare != 0) return goalDiffCompare;

                return Integer.compare(b.getGoalsFor(), a.getGoalsFor());
            });

            // Tomar los dos mejores equipos de cada grupo
            advancingTeams.addAll(group.subList(0, Math.min(2, group.size())));
        }

        return advancingTeams;
    }

    private List<TournamentMatch> generateEliminationMatches(Tournament tournament, List<TeamRegistration> teams, int startMatchNumber) {
        List<TournamentMatch> matches = new ArrayList<>();
        int numTeams = teams.size();
        int numRounds = (int) Math.ceil(Math.log(numTeams) / Math.log(2));
        int currentMatchNumber = startMatchNumber;

        // Generar partidos para cada ronda
        for (int round = 2; round <= numRounds + 1; round++) {
            int matchesInRound = (int) Math.pow(2, numRounds - round + 1);

            for (int i = 0; i < matchesInRound; i++) {
                TournamentMatch match = new TournamentMatch();
                match.setTournament(tournament);
                match.setRoundNumber(round);
                match.setMatchNumber(currentMatchNumber++);
                match.setStatus(MatchStatus.SCHEDULED);

                // Asignar equipos solo en la primera ronda de eliminación
                if (round == 2) {
                    if (i * 2 < teams.size()) {
                        match.setHomeTeam(teams.get(i * 2));
                    }
                    if (i * 2 + 1 < teams.size()) {
                        match.setAwayTeam(teams.get(i * 2 + 1));
                    }
                }

                matches.add(match);
            }
        }

        // Vincular partidos entre rondas
        linkEliminationMatches(matches);

        return matches;
    }

    private void linkEliminationMatches(List<TournamentMatch> matches) {
        for (int round = 2; round < matches.stream().mapToInt(TournamentMatch::getRoundNumber).max().orElse(2); round++) {
            int matchesInCurrentRound = (int) matches.stream()
                    .filter(m -> m.getRoundNumber() == round)
                    .count();

            for (int i = 0; i < matchesInCurrentRound; i++) {
                TournamentMatch currentMatch = matches.stream()
                        .filter(m -> m.getRoundNumber() == round && m.getMatchNumber() == i + 1)
                        .findFirst()
                        .orElse(null);

                if (currentMatch != null) {
                    TournamentMatch nextMatch = matches.stream()
                            .filter(m -> m.getRoundNumber() == round + 1 && m.getMatchNumber() == (i / 2) + 1)
                            .findFirst()
                            .orElse(null);

                    if (nextMatch != null) {
                        currentMatch.setNextMatch(nextMatch);
                        currentMatch.setHomeTeamNextMatch(i % 2 == 0);
                    }
                }
            }
        }
    }
}