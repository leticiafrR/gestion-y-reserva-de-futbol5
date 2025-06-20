// import ar.uba.fi.ingsoft1.todo_template.booking.Booking;
// import ar.uba.fi.ingsoft1.todo_template.booking.BookingRepository;
// import ar.uba.fi.ingsoft1.todo_template.email.EmailService;
// import ar.uba.fi.ingsoft1.todo_template.match.*;
// import ar.uba.fi.ingsoft1.todo_template.team.Team;
// import ar.uba.fi.ingsoft1.todo_template.team.TeamRepository;
// import ar.uba.fi.ingsoft1.todo_template.user.User;
// import ar.uba.fi.ingsoft1.todo_template.user.UserService;
// import org.junit.jupiter.api.BeforeEach;
// import org.junit.jupiter.api.Test;
// import org.mockito.InjectMocks;
// import org.mockito.Mock;
// import org.mockito.MockitoAnnotations;

// import java.time.LocalDate;
// import java.util.List;
// import java.util.Optional;

// import static org.junit.jupiter.api.Assertions.*;
// import static org.mockito.Mockito.*;

// public class MatchServiceTest {

// @Mock
// private BookingRepository bookingRepo;

// @Mock
// private UserService userService;

// @Mock
// private OpenMatchRepository openMatchRepo;

// @Mock
// private CloseMatchRepository closeMatchRepo;

// @Mock
// private TeamRepository teamRepo;

// @Mock
// private EmailService emailService;

// @Mock
// private OpenMatchTeamRepository openMatchTeamRepo;

// @InjectMocks
// private MatchService matchService;

// private User user;
// private Booking booking;
// private Team teamA;

// @BeforeEach
// void setUp() {
// MockitoAnnotations.openMocks(this);
// user = new User("usuario1", "1234", "usuario@mail.com", "Nombre", "Apellido",
// 25);
// user.setId(1L);

// booking = new Booking();
// booking.setId(1L);
// booking.setUser(user);
// booking.setBookingDate(LocalDate.now().plusDays(1));
// booking.setBookingHour(18);

// teamA = new Team();
// teamA.setId(1L);
// teamA.setName("Equipo A");
// teamA.setPlayers(List.of(user));
// }

// @Test
// void crearPartidoAbierto_correctamente() {
// OpenMatchCreateDTO dto = new OpenMatchCreateDTO();
// dto.setBookingId(1L);
// dto.setMinPlayers(10);
// dto.setMaxPlayers(12);

// when(userService.findByUsernameOrThrow(user.getUsername())).thenReturn(user);
// when(bookingRepo.findById(1L)).thenReturn(Optional.of(booking));
// when(openMatchTeamRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));
// when(openMatchRepo.save(any())).thenAnswer(inv -> {
// OpenMatch match = inv.getArgument(0);
// match.setId(1L);
// return match;
// });

// OpenMatch match = matchService.createOpenMatch(dto, user.getUsername());

// assertNotNull(match.getId());
// assertEquals(1, match.getPlayers().size());
// }

// @Test
// void crearPartidoCerrado_correctamente() {
// CloseMatchCreateDTO dto = new CloseMatchCreateDTO();
// dto.setBookingId(1L);
// dto.setTeamOneId(1L);

// when(bookingRepo.findById(1L)).thenReturn(Optional.of(booking));
// when(teamRepo.findById(1L)).thenReturn(Optional.of(teamA));
// when(closeMatchRepo.save(any())).thenAnswer(inv -> {
// CloseMatch match = inv.getArgument(0);
// match.setId(1L);
// return match;
// });

// CloseMatch match = matchService.createCloseMatch(dto);

// assertNotNull(match.getId());
// assertEquals(teamA.getId(), match.getTeamOne().getId());
// }

// @Test
// void listarPartidosAbiertosActivos() {
// OpenMatch match = new OpenMatch();
// match.setId(1L);
// when(openMatchRepo.findByIsActiveTrue()).thenReturn(List.of(match));

// List<OpenMatch> matches = matchService.listActiveOpenMatches();
// assertFalse(matches.isEmpty());
// }

// @Test
// void listarPartidosCerradosActivos() {
// CloseMatch match = new CloseMatch();
// match.setId(1L);
// when(closeMatchRepo.findByIsActiveTrue()).thenReturn(List.of(match));

// List<CloseMatch> matches = matchService.listActiveCloseMatches();
// assertFalse(matches.isEmpty());
// }

// @Test
// void obtenerPartidoAbiertoPorId() {
// OpenMatch match = new OpenMatch();
// match.setId(1L);
// when(openMatchRepo.findById(1L)).thenReturn(Optional.of(match));

// OpenMatch result = matchService.getOpenMatch(1L);
// assertEquals(1L, result.getId());
// }

// @Test
// void obtenerPartidoCerradoPorId() {
// CloseMatch match = new CloseMatch();
// match.setId(1L);
// when(closeMatchRepo.findById(1L)).thenReturn(Optional.of(match));

// CloseMatch result = matchService.getCloseMatch(1L);
// assertEquals(1L, result.getId());
// }

// @Test
// void obtenerPartidosAbiertosPasadosPorUsuario() {
// when(userService.findByUsernameOrThrow(user.getUsername())).thenReturn(user);

// Booking pastBooking = new Booking();
// pastBooking.setBookingDate(LocalDate.now().minusDays(2));
// pastBooking.setUser(user);

// OpenMatch match = new OpenMatch();
// match.setBooking(pastBooking);
// match.setPlayers(List.of(user));

// when(openMatchRepo.findByIsActiveTrue()).thenReturn(List.of(match));

// List<OpenMatch> result =
// matchService.getPastOpenMatchesForUser(user.getUsername());
// assertFalse(result.isEmpty());
// }

// @Test
// void obtenerPartidosCerradosPasadosPorUsuario() {
// when(userService.findByUsernameOrThrow(user.getUsername())).thenReturn(user);

// Booking pastBooking = new Booking();
// pastBooking.setBookingDate(LocalDate.now().minusDays(2));
// pastBooking.setUser(user);

// CloseMatch match = new CloseMatch();
// match.setBooking(pastBooking);
// match.setTeamOne(teamA);

// when(closeMatchRepo.findByIsActiveTrue()).thenReturn(List.of(match));

// List<CloseMatch> result =
// matchService.getPastCloseMatchesForUser(user.getUsername());
// assertFalse(result.isEmpty());
// }

// @Test
// void acceptInvitation_wrongUser_throws() {
// Invitation inv = new Invitation();
// inv.setId(1L);
// inv.setInviteeEmail("otro");
// Team team = new Team();
// team.setId(1L);
// inv.setTeam(team);
// when(userService.findByUsername(user.getUsername())).thenReturn(Optional.of(user));
// when(teamRepo.findById(1L)).thenReturn(Optional.of(team));
// assertThrows(ResponseStatusException.class, () ->
// matchService.acceptInvitation(inv));
// }
// }
