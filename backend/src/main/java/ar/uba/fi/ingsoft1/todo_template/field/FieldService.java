package ar.uba.fi.ingsoft1.todo_template.field;

import ar.uba.fi.ingsoft1.todo_template.user.User;
import ar.uba.fi.ingsoft1.todo_template.user.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class FieldService {

    private final FieldRepository fieldRepository;
    private final UserService userService;

    public FieldService(FieldRepository fieldRepository, UserService userService) {
        this.fieldRepository = fieldRepository;
        this.userService = userService;
    }

    public Field createField(FieldCreateDTO dto, String ownerUsername) {
        if (fieldRepository.existsByNameAndAddress(dto.name(), dto.address())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ya existe una cancha con ese nombre y dirección.");
        }

        User owner = userService.getByUsername(ownerUsername);

        Field field = new Field();
        field.setName(dto.name());
        field.setGrassType(dto.grassType());
        field.setLighting(dto.lighting());
        field.setZone(dto.zone());
        field.setPhotoUrl(dto.photoUrl());
        field.setPrice(dto.price());
        field.setAddress(dto.address());
        field.setOwner(owner);

        return fieldRepository.save(field);
    }

    public Field updateField(Long id, FieldUpdateDTO dto, String ownerUsername) {
        User owner = userService.getByUsername(ownerUsername);

        Field field = fieldRepository.findByIdAndOwner(id, owner)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Field not found or does not belong to user."));

        if (fieldRepository.existsByNameAndAddressAndIdNot(dto.name(), dto.address(), id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Field with that name and address already exists.");
        }

        field.setName(dto.name());
        field.setGrassType(dto.grassType());
        field.setLighting(dto.lighting());
        field.setZone(dto.zone());
        field.setPhotoUrl(dto.photoUrl());
        field.setPrice(dto.price());
        field.setAddress(dto.address());

        return fieldRepository.save(field);
    }

    public void deleteField(Long id, String ownerUsername) {
        User owner = userService.getByUsername(ownerUsername);

        Field field = fieldRepository.findByIdAndOwner(id, owner)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Field not found or does not belong to user."));

        fieldRepository.delete(field);
    }

    public Field setFieldActiveStatus(Long id, String ownerUsername, boolean active) {
        User owner = userService.getByUsername(ownerUsername);

        Field field = fieldRepository.findByIdAndOwner(id, owner)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Field not found or does not belong to user."));

        field.setActive(active);
        return fieldRepository.save(field);
    }

    public List<Field> getFieldsOf(String ownerUsername) {
        User owner = userService.getByUsername(ownerUsername);
        return fieldRepository.findByOwner(owner);
    }

    public List<Field> getAllActiveFields() {
        return fieldRepository.findByActiveTrue();
    }

    public Field getFieldByIdOrThrow(Long id) {
        return fieldRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Field not found"));
    }
}
