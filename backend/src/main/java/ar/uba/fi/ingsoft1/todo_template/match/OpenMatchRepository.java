package ar.uba.fi.ingsoft1.todo_template.match;

import java.util.List;
import java.util.Optional;

import ar.uba.fi.ingsoft1.todo_template.booking.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OpenMatchRepository extends JpaRepository<OpenMatch, Long> {
    List<OpenMatch> findByIsActiveTrue();
    Optional<OpenMatch> findByBooking(Booking booking);
}
