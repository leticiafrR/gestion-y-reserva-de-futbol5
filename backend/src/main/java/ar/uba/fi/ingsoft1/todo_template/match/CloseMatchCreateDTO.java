package ar.uba.fi.ingsoft1.todo_template.match;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Data
public class CloseMatchCreateDTO {
    private Long bookingId;
    private Long teamOneId;  // Cambiado: ahora pasás solo el ID del equipo
    private Long teamTwoId;  
}