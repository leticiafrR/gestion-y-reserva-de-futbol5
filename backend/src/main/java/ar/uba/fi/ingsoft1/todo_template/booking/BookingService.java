package ar.uba.fi.ingsoft1.todo_template.booking;

import ar.uba.fi.ingsoft1.todo_template.match.CloseMatchRepository;
import ar.uba.fi.ingsoft1.todo_template.match.MatchService;
import ar.uba.fi.ingsoft1.todo_template.match.OpenMatchRepository;
import ar.uba.fi.ingsoft1.todo_template.timeslot.TimeSlotService;
import ar.uba.fi.ingsoft1.todo_template.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserService userService;
    private final TimeSlotService timeslotService;
    private final MatchService matchService;

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
        var timeSlot = timeslotService.findByIdOrThrow(timeslotId);
        var field = timeSlot.getField();
        var fieldId = field.getId();
        Map<LocalDate, List<Integer>> availableHours = timeslotService.getAvailableHours(fieldId, 10);
        if (!availableHours.get(date).contains(hour)) {
            throw new IllegalArgumentException("Specified hour is not available for that day.");
        }

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

        matchService.deleteMatch(booking);
        booking.cancel();
        bookingRepository.save(booking);
    }

    public int countBookingsForFieldsOnDate(List<Long> fieldIds, LocalDate date) {
        return bookingRepository.findByTimeSlot_Field_IdInAndActiveTrue(fieldIds).stream()
                .filter(b -> b.getBookingDate().isEqual(date))
                .toList()
                .size();
    }

    public int countBookingsForFieldsInDateRange(List<Long> fieldIds, int daysAhead) {
        LocalDate today = LocalDate.now();
        LocalDate end = today.plusDays(daysAhead);

        return bookingRepository.findByTimeSlot_Field_IdInAndActiveTrue(fieldIds).stream()
                .filter(b -> !b.getBookingDate().isBefore(today) && !b.getBookingDate().isAfter(end))
                .toList()
                .size();
    }

    public Set<Integer> getReservedHoursForFieldAndDate(Long fieldId, LocalDate date) {
        return bookingRepository.findByTimeSlot_Field_IdAndActiveTrue(fieldId).stream()
                .filter(b -> b.getBookingDate().isEqual(date))
                .map(Booking::getBookingHour)
                .collect(Collectors.toSet());
    }

    public List<BookingDTO> getAllBookingsByUser(Long userId) {
        return bookingRepository.findByUser_Id(userId).stream()
                .map(this::toDTO)
                .toList();
    }

    private BookingDTO toDTO(Booking booking) {
        return new BookingDTO(
                booking.getId(),
                booking.getUser().getId(),
                booking.getTimeSlot().getId(),
                booking.getBookingDate(),
                booking.getBookingHour(),
                booking.isActive()
        );
    }
}
