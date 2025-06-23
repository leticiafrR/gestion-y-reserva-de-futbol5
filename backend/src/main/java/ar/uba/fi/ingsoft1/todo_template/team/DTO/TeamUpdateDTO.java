package ar.uba.fi.ingsoft1.todo_template.team.DTO;

import ar.uba.fi.ingsoft1.todo_template.team.Team;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TeamUpdateDTO {

    private String name;
    private String primaryColor;
    private String secondaryColor;
    private String logo;

    public Team applyTo(Team team) {
        if (this.name != null) team.setName(this.name);
        if (this.primaryColor != null) team.setPrimaryColor(this.primaryColor);
        if (this.secondaryColor != null) team.setSecondaryColor(this.secondaryColor);
        if (this.logo != null) team.setLogo(this.logo);
        return team;
    }
}