package ar.uba.fi.ingsoft1.todo_template.tasks;

import ar.uba.fi.ingsoft1.todo_template.common.exception.ItemNotFoundException;
import ar.uba.fi.ingsoft1.todo_template.projects.ProjectRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;

    TaskService(TaskRepository taskRepository, ProjectRepository projectRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
    }

    Page<TaskDTO> getTasks(Pageable pageable) {
        return taskRepository.findAll(pageable).map(TaskDTO::new);
    }

    TaskDTO getTask(long id) throws ItemNotFoundException {
        var task = taskRepository.findById(id).orElseThrow(() -> new ItemNotFoundException("task", id));
        return new TaskDTO(task);
    }

    TaskDTO createTask(TaskCreateDTO taskCreate) throws ItemNotFoundException {
        return new TaskDTO(taskRepository.save(taskCreate.asTask(projectRepository::findById)));
    }

    Optional<TaskDTO> updateTask(long id, TaskCreateDTO taskCreate) throws ItemNotFoundException {
        if (!taskRepository.existsById(id)) {
            return Optional.empty();
        }
        var saved = taskRepository.save(taskCreate.asTask(id, projectRepository::findById));
        return Optional.of(new TaskDTO(saved));
    }

    void deleteTask(long id) {
        taskRepository.deleteById(id);
    }
}
