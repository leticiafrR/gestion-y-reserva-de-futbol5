package ar.uba.fi.ingsoft1.todo_template.tournament;

import java.util.List;
import java.util.Optional;

import ar.uba.fi.ingsoft1.todo_template.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TournamentRepository extends JpaRepository<Tournament, Long> {
    boolean existsByName(String name);

    Optional<Tournament> findByName(String name);

    List<Tournament> findByOrganizer(User organizer);
}
