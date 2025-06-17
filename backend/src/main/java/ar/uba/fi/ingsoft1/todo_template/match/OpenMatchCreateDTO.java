package ar.uba.fi.ingsoft1.todo_template.match;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class OpenMatchCreateDTO {
    private Long bookingId;
    private Integer maxPlayers;
    private Integer minPlayers;
}
