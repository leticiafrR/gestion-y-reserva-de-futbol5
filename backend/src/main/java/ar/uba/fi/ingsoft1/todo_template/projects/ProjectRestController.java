package ar.uba.fi.ingsoft1.todo_template.projects;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/projects")
@Tag(name = "Projects")
public class ProjectRestController {

    private final ProjectService projectService;

    @Autowired
    ProjectRestController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping(produces = "application/json")
    @Operation(summary = "Get a list of projects")
    @ResponseStatus(HttpStatus.OK)
    Page<ProjectDTO> getProjects(
            @Valid @ParameterObject Pageable pageable
    ) throws MethodArgumentNotValidException {
        return projectService.getProjects(pageable);
    }

    @GetMapping(value = "/{id}", produces = "application/json")
    @Operation(summary = "Get a project by its id")
    @ResponseStatus(HttpStatus.OK)
    @ApiResponse(responseCode = "404", description = "Project not found", content = @Content)
    ResponseEntity<ProjectDTO> getProject(
            @Valid @PathVariable @Positive long id
    ) throws MethodArgumentNotValidException {
        return ResponseEntity.of(projectService.getProject(id));
    }

    @PostMapping(produces = "application/json")
    @Operation(summary = "Create a new project")
    @ResponseStatus(HttpStatus.CREATED)
    ProjectDTO createProject(
            @Valid @RequestBody ProjectCreateDTO projectCreate
    ) throws MethodArgumentNotValidException {
        return projectService.createProject(projectCreate);
    }

    @PutMapping(value = "/{id}", produces = "application/json")
    @Operation(summary = "Update a project")
    @ResponseStatus(HttpStatus.OK)
    @ApiResponse(responseCode = "404", description = "Project not found", content = @Content)
    ResponseEntity<ProjectDTO> putProject(
            @Valid @PathVariable @Positive long id,
            @Valid @RequestBody ProjectCreateDTO projectCreate
    ) throws MethodArgumentNotValidException {
        return ResponseEntity.of(projectService.updateProject(id, projectCreate));
    }

    @DeleteMapping(value = "/{id}")
    @Operation(summary = "Delete a project")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void deleteProject(
            @Valid @PathVariable @Positive long id
    ) throws MethodArgumentNotValidException {
        projectService.deleteProject(id);
    }
}
