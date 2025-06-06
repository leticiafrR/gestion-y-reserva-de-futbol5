package ar.uba.fi.ingsoft1.todo_template.team;

import ar.uba.fi.ingsoft1.todo_template.team.teamServiceException.UserAlreadyMemberException;
import ar.uba.fi.ingsoft1.todo_template.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.apache.catalina.LifecycleState;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    private String captain;

    private String primaryColor;

    private String secondaryColor;

    private String logo;

    @ManyToMany
    @JoinTable(
            name = "team_members",
            joinColumns = @JoinColumn(name = "team_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> members = new ArrayList<>();

    // Agregar usuario existente al equipo, lanza excepción si el usuario ya pertenecía al equipo
    public void addMember(User user) throws UserAlreadyMemberException{
        if (members == null) {
            members = new ArrayList<>();
        }
        if (!members.contains(user)) {
            var msg = String.format("User '%s' is already a member of the Team '%s'", user.getUsername(), name);
            throw new UserAlreadyMemberException(msg);
        }
        members.add(user);
    }

    // Obtener nombres de los miembros
    public List<String> getMemberNames() {
        return members.stream()
                .map(User::getUsername)
                .collect(Collectors.toList());
    }

//    public void removeMember(User user) {
//        if (members != null) {
//            members.remove(user);
//        }
//    }
//
//    public boolean removeMember(String username) {
//        return members.removeIf(user -> user.getUsername().equals(username));
//    }
}
