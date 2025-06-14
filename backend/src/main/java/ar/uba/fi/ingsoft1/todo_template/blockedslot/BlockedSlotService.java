package ar.uba.fi.ingsoft1.todo_template.blockedslot;

import ar.uba.fi.ingsoft1.todo_template.field.Field;
import ar.uba.fi.ingsoft1.todo_template.field.FieldRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class BlockedSlotService {

    private final BlockedSlotRepository blockedSlotRepository;
    private final FieldRepository fieldRepository;

    public void setBlockedSlot(Long fieldId, LocalDate date, Integer hour, String user) {
        Field field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cancha no encontrada"));

        if (!field.getOwner().getUsername().equals(user)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No sos el dueño de esta cancha.");
        }

        boolean yaBloqueado = blockedSlotRepository.findByFieldIdAndDate(fieldId, date).stream()
                .anyMatch(slot -> slot.getHour().equals(hour));

        if (yaBloqueado) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya está bloqueado ese horario.");
        }

        BlockedSlot slot = BlockedSlot.builder()
                .field(field)
                .date(date)
                .hour(hour)
                .build();

        blockedSlotRepository.save(slot);
    }

    public void deleteBlockedSlot(Long blockedSlotId, String user) {
        BlockedSlot slot = blockedSlotRepository.findById(blockedSlotId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Horario bloqueado no encontrado"));

        Field field = slot.getField();

        if (!field.getOwner().getUsername().equals(user)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No sos el dueño de esta cancha.");
        }

        blockedSlotRepository.delete(slot);
    }

}
