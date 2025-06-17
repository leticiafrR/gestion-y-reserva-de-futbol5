package ar.uba.fi.ingsoft1.todo_template.tournament;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamRegisteredTournamentRepository extends JpaRepository<TeamRegisteredTournament, TeamTournamentId> {

}