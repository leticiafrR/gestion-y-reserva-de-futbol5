package ar.uba.fi.ingsoft1.todo_template.tournament.teamRegistration;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import ar.uba.fi.ingsoft1.todo_template.tournament.Tournament;

public class TeamRegisteredTournamentHelper {

    private final TeamRegisteredTournamentRepository teamRegisteredTournamentRepository;

    public TeamRegisteredTournamentHelper(TeamRegisteredTournamentRepository teamRegisteredTournamentRepository) {
        this.teamRegisteredTournamentRepository = teamRegisteredTournamentRepository;
    }

    /**
     * Ordena una lista de equipos registrados según el criterio estándar de
     * torneos:
     * 1. Puntos (descendente)
     * 2. Diferencia de goles (descendente)
     * 3. Goles a favor (descendente)
     */
    public void sortTeamsByStandings(List<TeamRegisteredTournament> teams) {
        teams.sort(new TeamStandingsComparator());
    }

    public List<TeamRegisteredTournament> getSortedByStandingsTeamsForTournament(Tournament tournament) {
        List<TeamRegisteredTournament> teams = teamRegisteredTournamentRepository.findByTournament(tournament);
        sortTeamsByStandings(teams);
        return teams;
    }

    private static class TeamStandingsComparator implements Comparator<TeamRegisteredTournament> {
        @Override
        public int compare(TeamRegisteredTournament t1, TeamRegisteredTournament t2) {
            if (t1.getPoints() != t2.getPoints()) {
                return Integer.compare(t2.getPoints(), t1.getPoints());
            }
            if (t1.getGoalDifference() != t2.getGoalDifference()) {
                return Integer.compare(t2.getGoalDifference(), t1.getGoalDifference());
            }
            return Integer.compare(t2.getGoalsFor(), t1.getGoalsFor());
        }
    }

    /**
     * Ordena una lista de equipos según su cantidad de goles a favor
     * (orden descendente, de más goles a menos)
     */
    public void sortTeamsByGoalsFor(List<TeamRegisteredTournament> teams) {
        teams.sort(new TeamGoalsForComparator());
    }

    /**
     * Obtiene una lista de equipos registrados ordenada por goles a favor
     * (orden descendente, de más goles a menos)
     */
    public List<TeamRegisteredTournament> getSortedTeamsByGoalsFor(Tournament tournament) {
        List<TeamRegisteredTournament> teams = teamRegisteredTournamentRepository.findByTournament(tournament);
        sortTeamsByGoalsFor(teams);
        return teams;
    }

    public Optional<TeamRegisteredTournament> getBestDefensiveTeam(List<TeamRegisteredTournament> teams) {
        return teams.stream()
                .min((t1, t2) -> Integer.compare(t1.getGoalsAgainst(), t2.getGoalsAgainst()));
    }

    private static class TeamGoalsForComparator implements Comparator<TeamRegisteredTournament> {
        @Override
        public int compare(TeamRegisteredTournament t1, TeamRegisteredTournament t2) {
            return Integer.compare(t2.getGoalsFor(), t1.getGoalsFor());
        }
    }
}
