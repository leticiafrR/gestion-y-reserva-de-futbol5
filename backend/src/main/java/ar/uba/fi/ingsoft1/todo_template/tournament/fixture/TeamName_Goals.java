package ar.uba.fi.ingsoft1.todo_template.tournament.fixture;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class TeamName_Goals {
    private String name;
    private int goals;

    public String getName() {
        return name;
    }

    public int getGoals() {
        return goals;
    }
}
