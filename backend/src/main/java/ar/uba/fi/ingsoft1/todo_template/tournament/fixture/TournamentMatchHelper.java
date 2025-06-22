package ar.uba.fi.ingsoft1.todo_template.tournament.fixture;

import java.util.List;
import java.util.stream.Collectors;

import ar.uba.fi.ingsoft1.todo_template.tournament.fixture.MatchStatus;
import ar.uba.fi.ingsoft1.todo_template.tournament.fixture.TournamentMatch;
import ar.uba.fi.ingsoft1.todo_template.tournament.fixture.TournamentMatchRepository;

public class TournamentMatchHelper {

    private final TournamentMatchRepository tournamentMatchRepository;

    public TournamentMatchHelper(TournamentMatchRepository tournamentMatchRepository) {
        this.tournamentMatchRepository = tournamentMatchRepository;
    }

    /**
     * Obtiene una lista de nombres de partidos completados en formato "Equipo1 vs
     * Equipo2"
     */
    public List<String> getCompletedMatchesNames(List<TournamentMatch> matches) {
        return matches.stream()
                .filter(match -> match.getStatus() == MatchStatus.COMPLETED)
                .map(match -> match.getHomeTeam().getTeam().getName() + " vs "
                        + match.getAwayTeam().getTeam().getName())
                .collect(Collectors.toList());
    }

    /**
     * Calcula el total de goles en los partidos completados
     */
    public int calculateTotalGoals(List<TournamentMatch> matches) {
        return matches.stream()
                .filter(match -> match.getStatus() == MatchStatus.COMPLETED)
                .mapToInt(match -> (match.getHomeTeamScore() != null ? match.getHomeTeamScore() : 0) +
                        (match.getAwayTeamScore() != null ? match.getAwayTeamScore() : 0))
                .sum();
    }

    /**
     * Calcula el promedio de goles por partido
     */
    public double calculateAverageGoalsPerMatch(int totalGoals, int completedMatches) {
        return completedMatches > 0 ? (double) totalGoals / completedMatches : 0.0;
    }
}
