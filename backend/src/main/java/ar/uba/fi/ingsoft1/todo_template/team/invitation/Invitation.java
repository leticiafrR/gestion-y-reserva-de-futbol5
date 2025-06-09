package ar.uba.fi.ingsoft1.todo_template.team.invitation;

import ar.uba.fi.ingsoft1.todo_template.team.Team;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "invitations")
public class Invitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "team_id")
    private Team team;

    @Column(nullable = false)
    private String inviteeEmail;

    @Column(nullable = false, unique = true, length = 36)
    private String token;// UUID

    @Column(nullable = false)
    private boolean pending = true;

    public Long getTeamId(){
        return team.getId();
    }

}
