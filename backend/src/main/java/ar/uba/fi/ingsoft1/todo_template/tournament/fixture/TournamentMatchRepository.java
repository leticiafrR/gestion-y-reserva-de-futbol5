package ar.uba.fi.ingsoft1.todo_template.tournament.fixture;

import ar.uba.fi.ingsoft1.todo_template.tournament.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface TournamentMatchRepository extends JpaRepository<TournamentMatch, Long> {
    List<TournamentMatch> findAllByTournamentOrderByRoundNumberAscMatchNumberAsc(Tournament tournament);

    @Query("SELECT m FROM Match m WHERE m.tournament = ?1 AND m.status = 'SCHEDULED' ORDER BY m.scheduledDateTime ASC")
    List<TournamentMatch> findUpcoming(Tournament tournament);

    @Query("SELECT m FROM Match m WHERE m.tournament = ?1 AND m.status = 'COMPLETED' ORDER BY m.scheduledDateTime DESC")
    List<TournamentMatch> findCompleted(Tournament tournament);

    List<TournamentMatch> findByTournamentAndRoundNumberOrderByMatchNumberAsc(Tournament tournament, int roundNumber);
} 