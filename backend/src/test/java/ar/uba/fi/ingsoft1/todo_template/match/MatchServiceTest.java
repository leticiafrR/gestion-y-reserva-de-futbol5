package ar.uba.fi.ingsoft1.todo_template.match;

import ar.uba.fi.ingsoft1.todo_template.booking.Booking;
import ar.uba.fi.ingsoft1.todo_template.booking.BookingRepository;
import ar.uba.fi.ingsoft1.todo_template.email.EmailService;
import ar.uba.fi.ingsoft1.todo_template.field.Field;
import ar.uba.fi.ingsoft1.todo_template.team.Team;
import ar.uba.fi.ingsoft1.todo_template.team.TeamRepository;
import ar.uba.fi.ingsoft1.todo_template.timeslot.TimeSlot;
import ar.uba.fi.ingsoft1.todo_template.user.User;
import ar.uba.fi.ingsoft1.todo_template.user.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class MatchServiceTest {

    @Mock
    private BookingRepository bookingRepo;

    @Mock
    private UserService userService;

    @Mock
    private OpenMatchRepository openMatchRepo;

    @Mock
    private CloseMatchRepository closeMatchRepo;

    @Mock
    private TeamRepository teamRepo;

    @Mock
    private EmailService emailService;

    @Mock
    private OpenMatchTeamRepository openMatchTeamRepo;

    @InjectMocks
    private MatchService matchService;

    private User user;
    private User user2;
    private Booking booking;
    private Team teamA;
    private Team teamB;
    private TimeSlot timeSlot;
    private Field field;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        // Crear usuarios con el constructor correcto
        user = new User("usuario1", "1234", "PLAYER", "M", "25", "Zona Norte", "Nombre", "Apellido",
                "https://example.com/pic.jpg");
        user.setId(1L);

        user2 = new User("usuario2", "1234", "PLAYER", "F", "30", "Zona Sur", "Nombre2", "Apellido2",
                "https://example.com/pic2.jpg");
        user2.setId(2L);

        // Crear Field
        field = Field.builder()
                .id(1L)
                .name("Cancha Principal")
                .grassType("Sintético")
                .lighting(true)
                .zone("Zona Norte")
                .address("Av. Principal 123")
                .photoUrl("https://example.com/field.jpg")
                .price(100.0)
                .owner(user)
                .build();

        // Crear TimeSlot
        timeSlot = TimeSlot.builder()
                .id(1L)
                .openTime(8)
                .closeTime(22)
                .field(field)
                .build();

        // Crear Booking con el constructor correcto
        booking = new Booking(user, timeSlot, LocalDate.now().plusDays(1), 18);

        // Crear equipos usando el builder
        teamA = Team.builder()
                .id(1L)
                .name("Equipo A")
                .captain("usuario1")
                .build();
        teamA.addMember(user);

        teamB = Team.builder()
                .id(2L)
                .name("Equipo B")
                .captain("usuario2")
                .build();
        teamB.addMember(user2);
    }

    @Test
    void crearPartidoAbierto_correctamente() {
        OpenMatchCreateDTO dto = new OpenMatchCreateDTO();
        dto.setBookingId(1L);
        dto.setMinPlayers(10);
        dto.setMaxPlayers(12);

        when(userService.findByUsernameOrThrow(user.getUsername())).thenReturn(user);
        when(bookingRepo.findById(1L)).thenReturn(Optional.of(booking));
        when(openMatchTeamRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(openMatchRepo.save(any())).thenAnswer(inv -> {
            OpenMatch match = inv.getArgument(0);
            match.setId(1L);
            return match;
        });

        OpenMatch match = matchService.createOpenMatch(dto, user.getUsername());

        assertNotNull(match.getId());
        assertEquals(1, match.getPlayers().size());
        assertEquals(user, match.getPlayers().get(0));
        assertEquals(10, match.getMinPlayers());
        assertEquals(12, match.getMaxPlayers());
        assertEquals(booking, match.getBooking());
        assertNotNull(match.getTeamOne());
        assertNotNull(match.getTeamTwo());
    }

    @Test
    void crearPartidoAbierto_minPlayersMenorA10_lanzaExcepcion() {
        OpenMatchCreateDTO dto = new OpenMatchCreateDTO();
        dto.setBookingId(1L);
        dto.setMinPlayers(8);
        dto.setMaxPlayers(12);

        when(userService.findByUsernameOrThrow(user.getUsername())).thenReturn(user);
        when(bookingRepo.findById(1L)).thenReturn(Optional.of(booking));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> matchService.createOpenMatch(dto, user.getUsername()));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertEquals("El mínimo de jugadores debe ser al menos 10.", exception.getReason());
    }

    @Test
    void crearPartidoAbierto_maxPlayersMenorAMinPlayers_lanzaExcepcion() {
        OpenMatchCreateDTO dto = new OpenMatchCreateDTO();
        dto.setBookingId(1L);
        dto.setMinPlayers(12);
        dto.setMaxPlayers(10);

        when(userService.findByUsernameOrThrow(user.getUsername())).thenReturn(user);
        when(bookingRepo.findById(1L)).thenReturn(Optional.of(booking));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> matchService.createOpenMatch(dto, user.getUsername()));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertEquals("Debe haber al menos 2 jugadores.", exception.getReason());
    }

    @Test
    void crearPartidoCerrado_correctamente() {
        CloseMatchCreateDTO dto = new CloseMatchCreateDTO();
        dto.setBookingId(1L);
        dto.setTeamOneId(1L);
        dto.setTeamTwoId(2L);

        when(bookingRepo.findById(1L)).thenReturn(Optional.of(booking));
        when(teamRepo.findById(1L)).thenReturn(Optional.of(teamA));
        when(teamRepo.findById(2L)).thenReturn(Optional.of(teamB));
        when(closeMatchRepo.save(any())).thenAnswer(inv -> {
            CloseMatch match = inv.getArgument(0);
            match.setId(1L);
            return match;
        });

        CloseMatch match = matchService.createCloseMatch(dto);

        assertNotNull(match.getId());
        assertEquals(teamA, match.getTeamOne());
        assertEquals(teamB, match.getTeamTwo());
        assertEquals(booking, match.getBooking());
    }

    @Test
    void crearPartidoCerrado_soloTeamOne_correctamente() {
        CloseMatchCreateDTO dto = new CloseMatchCreateDTO();
        dto.setBookingId(1L);
        dto.setTeamOneId(1L);
        // teamTwoId es null

        when(bookingRepo.findById(1L)).thenReturn(Optional.of(booking));
        when(teamRepo.findById(1L)).thenReturn(Optional.of(teamA));
        when(closeMatchRepo.save(any())).thenAnswer(inv -> {
            CloseMatch match = inv.getArgument(0);
            match.setId(1L);
            return match;
        });

        CloseMatch match = matchService.createCloseMatch(dto);

        assertNotNull(match.getId());
        assertEquals(teamA, match.getTeamOne());
        assertNull(match.getTeamTwo());
    }

    @Test
    void unirseAPartidoAbierto_correctamente() {
        OpenMatch match = new OpenMatch();
        match.setId(1L);
        match.setBooking(booking);
        match.setPlayers(new ArrayList<>(List.of(user)));
        match.setMinPlayers(10);
        match.setMaxPlayers(12);

        when(openMatchRepo.findById(1L)).thenReturn(Optional.of(match));
        when(userService.findByUsernameOrThrow(user2.getUsername())).thenReturn(user2);
        when(openMatchRepo.save(any())).thenReturn(match);

        OpenMatch result = matchService.joinOpenMatch(1L, user2.getUsername());

        assertEquals(2, result.getPlayers().size());
        assertTrue(result.getPlayers().contains(user2));
    }

    @Test
    void unirseAPartidoAbierto_usuarioYaEnPartido_lanzaExcepcion() {
        OpenMatch match = new OpenMatch();
        match.setId(1L);
        match.setBooking(booking);
        match.setPlayers(new ArrayList<>(List.of(user)));
        match.setMinPlayers(10);
        match.setMaxPlayers(12);

        when(openMatchRepo.findById(1L)).thenReturn(Optional.of(match));
        when(userService.findByUsernameOrThrow(user.getUsername())).thenReturn(user);

        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> matchService.joinOpenMatch(1L, user.getUsername()));

        assertEquals("User is already in the match.", exception.getMessage());
    }

    @Test
    void unirseAPartidoAbierto_partidoLleno_lanzaExcepcion() {
        OpenMatch match = new OpenMatch();
        match.setId(1L);
        match.setBooking(booking);
        match.setPlayers(new ArrayList<>(List.of(user)));
        match.setMinPlayers(10);
        match.setMaxPlayers(1); // Solo 1 jugador máximo

        when(openMatchRepo.findById(1L)).thenReturn(Optional.of(match));
        when(userService.findByUsernameOrThrow(user2.getUsername())).thenReturn(user2);

        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> matchService.joinOpenMatch(1L, user2.getUsername()));

        assertEquals("Match is already full.", exception.getMessage());
    }

    @Test
    void salirDePartidoAbierto_correctamente() {
        OpenMatch match = new OpenMatch();
        match.setId(1L);
        match.setBooking(booking);
        match.setPlayers(new ArrayList<>(List.of(user, user2)));
        match.setMinPlayers(10);
        match.setMaxPlayers(12);

        when(openMatchRepo.findById(1L)).thenReturn(Optional.of(match));
        when(userService.findByUsernameOrThrow(user2.getUsername())).thenReturn(user2);
        when(openMatchRepo.save(any())).thenReturn(match);

        OpenMatch result = matchService.leaveOpenMatch(1L, user2.getUsername());

        assertEquals(1, result.getPlayers().size());
        assertFalse(result.getPlayers().contains(user2));
    }

    @Test
    void salirDePartidoAbierto_usuarioNoEnPartido_lanzaExcepcion() {
        OpenMatch match = new OpenMatch();
        match.setId(1L);
        match.setBooking(booking);
        match.setPlayers(new ArrayList<>(List.of(user)));
        match.setMinPlayers(10);
        match.setMaxPlayers(12);

        when(openMatchRepo.findById(1L)).thenReturn(Optional.of(match));
        when(userService.findByUsernameOrThrow(user2.getUsername())).thenReturn(user2);

        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> matchService.leaveOpenMatch(1L, user2.getUsername()));

        assertEquals("User does not belong to match.", exception.getMessage());
    }

    @Test
    void salirDePartidoAbierto_partidoConfirmado_lanzaExcepcion() {
        OpenMatch match = new OpenMatch();
        match.setId(1L);
        match.setBooking(booking);
        match.setPlayers(new ArrayList<>(List.of(user, user2)));
        match.setMinPlayers(2); // Mínimo 2 jugadores
        match.setMaxPlayers(12);

        when(openMatchRepo.findById(1L)).thenReturn(Optional.of(match));
        when(userService.findByUsernameOrThrow(user2.getUsername())).thenReturn(user2);

        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> matchService.leaveOpenMatch(1L, user2.getUsername()));

        assertEquals("Match is already confirmed.", exception.getMessage());
    }

    @Test
    void salirDePartidoAbierto_creadorDelPartido_lanzaExcepcion() {
        OpenMatch match = new OpenMatch();
        match.setId(1L);
        match.setBooking(booking);
        match.setPlayers(new ArrayList<>(List.of(user, user2)));
        match.setMinPlayers(10);
        match.setMaxPlayers(12);

        when(openMatchRepo.findById(1L)).thenReturn(Optional.of(match));
        when(userService.findByUsernameOrThrow(user.getUsername())).thenReturn(user);

        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> matchService.leaveOpenMatch(1L, user.getUsername()));

        assertEquals("Match owner can't leave an open match.", exception.getMessage());
    }

    @Test
    void listarPartidosAbiertosActivos() {
        OpenMatch match = new OpenMatch();
        match.setId(1L);
        when(openMatchRepo.findByIsActiveTrue()).thenReturn(List.of(match));

        List<OpenMatch> matches = matchService.listActiveOpenMatches();
        assertFalse(matches.isEmpty());
        assertEquals(1, matches.size());
        assertEquals(1L, matches.get(0).getId());
    }

    @Test
    void listarPartidosCerradosActivos() {
        CloseMatch match = new CloseMatch();
        match.setId(1L);
        when(closeMatchRepo.findByIsActiveTrue()).thenReturn(List.of(match));

        List<CloseMatch> matches = matchService.listActiveCloseMatches();
        assertFalse(matches.isEmpty());
        assertEquals(1, matches.size());
        assertEquals(1L, matches.get(0).getId());
    }

    @Test
    void obtenerPartidoAbiertoPorId() {
        OpenMatch match = new OpenMatch();
        match.setId(1L);
        when(openMatchRepo.findById(1L)).thenReturn(Optional.of(match));

        OpenMatch result = matchService.getOpenMatch(1L);
        assertEquals(1L, result.getId());
    }

    @Test
    void obtenerPartidoAbiertoPorId_noExiste_lanzaExcepcion() {
        when(openMatchRepo.findById(1L)).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> matchService.getOpenMatch(1L));

        assertEquals("This match does not exist", exception.getMessage());
    }

    @Test
    void obtenerPartidoCerradoPorId() {
        CloseMatch match = new CloseMatch();
        match.setId(1L);
        when(closeMatchRepo.findById(1L)).thenReturn(Optional.of(match));

        CloseMatch result = matchService.getCloseMatch(1L);
        assertEquals(1L, result.getId());
    }

    @Test
    void obtenerPartidoCerradoPorId_noExiste_lanzaExcepcion() {
        when(closeMatchRepo.findById(1L)).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> matchService.getCloseMatch(1L));

        assertEquals("This match does not exist", exception.getMessage());
    }

    @Test
    void obtenerPartidosAbiertosPasadosPorUsuario() {
        when(userService.findByUsernameOrThrow(user.getUsername())).thenReturn(user);

        // Crear booking pasado
        Booking pastBooking = new Booking(user, timeSlot, LocalDate.now().minusDays(2), 18);

        OpenMatch match = new OpenMatch();
        match.setBooking(pastBooking);
        match.setPlayers(List.of(user));

        when(openMatchRepo.findByIsActiveTrue()).thenReturn(List.of(match));

        List<OpenMatch> result = matchService.getPastOpenMatchesForUser(user.getUsername());
        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
    }

    @Test
    void obtenerPartidosCerradosPasadosPorUsuario() {
        when(userService.findByUsernameOrThrow(user.getUsername())).thenReturn(user);

        // Crear booking pasado
        Booking pastBooking = new Booking(user, timeSlot, LocalDate.now().minusDays(2), 18);

        CloseMatch match = new CloseMatch();
        match.setBooking(pastBooking);
        match.setTeamOne(teamA);

        when(closeMatchRepo.findByIsActiveTrue()).thenReturn(List.of(match));

        List<CloseMatch> result = matchService.getPastCloseMatchesForUser(user.getUsername());
        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
    }

    @Test
    void obtenerPartidosCerradosPorEquipos() {
        CloseMatch match = new CloseMatch();
        match.setId(1L);
        match.setTeamOne(teamA);
        match.setTeamTwo(teamB);

        when(closeMatchRepo.findByTeamOne_IdAndTeamTwo_Id(1L, 2L)).thenReturn(List.of(match));

        List<CloseMatch> result = matchService.getCloseMatchesByTeams(1L, 2L);
        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getId());
    }

    @Test
    void asignarEquipos_estrategiaEdad() {
        OpenMatch match = new OpenMatch();
        match.setId(1L);
        match.setBooking(booking);
        match.setPlayers(new ArrayList<>(List.of(user, user2)));
        match.setMinPlayers(2);
        match.setMaxPlayers(12);

        OpenMatchTeam teamOne = new OpenMatchTeam();
        teamOne.setId(1L);
        OpenMatchTeam teamTwo = new OpenMatchTeam();
        teamTwo.setId(2L);
        match.setTeamOne(teamOne);
        match.setTeamTwo(teamTwo);

        when(openMatchRepo.findById(1L)).thenReturn(Optional.of(match));
        when(openMatchRepo.save(any())).thenReturn(match);

        OpenMatch result = matchService.assignTeams(1L, "age", Collections.emptyMap());

        assertNotNull(result);
        verify(openMatchRepo).save(match);
    }

    @Test
    void asignarEquipos_estrategiaAleatoria() {
        OpenMatch match = new OpenMatch();
        match.setId(1L);
        match.setBooking(booking);
        match.setPlayers(new ArrayList<>(List.of(user, user2)));
        match.setMinPlayers(2);
        match.setMaxPlayers(12);

        OpenMatchTeam teamOne = new OpenMatchTeam();
        teamOne.setId(1L);
        OpenMatchTeam teamTwo = new OpenMatchTeam();
        teamTwo.setId(2L);
        match.setTeamOne(teamOne);
        match.setTeamTwo(teamTwo);

        when(openMatchRepo.findById(1L)).thenReturn(Optional.of(match));
        when(openMatchRepo.save(any())).thenReturn(match);

        OpenMatch result = matchService.assignTeams(1L, "random", Collections.emptyMap());

        assertNotNull(result);
        verify(openMatchRepo).save(match);
    }

    @Test
    void asignarEquipos_estrategiaManual() {
        // Crear un tercer usuario para tener un número par de jugadores
        User user3 = new User("usuario3", "1234", "PLAYER", "M", "28", "Zona Este", "Nombre3", "Apellido3",
                "https://example.com/pic3.jpg");
        user3.setId(3L);
        User user4 = new User("usuario4", "1234", "PLAYER", "F", "32", "Zona Oeste", "Nombre4", "Apellido4",
                "https://example.com/pic4.jpg");
        user4.setId(4L);

        OpenMatch match = new OpenMatch();
        match.setId(1L);
        match.setBooking(booking);
        match.setPlayers(new ArrayList<>(List.of(user, user2, user3, user4))); // 4 jugadores
        match.setMinPlayers(2);
        match.setMaxPlayers(12);

        OpenMatchTeam teamOne = new OpenMatchTeam();
        teamOne.setId(1L);
        OpenMatchTeam teamTwo = new OpenMatchTeam();
        teamTwo.setId(2L);
        match.setTeamOne(teamOne);
        match.setTeamTwo(teamTwo);

        Map<Long, Integer> manualMap = new HashMap<>();
        manualMap.put(1L, 1); // user en equipo 1 (teamOne)
        manualMap.put(2L, 2); // user2 en equipo 2 (teamTwo)
        manualMap.put(3L, 1); // user3 en equipo 1 (teamOne)
        manualMap.put(4L, 2); // user4 en equipo 2 (teamTwo)

        when(openMatchRepo.findById(1L)).thenReturn(Optional.of(match));
        when(openMatchRepo.save(any())).thenReturn(match);

        OpenMatch result = matchService.assignTeams(1L, "manual", manualMap);

        assertNotNull(result);
        verify(openMatchRepo).save(match);
    }

    @Test
    void asignarEquipos_estrategiaDesconocida_lanzaExcepcion() {
        OpenMatch match = new OpenMatch();
        match.setId(1L);
        when(openMatchRepo.findById(1L)).thenReturn(Optional.of(match));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> matchService.assignTeams(1L, "desconocida", Collections.emptyMap()));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertEquals("Unknown strategy", exception.getReason());
    }

    @Test
    void asignarEquipos_partidoNoExiste_lanzaExcepcion() {
        when(openMatchRepo.findById(1L)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> matchService.assignTeams(1L, "age", Collections.emptyMap()));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }
}
