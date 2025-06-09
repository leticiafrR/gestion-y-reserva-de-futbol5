package ar.uba.fi.ingsoft1.todo_template.booking;

import ar.uba.fi.ingsoft1.todo_template.timeslot.TimeSlotRepository;
import ar.uba.fi.ingsoft1.todo_template.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final TimeSlotRepository timeSlotRepository;

    public List<BookingDTO> getBookingsByField(Long fieldId) {
        return bookingRepository.findByTimeSlot_Field_IdAndActiveTrue(fieldId).stream()
                .map(this::toDTO)
                .toList();
    }

    public List<BookingDTO> getBookingsByUser(Long userId) {
        return bookingRepository.findByUser_IdAndActiveTrue(userId).stream()
                .map(this::toDTO)
                .toList();
    }

    public List<BookingDTO> getBookingsByOwnerUsername(String username) {
        return bookingRepository.findByTimeSlot_Field_Owner_UsernameAndActiveTrue(username).stream()
                .map(this::toDTO)
                .toList();
    }

    public BookingDTO getBookingById(Long id) {
        return bookingRepository.findById(id)
                .filter(Booking::isActive)
                .map(this::toDTO)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada o inactiva"));
    }

    public BookingDTO createBooking(String username, Long timeslotId, LocalDate date, int hour) {
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        var timeSlot = timeSlotRepository.findById(timeslotId)
                .orElseThrow(() -> new IllegalArgumentException("Franja horaria no encontrada"));

        var booking = new Booking(user, timeSlot, date, hour);
        bookingRepository.save(booking);
        return toDTO(booking);
    }


    public void cancelBooking(Long id) {
        var booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada"));

        if (!booking.isActive()) {
            throw new IllegalStateException("La reserva ya está cancelada");
        }

        booking.cancel();
        bookingRepository.save(booking);
    }

    private BookingDTO toDTO(Booking booking) {
        return new BookingDTO(
                booking.getId(),
                booking.getUser().getId(),
                booking.getTimeSlot().getId(),
                booking.isActive()
        );
    }
}
