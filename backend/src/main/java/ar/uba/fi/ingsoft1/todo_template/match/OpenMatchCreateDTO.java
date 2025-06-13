package ar.uba.fi.ingsoft1.todo_template.match;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class OpenMatchCreateDTO {
    private Long bookingId;
    private Long creatorId;        // Solo un jugador al inicio
    private Integer maxPlayers;
}
