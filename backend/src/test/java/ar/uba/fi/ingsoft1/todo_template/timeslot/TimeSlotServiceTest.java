package ar.uba.fi.ingsoft1.todo_template.timeslot;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import static org.junit.jupiter.api.Assertions.assertEquals;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import ar.uba.fi.ingsoft1.todo_template.blockedslot.BlockedSlot;
import ar.uba.fi.ingsoft1.todo_template.blockedslot.BlockedSlotRepository;
import ar.uba.fi.ingsoft1.todo_template.field.Field;
import ar.uba.fi.ingsoft1.todo_template.field.FieldRepository;
import ar.uba.fi.ingsoft1.todo_template.booking.Booking;
import ar.uba.fi.ingsoft1.todo_template.booking.BookingRepository;

@ExtendWith(MockitoExtension.class)
class TimeSlotServiceTest {

    @Mock
    private TimeSlotRepository timeslotRepository;

    @Mock
    private FieldRepository fieldRepository;

    @Mock
    private BlockedSlotRepository blockedSlotRepository;

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private TimeSlotService timeSlotService;

    private static final Long FIELD_ID = 1L;
    private static final LocalDate TEST_DATE = LocalDate.of(2025, 6, 20);

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(timeSlotService, "bookingRepository", bookingRepository);
    }

    /**
     * Verifica que getAvailableHours lanza IllegalArgumentException cuando se
     * intenta obtener horas disponibles
     * para un campo que no existe en el sistema.
     */
    @Test
    void getAvailableHours_returnsEmptyList_whenFieldNotFound() {
        when(fieldRepository.findById(FIELD_ID)).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> {
            timeSlotService.getAvailableHours(FIELD_ID, 7);
        });
    }

    /**
     * Verifica que replaceAllTimeSlots lanza IllegalArgumentException cuando se
     * intenta reemplazar todos los
     * slots de un campo que no existe en el sistema.
     */
    @Test
    void replaceAllTimeSlots_throwsException_whenFieldNotFound() {
        when(fieldRepository.findById(FIELD_ID)).thenReturn(Optional.empty());
        List<TimeSlotDTO> slots = List.of(new TimeSlotDTO(DayOfWeek.MONDAY, 9, 18));

        assertThrows(IllegalArgumentException.class, () -> {
            timeSlotService.replaceAllTimeSlots(FIELD_ID, slots);
        });
    }

    /**
     * Verifica que replaceDayTimeSlot funciona correctamente al reemplazar los
     * slots de un día específico
     * para un campo existente, verificando que el día asociado a dicho slot se
     * modifique correctamente.
     */
    @Test
    void replaceDayTimeSlot_replacesSlotSuccessfully() {
        Field field = mock(Field.class);
        when(fieldRepository.findById(FIELD_ID)).thenReturn(Optional.of(field));

        TimeSlotDTO dto = new TimeSlotDTO(
                DayOfWeek.MONDAY,
                9,
                18);

        timeSlotService.replaceDayTimeSlot(FIELD_ID, DayOfWeek.MONDAY, dto);

        verify(timeslotRepository).deleteByFieldIdAndDayOfWeek(FIELD_ID, DayOfWeek.MONDAY);
        verify(timeslotRepository).save(any(TimeSlot.class));// verifica que haya sido guardado en la base de datos
    }

    /**
     * Verifica que al reemplazar un día, los detalles del slot (horario) se
     * mantienen
     * igual, solo cambiando el día de la semana.
     */
    @Test
    void replaceDayTimeSlot_maintainsSlotDetails() {
        Field field = mock(Field.class);
        when(fieldRepository.findById(FIELD_ID)).thenReturn(Optional.of(field));

        TimeSlotDTO originalDto = new TimeSlotDTO(
                DayOfWeek.TUESDAY,
                9,
                18);
        TimeSlotDTO newDto = new TimeSlotDTO(
                DayOfWeek.MONDAY,
                9,
                18);

        TimeSlot existingSlot = new TimeSlot();
        existingSlot.setField(field);
        existingSlot.setDayOfWeek(DayOfWeek.TUESDAY);
        existingSlot.setOpenTime(9);
        existingSlot.setCloseTime(18);

        timeSlotService.replaceDayTimeSlot(FIELD_ID, DayOfWeek.MONDAY, newDto);
        verify(timeslotRepository).deleteByFieldIdAndDayOfWeek(FIELD_ID, DayOfWeek.MONDAY);
        verify(timeslotRepository).save(any(TimeSlot.class));

    }

    /**
     * Verifica que replaceDayTimeSlot lanza IllegalArgumentException cuando se
     * intenta reemplazar los slots
     * de un día específico para un campo que no existe en el sistema.
     */
    @Test
    void replaceDayTimeSlot_throwsException_whenFieldNotFound() {
        when(fieldRepository.findById(FIELD_ID)).thenReturn(Optional.empty());
        TimeSlotDTO dto = new TimeSlotDTO(
                DayOfWeek.MONDAY,
                9,
                18);

        assertThrows(IllegalArgumentException.class, () -> {
            timeSlotService.replaceDayTimeSlot(FIELD_ID, DayOfWeek.MONDAY, dto);
        });
    }

    /**
     * Verifica que findByIdOrThrow lanza IllegalArgumentException cuando se intenta
     * encontrar un time slot
     * que no existe en el sistema.
     */
    @Test
    void findByIdOrThrow_throwsException_whenTimeSlotNotFound() {
        when(timeslotRepository.findById(any(Long.class))).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> {
            timeSlotService.findByIdOrThrow(1L);
        });
    }

}
