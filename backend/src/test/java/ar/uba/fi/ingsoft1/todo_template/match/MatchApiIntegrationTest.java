// package ar.uba.fi.ingsoft1.todo_template.match;

// import static org.junit.jupiter.api.Assertions.*;

// import java.time.LocalDate;
// import java.util.HashSet;
// import java.util.List;

// import org.junit.jupiter.api.BeforeEach;
// import org.junit.jupiter.api.Test;
// import org.springframework.http.*;

// import ar.uba.fi.ingsoft1.todo_template.BaseIntegrationTest;
// import ar.uba.fi.ingsoft1.todo_template.booking.Booking;
// import ar.uba.fi.ingsoft1.todo_template.field.Field;
// import ar.uba.fi.ingsoft1.todo_template.field.FieldRepository;
// import ar.uba.fi.ingsoft1.todo_template.match.CloseMatchCreateDTO;
// import ar.uba.fi.ingsoft1.todo_template.match.OpenMatchCreateDTO;
// import ar.uba.fi.ingsoft1.todo_template.team.Team;
// import ar.uba.fi.ingsoft1.todo_template.team.TeamRepository;
// import ar.uba.fi.ingsoft1.todo_template.timeslot.TimeSlot;
// import ar.uba.fi.ingsoft1.todo_template.timeslot.TimeSlotRepository;
// import ar.uba.fi.ingsoft1.todo_template.user.dto.TokenDTO;
// import ar.uba.fi.ingsoft1.todo_template.user.dto.UserCreateDTO;
// import ar.uba.fi.ingsoft1.todo_template.user.User;

// public class MatchApiIntegrationTest extends BaseIntegrationTest {

// private TokenDTO token;
// private Long fieldId;
// private Long bookingId;
// private Long teamId;

// @BeforeEach
// public void setupEntities() {
// // Crear usuario (registro vía API)
// UserCreateDTO userDto = new UserCreateDTO(
// "Nombre", "Apellido", "match@test.com", "123456", "USER", "male", "1990",
// "Ciudad", "url"
// );
// ResponseEntity<TokenDTO> register =
// restTemplate.postForEntity(buildUrl("/users/register"), userDto,
// TokenDTO.class);
// token = register.getBody();

// // Obtener usuario autenticado (ya registrado)
// User user = getAuthenticatedUser();

// // Crear cancha (Field)
// FieldRepository fieldRepo = getBean(FieldRepository.class);
// Field field = new Field();
// field.setName("TestField");
// field.setAddress("123 Calle");
// field.setZone("ZonaA");
// field.setGrassType("Sintético");
// field.setLighting(true);
// // Campos obligatorios según tu modelo
// field.setPhotoUrl("https://img.com/cancha.jpg");
// field.setPrice(1000.0);
// field.setActive(true);
// field.setOwner(user);
// field = fieldRepo.save(field);
// fieldId = field.getId();

// // Crear TimeSlot
// TimeSlotRepository timeSlotRepo = getBean(TimeSlotRepository.class);
// TimeSlot timeSlot = new TimeSlot();
// timeSlot.setDayOfWeek(java.time.DayOfWeek.MONDAY);
// timeSlot.setOpenTime(18);
// timeSlot.setCloseTime(20);
// timeSlot.setField(field);
// timeSlot = timeSlotRepo.save(timeSlot);

// // Crear Booking
// Booking booking = new Booking(
// user,
// timeSlot,
// LocalDate.now().plusDays(1),
// 19
// );
// Booking savedBooking =
// getBean(ar.uba.fi.ingsoft1.todo_template.booking.BookingRepository.class).save(booking);
// bookingId = savedBooking.getId();

// // Crear Team
// TeamRepository teamRepo = getBean(TeamRepository.class);
// Team team = new Team();
// team.setName("TeamTest");
// // El setMembers existe y espera un Set<User>
// team.setMembers(new HashSet<>(List.of(user)));
// team = teamRepo.save(team);
// teamId = team.getId();
// }

// @Test
// public void shouldCreateOpenMatchSuccessfully() {
// OpenMatchCreateDTO dto = new OpenMatchCreateDTO();
// dto.setBookingId(bookingId);
// dto.setMinPlayers(10);
// dto.setMaxPlayers(12);

// HttpEntity<OpenMatchCreateDTO> request = authenticatedPost(dto);
// ResponseEntity<String> response =
// restTemplate.exchange(buildUrl("/matches/open"), HttpMethod.POST, request,
// String.class);

// assertEquals(HttpStatus.OK, response.getStatusCode());
// }

// @Test
// public void shouldCreateCloseMatchSuccessfully() {
// CloseMatchCreateDTO dto = new CloseMatchCreateDTO();
// dto.setBookingId(bookingId);
// dto.setTeamOneId(teamId);

// HttpEntity<CloseMatchCreateDTO> request = authenticatedPost(dto);
// ResponseEntity<String> response =
// restTemplate.exchange(buildUrl("/matches/close"), HttpMethod.POST, request,
// String.class);

// assertEquals(HttpStatus.OK, response.getStatusCode());
// }
// }