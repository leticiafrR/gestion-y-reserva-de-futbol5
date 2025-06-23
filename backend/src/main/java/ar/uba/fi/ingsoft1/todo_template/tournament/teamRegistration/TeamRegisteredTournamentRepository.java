package ar.uba.fi.ingsoft1.todo_template.tournament.teamRegistration;

import org.springframework.data.jpa.repository.JpaRepository;

import ar.uba.fi.ingsoft1.todo_template.tournament.Tournament;

import java.util.List;

public interface TeamRegisteredTournamentRepository extends JpaRepository<TeamRegisteredTournament, TeamTournamentId> {
    List<TeamRegisteredTournament> findByTournament(Tournament tournament);
}