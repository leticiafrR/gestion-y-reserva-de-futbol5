package ar.uba.fi.ingsoft1.todo_template.team.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TeamDeleteDTO {
    @NotBlank
    private String deletingUsername;
}
