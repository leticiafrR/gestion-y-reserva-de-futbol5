package ar.uba.fi.ingsoft1.todo_template.tasks;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
class TaskService {
    private final Map<Long, TaskDTO> tasks = new HashMap<>();

    List<TaskDTO> getTasks(Pageable pageable) {
        return tasks.values().stream()
                .sorted(Comparator.comparing(TaskDTO::title))
                .skip(pageable.getOffset())
                .limit(pageable.getPageSize())
                .toList();
    }

    Optional<TaskDTO> getTask(long id) {
        return Optional.ofNullable(tasks.get(id));
    }

    TaskDTO createTask(TaskCreateDTO taskCreate) {
        var key = tasks.keySet().stream().max(Long::compare).orElse(0L) + 1L;
        var task = new TaskDTO(key, taskCreate.title(), taskCreate.description());
        tasks.put(key, task);
        return task;
    }
}
