package ar.uba.fi.ingsoft1.todo_template.blockedslot;

import ar.uba.fi.ingsoft1.todo_template.field.Field;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlockedSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Field field;

    private LocalDate date;

    private Integer hour;
}
