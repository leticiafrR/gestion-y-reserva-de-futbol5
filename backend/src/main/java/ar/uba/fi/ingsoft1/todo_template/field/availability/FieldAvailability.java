package ar.uba.fi.ingsoft1.todo_template.field.availability;

import ar.uba.fi.ingsoft1.todo_template.field.Field;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FieldAvailability {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "field_id", nullable = false)
    private Field field;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "varchar")
    private DayOfWeek dayOfWeek;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    public FieldAvailability(Field field, @NotNull DayOfWeek dayOfWeek, LocalTime time, LocalTime localTime) {
        this.field = field;
        this.dayOfWeek = dayOfWeek;
        this.startTime = time;
        this.endTime = localTime;
    }
}