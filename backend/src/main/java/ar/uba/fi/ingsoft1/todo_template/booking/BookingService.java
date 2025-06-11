package ar.uba.fi.ingsoft1.todo_template.booking;

import ar.uba.fi.ingsoft1.todo_template.timeslot.TimeSlotService;
import ar.uba.fi.ingsoft1.todo_template.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserService userService;
    private final TimeSlotService timeSlotService;

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
                .orElseThrow(() -> new IllegalArgumentException("No active booking found"));
    }

    public BookingDTO createBooking(String username, Long timeslotId, LocalDate date, int hour) {
        var user = userService.findByUsernameOrThrow(username);
        var timeSlot = timeSlotService.findByIdOrThrow(timeslotId);

        var booking = new Booking(user, timeSlot, date, hour);
        bookingRepository.save(booking);
        return toDTO(booking);
    }


    public void cancelBooking(Long id) {
        var booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No active booking found"));

        if (!booking.isActive()) {
            throw new IllegalStateException("Booking is already cancelled");
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
