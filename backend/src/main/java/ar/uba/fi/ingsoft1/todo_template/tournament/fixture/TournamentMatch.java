package ar.uba.fi.ingsoft1.todo_template.tournament.fixture;

import ar.uba.fi.ingsoft1.todo_template.tournament.Tournament;
import ar.uba.fi.ingsoft1.todo_template.tournament.teamRegistration.TeamRegisteredTournament;
import ar.uba.fi.ingsoft1.todo_template.field.Field;
import ar.uba.fi.ingsoft1.todo_template.match.Match;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class TournamentMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "tournament_id", nullable = false)
    private Tournament tournament;

    @ManyToOne
    @JoinColumns({
            @JoinColumn(name = "home_team_id", referencedColumnName = "team_id"),
            @JoinColumn(name = "home_tournament_id", referencedColumnName = "tournament_id")
    })
    private TeamRegisteredTournament homeTeam;

    @ManyToOne
    @JoinColumns({
            @JoinColumn(name = "away_team_id", referencedColumnName = "team_id"),
            @JoinColumn(name = "away_tournament_id", referencedColumnName = "tournament_id")
    })
    private TeamRegisteredTournament awayTeam;

    @ManyToOne
    @JoinColumn(name = "field_id")
    private Field field;

    @Column(name = "scheduled_date_time", nullable = false)
    private LocalDateTime scheduledDateTime;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "varchar", nullable = false)
    private MatchStatus status;

    private Integer homeTeamScore;

    private Integer awayTeamScore;

    @Column(name = "round_number", nullable = false)
    private int roundNumber;

    @Column(name = "match_number", nullable = false)
    private int matchNumber;

    @ManyToOne(optional = true)
    @JoinColumn(name = "next_match_id")
    private TournamentMatch nextMatch;

    @Column(name = "is_home_team_next_match", nullable = false)
    private boolean homeTeamNextMatch;

    @ManyToOne
    @JoinColumn(name = "match_id")
    private Match match;

    public MatchStatus getStatus() {
        if (this.status == MatchStatus.COMPLETED || this.status == MatchStatus.CANCELLED) {
            return this.status;
        }
        if (getScheduledDateTime().isAfter(LocalDateTime.now())) {
            return MatchStatus.SCHEDULED;
        }
        return MatchStatus.IN_PROGRESS;
    }
}
