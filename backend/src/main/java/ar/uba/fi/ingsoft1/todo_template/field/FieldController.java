package ar.uba.fi.ingsoft1.todo_template.field;

import ar.uba.fi.ingsoft1.todo_template.config.security.JwtUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/fields")
@Validated
public class FieldController {

    private final FieldService fieldService;

    public FieldController(FieldService fieldService) {
        this.fieldService = fieldService;
    }

    @PostMapping
    public ResponseEntity<Field> createField(@Valid @RequestBody FieldCreateDTO dto) {
        JwtUserDetails user = getAuthenticatedUser();
        Field field = fieldService.createField(dto, user.username());
        return ResponseEntity.ok(field);
    }

    @GetMapping
    public List<Field> listMyFields() {
        JwtUserDetails user = getAuthenticatedUser();
        return fieldService.getFieldsOf(user.username());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Field> updateField(@PathVariable Long id, @Valid @RequestBody FieldUpdateDTO dto) {
        JwtUserDetails user = getAuthenticatedUser();
        return ResponseEntity.ok(fieldService.updateField(id, dto, user.username()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteField(@PathVariable Long id) {
        JwtUserDetails user = getAuthenticatedUser();
        Field field = fieldService.deleteField(id, user.username());
        return ResponseEntity.noContent().build();
    }


    private JwtUserDetails getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (JwtUserDetails) authentication.getPrincipal();
    }
}