package ar.uba.fi.ingsoft1.todo_template.tournament.teamRegistration;

import ar.uba.fi.ingsoft1.todo_template.team.Team;
import ar.uba.fi.ingsoft1.todo_template.tournament.Tournament;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
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

    @Builder.Default
    private int points = 0;

    @Builder.Default
    private int goalsFor = 0;

    @Builder.Default
    private int goalsAgainst = 0;

    @Builder.Default
    private int wins = 0;

    @Builder.Default
    private int draws = 0;

    @Builder.Default
    private int losses = 0;

    public TeamRegisteredTournament(TeamTournamentId id, Tournament tournament, Team team, int points, int goalsFor,
            int goalsAgainst, int wins, int draws, int losses) {
        this.id = id;
        this.tournament = tournament;
        this.team = team;
        this.points = points;
        this.goalsFor = goalsFor;
        this.goalsAgainst = goalsAgainst;
        this.wins = wins;
        this.draws = draws;
        this.losses = losses;
    }

    public int getGoalDifference() {
        return goalsFor - goalsAgainst;
    }
}
