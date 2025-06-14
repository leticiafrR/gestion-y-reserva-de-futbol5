package ar.uba.fi.ingsoft1.todo_template.tournament.fixture;

import ar.uba.fi.ingsoft1.todo_template.tournament.Tournament;
import ar.uba.fi.ingsoft1.todo_template.tournament.TeamRegistration;
import ar.uba.fi.ingsoft1.todo_template.field.Field;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tournament_matches")
@Getter
@Setter
public class TournamentMatch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "tournament_id", nullable = false)
    private Tournament tournament;

    @ManyToOne
    @JoinColumn(name = "home_team_id")
    private TeamRegistration homeTeam;

    @ManyToOne
    @JoinColumn(name = "away_team_id")
    private TeamRegistration awayTeam;

    @ManyToOne
    @JoinColumn(name = "field_id")
    private Field field;

    @Column(nullable = false)
    private LocalDateTime scheduledDateTime;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private MatchStatus status;

    private Integer homeTeamScore;
    private Integer awayTeamScore;

    @Column(nullable = false)
    private int roundNumber;

    @Column(nullable = false)
    private int matchNumber;

    @ManyToOne
    @JoinColumn(name = "next_match_id")
    private TournamentMatch nextMatch;

    @Column(name = "is_home_team_next_match", nullable = false)
    private boolean homeTeamNextMatch;
}