package ar.uba.fi.ingsoft1.todo_template.tasks;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
class TaskService {

    private final TaskRepository taskRepository;

    TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    Page<TaskDTO> getTasks(Pageable pageable) {
        return taskRepository.findAll(pageable).map(TaskDTO::new);
    }

    Optional<TaskDTO> getTask(long id) {
        return taskRepository.findById(id).map(TaskDTO::new);
    }

    TaskDTO createTask(TaskCreateDTO taskCreate) {
        return new TaskDTO(taskRepository.save(taskCreate.asTask()));
    }

    Optional<TaskDTO> updateTask(long id, TaskCreateDTO taskCreate) {
        if (!taskRepository.existsById(id)) {
            return Optional.empty();
        }
        var saved = taskRepository.save(taskCreate.asTask(id));
        return Optional.of(new TaskDTO(saved));
    }

    void deleteTask(long id) {
        taskRepository.deleteById(id);
    }
}
