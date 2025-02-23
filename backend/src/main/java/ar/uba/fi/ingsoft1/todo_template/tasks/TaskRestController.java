package ar.uba.fi.ingsoft1.todo_template.tasks;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/tasks")
@Tag(name = "Tasks")
class TaskRestController {

    private final TaskService taskService;

    @Autowired
    TaskRestController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping(produces = "application/json")
    @Operation(summary = "Get a list of tasks")
    @ResponseStatus(HttpStatus.OK)
    List<TaskDTO> getTasks(@Valid @ParameterObject Pageable pageable) throws MethodArgumentNotValidException {
        return taskService.getTasks(pageable);
    }

    @GetMapping(value = "/{id}", produces = "application/json")
    @Operation(summary = "Get a task by its id")
    @ResponseStatus(HttpStatus.OK)
    @ApiResponse(responseCode = "404", description = "Task not found", content = @Content)
    ResponseEntity<TaskDTO> getTask(@Valid @PathVariable @Positive long id) throws MethodArgumentNotValidException {
        return ResponseEntity.of(taskService.getTask(id));
    }

    @PostMapping(produces = "application/json")
    @Operation(summary = "Create a new task")
    @ResponseStatus(HttpStatus.CREATED)
    TaskDTO createTask(@Valid @RequestBody TaskCreateDTO taskCreate) throws MethodArgumentNotValidException {
        return taskService.createTask(taskCreate);
    }
}
