package ar.uba.fi.ingsoft1.todo_template.tournament.fixture.generator;

import ar.uba.fi.ingsoft1.todo_template.tournament.Tournament;
import ar.uba.fi.ingsoft1.todo_template.tournament.TeamRegisteredTournament;
import ar.uba.fi.ingsoft1.todo_template.tournament.fixture.TournamentMatch;
import ar.uba.fi.ingsoft1.todo_template.tournament.fixture.MatchStatus;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class GroupStageAndEliminationGenerator implements FixtureGenerator {
    private final RoundRobinGenerator roundRobinGenerator;
    private static final int MIN_TEAMS_PER_GROUP = 3;
    private static final int MAX_TEAMS_PER_GROUP = 6;

    public GroupStageAndEliminationGenerator(RoundRobinGenerator roundRobinGenerator) {
        this.roundRobinGenerator = roundRobinGenerator;
    }

    @Override
    public List<TournamentMatch> generateFixture(Tournament tournament, List<TeamRegisteredTournament> teams) {
        if (teams.size() < MIN_TEAMS_PER_GROUP * 2) {
            throw new IllegalArgumentException("Not enough teams for group stage");
        }

        List<TournamentMatch> allMatches = new ArrayList<>();

        // Determinar número óptimo de grupos
        int numGroups = calculateOptimalGroupCount(teams.size());
        int teamsPerGroup = teams.size() / numGroups;
        int remainingTeams = teams.size() % numGroups;

        // Dividir equipos en grupos de manera balanceada
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

        // Generar partidos de fase de grupos
        for (int i = 0; i < groups.size(); i++) {
            List<TeamRegisteredTournament> group = groups.get(i);
            List<TournamentMatch> groupMatches = roundRobinGenerator.generateFixture(tournament, group);

            // Ajustar números de ronda y partido para mantener orden global
            for (TournamentMatch match : groupMatches) {
                match.setRoundNumber(match.getRoundNumber());
                match.setMatchNumber(match.getMatchNumber() + (i * 100)); // Separar por grupos
            }

            allMatches.addAll(groupMatches);
        }

        // Seleccionar equipos que avanzan basado en resultados
        List<TeamRegisteredTournament> advancingTeams = new ArrayList<>();
        for (List<TeamRegisteredTournament> group : groups) {
            // Ordenar equipos por puntos, diferencia de goles y goles a favor
            List<TeamRegisteredTournament> sortedTeams = group.stream()
                    .sorted(Comparator
                            .comparing(TeamRegisteredTournament::getPoints).reversed()
                            .thenComparing(team -> team.getGoalsFor() - team.getGoalsAgainst()).reversed()
                            .thenComparing(TeamRegisteredTournament::getGoalsFor).reversed())
                    .collect(Collectors.toList());

            // Tomar los dos mejores equipos de cada grupo
            advancingTeams.addAll(sortedTeams.subList(0, Math.min(2, sortedTeams.size())));
        }

        // Generar partidos de eliminación directa
        SingleEliminationGenerator eliminationGenerator = new SingleEliminationGenerator();
        List<TournamentMatch> eliminationMatches = eliminationGenerator.generateFixture(tournament, advancingTeams);

        // Ajustar números de ronda para la fase de eliminación
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
        // Calcular el número óptimo de grupos basado en el número de equipos
        int minGroups = (int) Math.ceil((double) totalTeams / MAX_TEAMS_PER_GROUP);
        int maxGroups = (int) Math.floor((double) totalTeams / MIN_TEAMS_PER_GROUP);

        // Preferir números que sean potencias de 2 para la fase de eliminación
        for (int i = minGroups; i <= maxGroups; i++) {
            if (isPowerOfTwo(i)) {
                return i;
            }
        }

        // Si no hay potencia de 2, usar el número más cercano
        return minGroups;
    }

    private boolean isPowerOfTwo(int n) {
        return n > 0 && (n & (n - 1)) == 0;
    }
}