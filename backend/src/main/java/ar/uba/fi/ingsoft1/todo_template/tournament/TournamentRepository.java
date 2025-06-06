package ar.uba.fi.ingsoft1.todo_template.tournament;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TournamentRepository extends JpaRepository<Tournament, Long> {
    boolean existsByName(String name);
}
