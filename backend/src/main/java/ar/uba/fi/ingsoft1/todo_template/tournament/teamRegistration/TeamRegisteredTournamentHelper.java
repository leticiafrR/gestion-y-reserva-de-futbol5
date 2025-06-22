package ar.uba.fi.ingsoft1.todo_template.tournament.teamRegistration;

import java.util.List;

import ar.uba.fi.ingsoft1.todo_template.tournament.Tournament;

import java.util.Comparator;

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

    public List<TeamRegisteredTournament> getSortedTeamsForTournament(Tournament tournament) {
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
}
