package ar.uba.fi.ingsoft1.todo_template.team;

import ar.uba.fi.ingsoft1.todo_template.team.DTO.TeamCreateDTO;
import ar.uba.fi.ingsoft1.todo_template.team.DTO.TeamUpdateDTO;
import ar.uba.fi.ingsoft1.todo_template.team.invitation.Invitation;
import ar.uba.fi.ingsoft1.todo_template.team.invitation.InvitationService;
import ar.uba.fi.ingsoft1.todo_template.user.User;
import ar.uba.fi.ingsoft1.todo_template.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class TeamServiceTest {
    @Mock
    private TeamRepository teamRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private InvitationService invitationService;
    @Mock
    private Authentication authentication;
    @InjectMocks
    private TeamService teamService;

    private final String username = "testuser";
    private User user;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        user = new User();
        user.setUsername(username);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        when(authentication.getPrincipal())
                .thenReturn(new ar.uba.fi.ingsoft1.todo_template.config.security.JwtUserDetails(username, "JUGADOR"));
    }

    @Test
    void getAllTeams_returnsTeams() {
        when(teamRepository.findAllWithMembers()).thenReturn(List.of(new Team()));
        List<Team> result = teamService.getAllTeams();
        assertFalse(result.isEmpty());
    }

    @Test
    void getUsersTeams_returnsTeamsForUser() {
        user.setId(1L);
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(teamRepository.findAllByMemberIdFetchMembers(1L)).thenReturn(List.of(new Team()));
        List<Team> result = teamService.getUsersTeams();
        assertFalse(result.isEmpty());
    }

    @Test
    void getUsersTeams_userNotFound_throws() {
        when(userRepository.findByUsername(username)).thenReturn(Optional.empty());
        assertThrows(UsernameNotFoundException.class, () -> teamService.getUsersTeams());
    }

    @Test
    void createTeam_success() {
        TeamCreateDTO dto = mock(TeamCreateDTO.class);
        when(dto.getName()).thenReturn("EquipoX");
        when(teamRepository.findByName("EquipoX")).thenReturn(Optional.empty());
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        Team team = new Team();
        when(dto.toTeam(user)).thenReturn(team);
        when(teamRepository.save(team)).thenReturn(team);
        Team result = teamService.createTeam(dto);
        assertNotNull(result);
    }

    @Test
    void createTeam_duplicateName_throws() {
        TeamCreateDTO dto = mock(TeamCreateDTO.class);
        when(dto.getName()).thenReturn("EquipoX");
        when(teamRepository.findByName("EquipoX")).thenReturn(Optional.of(new Team()));
        assertThrows(ResponseStatusException.class, () -> teamService.createTeam(dto));
    }

    @Test
    void updateTeam_success() {
        TeamUpdateDTO dto = mock(TeamUpdateDTO.class);
        Team team = new Team();
        team.setCaptain(username);
        team.setName("A");
        when(teamRepository.findById(1L)).thenReturn(Optional.of(team));
        when(dto.getName()).thenReturn("A");
        when(teamRepository.save(any())).thenReturn(team);
        Optional<Team> result = teamService.updateTeam(1L, dto);
        assertTrue(result.isPresent());
    }

    @Test
    void updateTeam_notCaptain_throws() {
        TeamUpdateDTO dto = mock(TeamUpdateDTO.class);
        Team team = new Team();
        team.setCaptain("otro");
        when(teamRepository.findById(1L)).thenReturn(Optional.of(team));
        assertThrows(ResponseStatusException.class, () -> teamService.updateTeam(1L, dto));
    }

    @Test
    void updateTeam_nameConflict_throws() {
        TeamUpdateDTO dto = mock(TeamUpdateDTO.class);
        Team team = new Team();
        team.setCaptain(username);
        team.setName("A");
        when(teamRepository.findById(1L)).thenReturn(Optional.of(team));
        when(dto.getName()).thenReturn("B");
        when(teamRepository.findByName("B")).thenReturn(Optional.of(new Team()));
        assertThrows(ResponseStatusException.class, () -> teamService.updateTeam(1L, dto));
    }

    @Test
    void deleteTeam_success() {
        Team team = new Team();
        team.setCaptain(username);
        when(teamRepository.findById(1L)).thenReturn(Optional.of(team));
        doNothing().when(teamRepository).delete(team);
        assertDoesNotThrow(() -> teamService.deleteTeam(1L));
    }

    @Test
    void deleteTeam_notCaptain_throws() {
        Team team = new Team();
        team.setCaptain("otro");
        when(teamRepository.findById(1L)).thenReturn(Optional.of(team));
        assertThrows(ResponseStatusException.class, () -> teamService.deleteTeam(1L));
    }

    @Test
    void deleteTeam_notFound_throws() {
        when(teamRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(ResponseStatusException.class, () -> teamService.deleteTeam(1L));
    }

    @Test
    void deleteTeamMember_success_byCaptain() {
        Team team = mock(Team.class);
        when(team.getCaptain()).thenReturn(username);
        when(teamRepository.findById(1L)).thenReturn(Optional.of(team));
        User toDelete = new User();
        toDelete.setUsername("otro");
        when(userRepository.findByUsername("otro")).thenReturn(Optional.of(toDelete));
        doNothing().when(team).removeMember(toDelete);
        assertDoesNotThrow(() -> teamService.deleteTeamMember(1L, "otro"));
    }

    @Test
    void deleteTeamMember_success_bySelf() {
        Team team = mock(Team.class);
        team.setCaptain("capitan");
        when(teamRepository.findById(1L)).thenReturn(Optional.of(team));
        User toDelete = new User();
        toDelete.setUsername(username);
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(toDelete));
        doNothing().when(team).removeMember(toDelete);
        assertDoesNotThrow(() -> teamService.deleteTeamMember(1L, username));
    }

    @Test
    void deleteTeamMember_unauthorized_throws() {
        Team team = new Team();
        team.setCaptain("capitan");
        when(teamRepository.findById(1L)).thenReturn(Optional.of(team));
        User toDelete = new User();
        toDelete.setUsername("otro");
        when(userRepository.findByUsername("otro")).thenReturn(Optional.of(toDelete));
        assertThrows(ResponseStatusException.class, () -> teamService.deleteTeamMember(1L, "otro"));
    }

    @Test
    void inviteMember_success() {
        Team team = new Team();
        team.setCaptain(username);
        when(teamRepository.findById(1L)).thenReturn(Optional.of(team));
        when(teamRepository.existsByIdAndMemberUsername(1L, "invitee")).thenReturn(false);
        when(userRepository.existsByUsername("invitee")).thenReturn(true);
        Invitation inv = new Invitation();
        inv.setTeam(team);
        when(invitationService.sendInvitationEmail(team, "invitee")).thenReturn(inv);
        Invitation result = teamService.inviteMember(1L, "invitee");
        assertNotNull(result);
    }

    @Test
    void inviteMember_notCaptain_throws() {
        Team team = new Team();
        team.setCaptain("otro");
        when(teamRepository.findById(1L)).thenReturn(Optional.of(team));
        assertThrows(ResponseStatusException.class, () -> teamService.inviteMember(1L, "invitee"));
    }

    @Test
    void inviteMember_alreadyMember_throws() {
        Team team = new Team();
        team.setCaptain(username);
        when(teamRepository.findById(1L)).thenReturn(Optional.of(team));
        when(teamRepository.existsByIdAndMemberUsername(1L, "invitee")).thenReturn(true);
        assertThrows(ResponseStatusException.class, () -> teamService.inviteMember(1L, "invitee"));
    }

    @Test
    void inviteMember_inviteeNotFound_throws() {
        Team team = new Team();
        team.setCaptain(username);
        when(teamRepository.findById(1L)).thenReturn(Optional.of(team));
        when(teamRepository.existsByIdAndMemberUsername(1L, "invitee")).thenReturn(false);
        when(userRepository.existsByUsername("invitee")).thenReturn(false);
        assertThrows(ResponseStatusException.class, () -> teamService.inviteMember(1L, "invitee"));
    }

    @Test
    void getPendingInvitations_success() {
        Team team = new Team();
        team.setCaptain(username);
        when(teamRepository.findById(1L)).thenReturn(Optional.of(team));
        when(invitationService.getPendingInvitations(team)).thenReturn(List.of(new Invitation()));
        List<Invitation> result = teamService.getPendingInvitations(1L);
        assertFalse(result.isEmpty());
    }

    @Test
    void getPendingInvitations_notCaptain_throws() {
        Team team = new Team();
        team.setCaptain("otro");
        when(teamRepository.findById(1L)).thenReturn(Optional.of(team));
        assertThrows(ResponseStatusException.class, () -> teamService.getPendingInvitations(1L));
    }

    @Test
    void acceptInvitation_success() {
        Invitation inv = new Invitation();
        inv.setId(1L);
        inv.setInviteeEmail(username);
        Team team = mock(Team.class);
        when(team.getId()).thenReturn(1L);
        inv.setTeam(team);
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(teamRepository.findById(1L)).thenReturn(Optional.of(team));
        doNothing().when(team).addMember(user);
        Team result = teamService.acceptInvitation(inv);
        assertNotNull(result);
    }

    @Test
    void acceptInvitation_wrongUser_throws() {
        Invitation inv = new Invitation();
        inv.setId(1L);
        inv.setInviteeEmail("otro");
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(teamRepository.findById(1L)).thenReturn(Optional.of(new Team()));
        inv.setTeam(new Team());
        assertThrows(ResponseStatusException.class, () -> teamService.acceptInvitation(inv));
    }
}