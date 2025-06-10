package ar.uba.fi.ingsoft1.todo_template.timeslot;

import ar.uba.fi.ingsoft1.todo_template.field.Field;
import jakarta.persistence.*;
import lombok.*;

import java.time.DayOfWeek;

@Entity
@Table(name = "time_slot")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", columnDefinition = "varchar(20)")
    private DayOfWeek dayOfWeek;


    @Column(nullable = false)
    private int openTime;

    @Column(nullable = false)
    private int closeTime;

    @ManyToOne(optional = false)
    @JoinColumn(name = "field_id", nullable = false)
    private Field field;
}
