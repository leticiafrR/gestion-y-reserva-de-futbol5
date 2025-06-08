package ar.uba.fi.ingsoft1.todo_template.team;

import ar.uba.fi.ingsoft1.todo_template.user.User;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;

@Getter
@Setter
public class TeamCreateDTO {

    @NotBlank
    private String name;

    private String primaryColor;
    private String secondaryColor;
    private String logo;

    public Team toTeam(User captain) {
        var members = new ArrayList<User>();
        members.add(captain);
        return Team.builder()
                .name(this.name)
                .captain(captain.getUsername())
                .primaryColor(this.primaryColor)
                .secondaryColor(this.secondaryColor)
                .logo(this.logo)
                .members(members)
                .build();
    }
}