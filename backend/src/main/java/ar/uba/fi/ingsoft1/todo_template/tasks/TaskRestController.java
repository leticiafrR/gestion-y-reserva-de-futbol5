package ar.uba.fi.ingsoft1.todo_template.tasks;

import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/tasks")
public class TaskRestController {

    @GetMapping
    public List<TaskDTO> getTasks(
            @ParameterObject Pageable pageable
    ) {
        return List.of(new TaskDTO("Hello World", null));
    }
}
