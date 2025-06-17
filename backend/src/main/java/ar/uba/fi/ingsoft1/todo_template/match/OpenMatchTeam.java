package ar.uba.fi.ingsoft1.todo_template.match;

import ar.uba.fi.ingsoft1.todo_template.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OpenMatchTeam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToMany(fetch = FetchType.EAGER)
    private List<User> members = new ArrayList<>();

    public void clearMembers() {
        members.clear();
    }

    public void addMember(User user) {
        members.add(user);
    }
}
