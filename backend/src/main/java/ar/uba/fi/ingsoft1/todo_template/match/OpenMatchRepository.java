package ar.uba.fi.ingsoft1.todo_template.match;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface OpenMatchRepository extends JpaRepository<OpenMatch, Long> {
    List<OpenMatch> findByIsActiveTrue();
}
