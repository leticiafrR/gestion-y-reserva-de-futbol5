package ar.uba.fi.ingsoft1.todo_template.projects;

public record ProjectDTO(
        long id,
        String name,
        String description
) {
    public ProjectDTO(Project project) {
        this(project.getId(), project.getName(), project.getDescription());
    }
}
