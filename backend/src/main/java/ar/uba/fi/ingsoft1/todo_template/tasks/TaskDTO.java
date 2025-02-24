package ar.uba.fi.ingsoft1.todo_template.tasks;

import ar.uba.fi.ingsoft1.todo_template.projects.ProjectDTO;

record TaskDTO(
        long id,
        String title,
        String description,
        ProjectDTO project
) {
    TaskDTO(Task task) {
        this(task.getId(), task.getTitle(), task.getDescription(), new ProjectDTO(task.getProject()));
    }
}
