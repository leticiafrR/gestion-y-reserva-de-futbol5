package ar.uba.fi.ingsoft1.todo_template.match;

import ar.uba.fi.ingsoft1.todo_template.user.User;
import ar.uba.fi.ingsoft1.todo_template.team.Team;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OpenMatch extends Match {

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "open_match_players")
    private List<User> players;

    @Column(nullable = false)
    private Integer minPlayers;

    @Column(nullable = false)
    private Integer maxPlayers;

    @ManyToOne
    private Team teamOne;

    @ManyToOne
    private Team teamTwo;

    public void getTeamOne(Team team) {
        this.teamOne = team;
    }
    public void getTeamTwo(Team team) {
        this.teamTwo = team;
    }
}