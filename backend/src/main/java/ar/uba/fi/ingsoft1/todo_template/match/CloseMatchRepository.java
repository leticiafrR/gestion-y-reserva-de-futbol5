package ar.uba.fi.ingsoft1.todo_template.match;

import java.util.List;
import java.util.Optional;

import ar.uba.fi.ingsoft1.todo_template.booking.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CloseMatchRepository extends JpaRepository<CloseMatch, Long> {
    List<CloseMatch> findByTeamOne_IdAndTeamTwo_Id(Long teamOneId, Long teamTwoId);
    List<CloseMatch> findByIsActiveTrue();
    Optional<CloseMatch> findByBooking(Booking booking);
}
