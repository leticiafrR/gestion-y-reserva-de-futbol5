package ar.uba.fi.ingsoft1.todo_template.projects;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
class ProjectService {

    private final ProjectRepository projectRepository;

    @Autowired
    ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    Page<ProjectDTO> getProjects(Pageable pageable) {
        return projectRepository.findAll(pageable).map(ProjectDTO::new);
    }

    Optional<ProjectDTO> getProject(long id) {
        return projectRepository.findById(id).map(ProjectDTO::new);
    }

    ProjectDTO createProject(ProjectCreateDTO projectCreate) {
        return new ProjectDTO(projectRepository.save(projectCreate.asProject()));
    }

    Optional<ProjectDTO> updateProject(long id, ProjectCreateDTO projectCreate) {
        if (!projectRepository.existsById(id)) {
            return Optional.empty();
        }
        var saved = projectRepository.save(projectCreate.asProject(id));
        return Optional.of(new ProjectDTO(saved));
    }

    void deleteProject(long id) {
        projectRepository.deleteById(id);
    }
}
