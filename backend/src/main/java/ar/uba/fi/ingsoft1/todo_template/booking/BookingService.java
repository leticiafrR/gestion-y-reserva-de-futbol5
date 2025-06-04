package ar.uba.fi.ingsoft1.todo_template.booking;

import ar.uba.fi.ingsoft1.todo_template.field.Field;
import ar.uba.fi.ingsoft1.todo_template.field.FieldRepository;
import ar.uba.fi.ingsoft1.todo_template.field.availability.FieldAvailability;
import ar.uba.fi.ingsoft1.todo_template.field.availability.FieldAvailabilityRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class BookingService {

    private final FieldRepository fieldRepository;
    private final FieldAvailabilityRepository availabilityRepository;
    private final BookingRepository bookingRepository;

    public List<TimeSlotDTO> getAvailableTimeSlots(Long fieldId, LocalDate date) {
        Field field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Field not found"));

        DayOfWeek day = date.getDayOfWeek();

        List<FieldAvailability> availabilities = availabilityRepository.findByFieldAndDayOfWeek(field, day);
        List<Booking> bookings = bookingRepository.findByFieldAndDate(field, date);

        Set<LocalTime> bookedStartTimes = bookings.stream()
                .map(Booking::getStartTime)
                .collect(Collectors.toSet());

        List<TimeSlotDTO> freeSlots = new ArrayList<>();

        for (FieldAvailability availability : availabilities) {
            LocalTime start = availability.getStartTime();
            LocalTime end = availability.getEndTime();

            while (start.plusHours(1).compareTo(end) <= 0) {
                if (!bookedStartTimes.contains(start)) {
                    freeSlots.add(new TimeSlotDTO(start, start.plusHours(1)));
                }
                start = start.plusHours(1);
            }
        }
        return freeSlots;
    }
}
