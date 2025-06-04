package ar.uba.fi.ingsoft1.todo_template.field.availability;

import ar.uba.fi.ingsoft1.todo_template.field.Field;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;

public interface FieldAvailabilityRepository extends JpaRepository<FieldAvailability, Long> {
    List<FieldAvailability> findByField(Field field);

    boolean existsByFieldAndDayOfWeekAndStartTimeLessThanEqualAndEndTimeGreaterThan(
            Field field, DayOfWeek dayOfWeek, LocalTime from, LocalTime to
    );

    List<FieldAvailability> findByFieldAndDayOfWeek(Field field, DayOfWeek day);
}
