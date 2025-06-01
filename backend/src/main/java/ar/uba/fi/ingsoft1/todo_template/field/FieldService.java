package ar.uba.fi.ingsoft1.todo_template.field;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.util.List;

@Service
public class FieldService {

    private final FieldRepository fieldRepository;

    public FieldService(FieldRepository fieldRepository) {
        this.fieldRepository = fieldRepository;
    }

    public Field createField(FieldCreateDTO dto, String ownerEmail) {
        if (fieldRepository.existsByNameAndAddress(dto.name, dto.address)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Field with same name and address already exists.");
        }

        Field field = new Field();
        field.setName(dto.name);
        field.setGrassType(dto.grassType);
        field.setLighting(dto.lighting);
        field.setZone(dto.zone);
        field.setAddress(dto.address);
        field.setPhotoUrl(dto.photoUrl);
        field.setOwnerEmail(ownerEmail);

        return fieldRepository.save(field);
    }

    public Field updateField(Long id, FieldUpdateDTO dto, String ownerEmail) {
        Field field = fieldRepository.findByIdAndOwnerEmail(id, ownerEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Field not found or you do not own it."));

        if (fieldRepository.existsByNameAndAddressAndIdNot(dto.name, dto.address, id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Field with same name and address already exists.");
        }

        field.setName(dto.name);
        field.setGrassType(dto.grassType);
        field.setLighting(dto.lighting);
        field.setZone(dto.zone);
        field.setAddress(dto.address);
        field.setPhotoUrl(dto.photoUrl);

        return fieldRepository.save(field);
    }
public Field deleteField(Long id, String ownerEmail) {
        Field field = fieldRepository.findByIdAndOwnerEmail(id, ownerEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Field not found or you do not own it."));

        field.setIdle();
        return fieldRepository.save(field);
    }

    public List<Field> getFieldsOf(String ownerEmail) {
        return fieldRepository.findByOwnerEmail(ownerEmail);
    }
}
