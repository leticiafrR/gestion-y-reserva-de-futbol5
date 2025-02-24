package ar.uba.fi.ingsoft1.todo_template.projects;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProjectCreateDTO(
        @NotBlank @Size(min = 1, max = 100) String name,
        @Size(min = 1, max = 100) String description
) {
    public Project asProject() {
        return this.asProject(null);
    }

    public Project asProject(Long id) {
        return new Project(id, this.name, this.description);
    }
}
