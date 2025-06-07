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
    private LocalDate startDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
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

}