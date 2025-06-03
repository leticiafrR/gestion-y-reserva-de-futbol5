package ar.uba.fi.ingsoft1.todo_template.team;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TeamCreateDTO {

    @NotBlank
    private String name;

    private String primaryColor;
    private String secondaryColor;
    private String logo;

    public Team toTeam(String captainUsername) {
        return Team.builder()
                .name(this.name)
                .captain(captainUsername)
                .primaryColor(this.primaryColor)
                .secondaryColor(this.secondaryColor)
                .logo(this.logo)
                .build();
    }
}