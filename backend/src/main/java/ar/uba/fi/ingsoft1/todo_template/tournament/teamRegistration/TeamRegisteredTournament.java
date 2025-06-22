package ar.uba.fi.ingsoft1.todo_template.tournament.teamRegistration;

import ar.uba.fi.ingsoft1.todo_template.team.Team;
import ar.uba.fi.ingsoft1.todo_template.tournament.Tournament;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamRegisteredTournament {
    @EmbeddedId
    private TeamTournamentId id;

    @ManyToOne
    @MapsId("tournamentId")
    @JoinColumn(name = "tournament_id")
    private Tournament tournament;

    @ManyToOne
    @MapsId("teamId")
    @JoinColumn(name = "team_id")
    private Team team;

    // Estadísticas del equipo
    private int points = 0;
    private int goalsFor = 0;
    private int goalsAgainst = 0;
    private int wins = 0;
    private int draws = 0;
    private int losses = 0;

    public int getGoalDifference() {
        return goalsFor - goalsAgainst;
    }
}
