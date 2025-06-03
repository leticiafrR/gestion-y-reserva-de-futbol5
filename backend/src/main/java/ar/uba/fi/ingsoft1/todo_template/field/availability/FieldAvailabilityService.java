package ar.uba.fi.ingsoft1.todo_template.field.availability;

import ar.uba.fi.ingsoft1.todo_template.field.Field;
import ar.uba.fi.ingsoft1.todo_template.field.FieldRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class FieldAvailabilityService {

    private final FieldAvailabilityRepository availabilityRepository;
    private final FieldRepository fieldRepository;

    public FieldAvailabilityService(FieldAvailabilityRepository availabilityRepository, FieldRepository fieldRepository) {
        this.availabilityRepository = availabilityRepository;
        this.fieldRepository = fieldRepository;
    }

    public void setAvailability(Long fieldId, List<FieldAvailabilityDTO> slots) {
        Field field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Field not found."));

        availabilityRepository.deleteAll(availabilityRepository.findByField(field));

        List<FieldAvailability> nuevos = slots.stream()
                .map(dto -> new FieldAvailability(field, dto.dayOfWeek(), dto.startTime(), dto.endTime()))
                .toList();

        availabilityRepository.saveAll(nuevos);
    }

    public List<FieldAvailabilityDTO> getAvailability(Long fieldId) {
        Field field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Field not found."));

        return availabilityRepository.findByField(field).stream()
                .map(av -> new FieldAvailabilityDTO(av.getDayOfWeek(), av.getStartTime(), av.getEndTime()))
                .toList();
    }
}
