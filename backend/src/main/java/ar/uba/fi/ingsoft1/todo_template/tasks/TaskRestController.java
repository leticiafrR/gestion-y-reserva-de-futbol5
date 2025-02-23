package ar.uba.fi.ingsoft1.todo_template.tasks;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
class TaskRestController {

    private final TaskService taskService;

    @Autowired
    TaskRestController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    @Operation(summary = "Get a list of tasks")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Returning task list",
                    content = { @Content(
                            mediaType = "application/json",
                            array = @ArraySchema(
                                    schema = @Schema(implementation = TaskDTO.class)
                            )
                    )}
            )
    })
    List<TaskDTO> getTasks(@ParameterObject Pageable pageable) {
        return taskService.getTasks(pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a task by its id")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Found the task",
                    content = { @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = TaskDTO.class)
                    )}
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid id supplied",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Task not found",
                    content = @Content
            )
    })
    ResponseEntity<TaskDTO> getTask(@PathVariable long id) {
        return ResponseEntity.of(taskService.getTask(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new task")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Created the task",
                    content = { @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = TaskDTO.class)
                    )}
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid data supplied",
                    content = @Content
            )
    })
    TaskDTO createTask(@RequestBody TaskCreateDTO taskCreate) {
        return taskService.createTask(taskCreate);
    }
}
