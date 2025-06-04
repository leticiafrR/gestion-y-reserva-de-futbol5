package ar.uba.fi.ingsoft1.todo_template.booking;

import org.springframework.data.jpa.repository.JpaRepository;
import ar.uba.fi.ingsoft1.todo_template.field.Field;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByFieldAndDate(Field field, LocalDate date);
}
