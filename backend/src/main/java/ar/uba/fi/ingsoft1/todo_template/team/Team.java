package ar.uba.fi.ingsoft1.todo_template.team;

import ar.uba.fi.ingsoft1.todo_template.team.invitation.Invitation;
import ar.uba.fi.ingsoft1.todo_template.team.teamServiceException.UserAlreadyMemberException;
import ar.uba.fi.ingsoft1.todo_template.team.teamServiceException.UserNotPartOfTeam;
import ar.uba.fi.ingsoft1.todo_template.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
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

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "team_members",
            joinColumns = @JoinColumn(name = "team_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> members = new HashSet<>();

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Invitation> invitations = new ArrayList<>();

    public void addMember(User user) throws UserAlreadyMemberException{
        if (members == null) {
            members = new HashSet<>();
        }
        if (members.contains(user)) {
            var msg = String.format("User '%s' is already a member of the Team '%s'", user.getUsername(), name);
            throw new UserAlreadyMemberException(msg);
        }
        members.add(user);
    }

    public List<String> getMemberNames() {
        return members.stream()
                .map(User::getUsername)
                .collect(Collectors.toList());
    }

    public void removeMember(User user) {
        if (!members.remove(user)) {
            throw new UserNotPartOfTeam("The user wasnt part of the Team");
        }
    }
    public void clearMembers() {
        if (members != null) {
            members.clear();
        }
    }
}

