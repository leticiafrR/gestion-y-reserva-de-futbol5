package ar.uba.fi.ingsoft1.todo_template.tasks;

import ar.uba.fi.ingsoft1.todo_template.common.exception.ItemNotFoundException;
import ar.uba.fi.ingsoft1.todo_template.projects.Project;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.util.Optional;
import java.util.function.LongFunction;

public record TaskCreateDTO(
        @NotBlank @Size(min = 1, max = 100) String title,
        @Size(min = 1, max = 100) String description,
        @Positive Long projectId
) {
    public Task asTask(LongFunction<Optional<Project>> getProject) throws ItemNotFoundException {
        return this.asTask(null, getProject);
    }

    public Task asTask(Long id, LongFunction<Optional<Project>> getProject) throws ItemNotFoundException {
        var project = projectId == null
                ? null
                : getProject.apply(projectId).orElseThrow(() -> new ItemNotFoundException("project", projectId));
        return new Task(id, title, description, project);
    }
}
