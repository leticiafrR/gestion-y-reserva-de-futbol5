package ar.uba.fi.ingsoft1.todo_template.tournament;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
public interface TeamRegisteredTournamentRepository extends JpaRepository<TeamRegisteredTournament, TeamTournamentId> {
    List<TeamRegisteredTournament> findByTournament(Tournament tournament);
}