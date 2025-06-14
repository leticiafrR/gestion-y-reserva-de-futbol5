package ar.uba.fi.ingsoft1.todo_template.tournament;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TournamentRepository extends JpaRepository<Tournament, Long> {
    boolean existsByName(String name);

    Optional<Tournament> findByName(String name);
}
