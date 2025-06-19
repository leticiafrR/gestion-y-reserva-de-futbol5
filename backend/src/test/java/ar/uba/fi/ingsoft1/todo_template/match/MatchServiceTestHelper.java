package ar.uba.fi.ingsoft1.todo_template.match;

import static org.mockito.Mockito.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import ar.uba.fi.ingsoft1.todo_template.booking.Booking;
import ar.uba.fi.ingsoft1.todo_template.booking.BookingRepository;
import ar.uba.fi.ingsoft1.todo_template.team.Team;
import ar.uba.fi.ingsoft1.todo_template.team.TeamRepository;
import ar.uba.fi.ingsoft1.todo_template.timeslot.TimeSlot;
import ar.uba.fi.ingsoft1.todo_template.user.User;
import ar.uba.fi.ingsoft1.todo_template.user.UserService;
import ar.uba.fi.ingsoft1.todo_template.field.Field;

public class MatchServiceTestHelper {

    private final BookingRepository bookingRepository;
    private final UserService userService;
    private final TeamRepository teamRepository;

    public MatchServiceTestHelper(
            BookingRepository bookingRepository,
            UserService userService,
            TeamRepository teamRepository) {
        this.bookingRepository = bookingRepository;
        this.userService = userService;
        this.teamRepository = teamRepository;
    }

    public User buildUser(Long id, String username) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        user.setPassword("pass");
        user.setRole("USER");
        user.setGender("M");
        user.setBirthYear(2000);
        user.setZone("CABA");
        user.setName("Nombre");
        user.setLast_name("Apellido");
        user.setProfilePicture("https://img.com/pic.jpg");
        return user;
    }

    public TimeSlot buildTimeSlot(Long id, Field field) {
        TimeSlot slot = new TimeSlot();
        slot.setId(id);
        slot.setDayOfWeek(DayOfWeek.MONDAY);
        slot.setOpenTime(18);
        slot.setCloseTime(20);
        slot.setField(field);
        return slot;
    }

    public Booking buildBooking(Long id, User user, TimeSlot slot) {
        Booking booking = new Booking(user, slot, LocalDate.now().plusDays(1), 18);
        // El id se setea solo al persistir, pero para tests puedes usar reflection o un setter si existe
        return booking;
    }

    public Team buildTeam(Long id, List<User> players) {
        Team team = new Team();
        team.setId(id);
        team.setName("Team " + id);
        for (User player : players) {
            try {
                team.addMember(player);
            } catch (Exception ignored) {}
        }
        return team;
    }

    // Métodos para mockear repositorios
    public Booking setupValidBooking(Long id, User user, TimeSlot slot) {
        Booking booking = buildBooking(id, user, slot);
        when(bookingRepository.findById(id)).thenReturn(Optional.of(booking));
        return booking;
    }

    public Team setupTeam(Long id, List<User> players) {
        Team team = buildTeam(id, players);
        when(teamRepository.findById(id)).thenReturn(Optional.of(team));
        return team;
    }

    public User setupUser(String username) {
        User user = buildUser(1L, username);
        when(userService.findByUsernameOrThrow(username)).thenReturn(user);
        return user;
    }

    // Puedes agregar más helpers según lo que necesites testear
}

