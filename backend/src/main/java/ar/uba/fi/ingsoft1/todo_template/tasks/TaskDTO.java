package ar.uba.fi.ingsoft1.todo_template.tasks;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

record TaskDTO(
        @NotNull
        @Positive
        long id,

        @NotBlank
        @Size(min = 1, max = 100)
        String title,

        @Size(min = 1, max = 100)
        String description
) {
        TaskDTO(Task task) {
                this(task.getId(), task.getTitle(), task.getDescription());
        }
}
