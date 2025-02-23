package ar.uba.fi.ingsoft1.todo_template.tasks;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TaskCreateDTO(
        @NotBlank @Size(min = 1, max = 100) String title,
        @Size(min = 1, max = 100) String description
) {
    public Task asTask() {
        return new Task(title, description);
    }
}
