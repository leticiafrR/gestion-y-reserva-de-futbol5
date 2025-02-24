package ar.uba.fi.ingsoft1.todo_template.tasks;

import ar.uba.fi.ingsoft1.todo_template.projects.Project;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class Task {

    @Id
    @GeneratedValue
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column
    private String description;

    @ManyToOne
    private Project project;

    Task() {}

    Task(Long id, String title, String description, Project project) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.project = project;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public Project getProject() {
        return project;
    }
}
