package ar.uba.fi.ingsoft1.todo_template.tournament;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

import java.time.LocalDate;

import ar.uba.fi.ingsoft1.todo_template.user.User;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tournament {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    @Column(nullable = false)
    private LocalDate startDate;// fecha limite de inscripción

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "varchar")
    private TournamentFormat format;

    @Column(nullable = false)
    private int maxTeams;

    private LocalDate endDate;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String prizes;

    private BigDecimal registrationFee;

    @Column(nullable = false)
    private boolean openInscription = true;

    @ManyToOne(optional = false)
    @JoinColumn(name = "organizer_id", nullable = false)
    private User organizer;

    public Tournament(String name, LocalDate startDate, TournamentFormat format, int maxTeams, User organizer) {
        this.name = name;
        this.startDate = startDate;
        this.format = format;
        this.maxTeams = maxTeams;
        this.organizer = organizer;
        this.openInscription = true;
    }

    public boolean hasStarted() {
        LocalDate today = LocalDate.now();
        return !startDate.isAfter(today);
    }

    public boolean hasFinished() {
        LocalDate today = LocalDate.now();
        return (endDate != null && today.isAfter(endDate));
    }

    public boolean isStillOpenForRegistration() {
        return openInscription && !hasStarted();
    }

    public TournamentState getState() {
        if (hasFinished()) {
            return TournamentState.FINISHED;
        }
        if (!hasStarted()) {
            if (openInscription) {
                return TournamentState.OPEN_TO_REGISTER;
            }
            return TournamentState.CLOSE_TO_REGISTER_NOT_STARTED;
        }
        return TournamentState.IN_PROGRESS;
    }
}