package ar.uba.fi.ingsoft1.todo_template.timeslot;

import ar.uba.fi.ingsoft1.todo_template.booking.Booking;
import ar.uba.fi.ingsoft1.todo_template.booking.BookingRepository;
import ar.uba.fi.ingsoft1.todo_template.field.Field;
import ar.uba.fi.ingsoft1.todo_template.field.FieldRepository;

import ar.uba.fi.ingsoft1.todo_template.field.FieldService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TimeSlotService {

    private final TimeSlotRepository timeslotRepository;
    private final FieldService fieldService;


    public TimeSlotService(TimeSlotRepository repository, FieldService fieldService) {
        this.timeslotRepository = repository;
        this.fieldService = fieldService;
    }


    @Autowired
    private BookingRepository bookingRepository;

    public Map<LocalDate, List<Integer>> getAvailableHours(Long fieldId, int daysAhead) {
        Field field = fieldService.getFieldByIdOrThrow(fieldId);

        Map<LocalDate, List<Integer>> availability = new LinkedHashMap<>();
        LocalDate today = LocalDate.now();

        for (int i = 0; i < daysAhead; i++) {
            LocalDate date = today.plusDays(i);
            DayOfWeek day = date.getDayOfWeek();

            TimeSlot timeslot = timeslotRepository.findByFieldIdAndDayOfWeek(fieldId, day);
            if (timeslot == null) {
                availability.put(date, List.of());
                continue;
            }

            Set<Integer> reservedHours = bookingRepository.findByTimeSlot_Field_IdAndActiveTrue(fieldId).stream()
                    .filter(b -> b.getBookingDate().isEqual(date))
                    .map(Booking::getBookingHour)
                    .collect(Collectors.toSet());

            List<Integer> availableHours = new ArrayList<>();

            for (int hour = timeslot.getOpenTime(); hour < timeslot.getCloseTime(); hour++) {
                if (!reservedHours.contains(hour)) {
                    availableHours.add(hour);
                }
            }
            availability.put(date, availableHours);
        }

        return availability;
    }


    public List<TimeSlot> getTimeSlotsByField(Long fieldId) {
        return timeslotRepository.findByFieldIdOrderByDayOfWeekAscOpenTimeAsc(fieldId);
    }

    public TimeSlot getTimeSlotByFieldAndDay(Long fieldId, DayOfWeek day) {
        return timeslotRepository.findByFieldIdAndDayOfWeek(fieldId, day);
    }

    @Transactional
    public void replaceAllTimeSlots(Long fieldId, List<TimeSlotDTO> newSlots) {
        newSlots.forEach(this::validateSlot);

        Field field = fieldService.getFieldByIdOrThrow(fieldId);

        timeslotRepository.deleteByFieldId(fieldId);

        List<TimeSlot> slots = newSlots.stream()
                .map(dto -> TimeSlot.builder()
                        .field(field)
                        .dayOfWeek(dto.dayOfWeek())
                        .openTime(dto.openTime())
                        .closeTime(dto.closeTime())
                        .build())
                .toList();


        timeslotRepository.saveAll(slots);
    }

    @Transactional
    public void replaceDayTimeSlot(Long fieldId, DayOfWeek day, TimeSlotDTO dto) {
        validateSlot(dto);
        timeslotRepository.deleteByFieldIdAndDayOfWeek(fieldId, day);
        Field field = fieldService.getFieldByIdOrThrow(fieldId);

        TimeSlot slot = TimeSlot.builder()
                .field(field)
                .dayOfWeek(day)
                .openTime(dto.openTime())
                .closeTime(dto.closeTime())
                .build();

        timeslotRepository.save(slot);
    }


    private void validateSlot(TimeSlotDTO dto) {
        if (dto.closeTime() <= dto.openTime()) {
            throw new IllegalArgumentException("Opening time must be before closing time.");
        }
    }

    public TimeSlot findByIdOrThrow(Long id) {
        return timeslotRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Time slot not found"));
    }
}
