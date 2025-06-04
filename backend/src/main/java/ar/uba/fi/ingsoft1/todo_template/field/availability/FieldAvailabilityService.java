package ar.uba.fi.ingsoft1.todo_template.field.availability;

import ar.uba.fi.ingsoft1.todo_template.field.Field;
import ar.uba.fi.ingsoft1.todo_template.field.FieldRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class FieldAvailabilityService {

    private final FieldAvailabilityRepository availabilityRepository;
    private final FieldRepository fieldRepository;

    public FieldAvailabilityService(FieldAvailabilityRepository availabilityRepository, FieldRepository fieldRepository) {
        this.availabilityRepository = availabilityRepository;
        this.fieldRepository = fieldRepository;
    }

    public void setAvailability(Long fieldId, List<FieldAvailabilityDTO> configs) {
        Field field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Field not found"));


        availabilityRepository.deleteAll(availabilityRepository.findByField(field));


        if (configs.isEmpty()) return;

        List<FieldAvailability> result = new ArrayList<>();

        for (FieldAvailabilityDTO config : configs) {
            validateHourAlignment(config);

            LocalTime time = config.openTime();
            while (time.plusHours(1).compareTo(config.closeTime()) <= 0) {
                result.add(new FieldAvailability(field, config.dayOfWeek(), time, time.plusHours(1)));
                time = time.plusHours(1);
            }
        }

        availabilityRepository.saveAll(result);
    }

    private void validateHourAlignment(FieldAvailabilityDTO dto) {
        if (!(dto.openTime().getMinute() == 0) || !(dto.closeTime().getMinute() == 0)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Las horas deben comenzar en punto (ej. 10:00)");
        }
        if (dto.openTime().isAfter(dto.closeTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El horario de apertura debe ser anterior al cierre");
        }
    }


    public List<FieldAvailabilityDTO> getAvailability(Long fieldId) {
        Field field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Field not found."));

        return availabilityRepository.findByField(field).stream()
                .map(av -> new FieldAvailabilityDTO(av.getDayOfWeek(), av.getStartTime(), av.getEndTime()))
                .toList();
    }
}
