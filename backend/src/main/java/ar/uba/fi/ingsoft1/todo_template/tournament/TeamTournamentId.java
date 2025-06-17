package ar.uba.fi.ingsoft1.todo_template.tournament;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class TeamTournamentId implements Serializable {
    private Long tournamentId;
    private Long teamId;

    // Constructor vacío requerido por JPA
    public TeamTournamentId() {
    }

    public TeamTournamentId(Long tournamentId, Long teamId) {
        this.tournamentId = tournamentId;
        this.teamId = teamId;
    }

    public Long getTournamentId() {
        return tournamentId;
    }

    public Long getTeamId() {
        return teamId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof TeamTournamentId))
            return false;
        TeamTournamentId that = (TeamTournamentId) o;
        return Objects.equals(tournamentId, that.tournamentId) &&
                Objects.equals(teamId, that.teamId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(tournamentId, teamId);
    }
}