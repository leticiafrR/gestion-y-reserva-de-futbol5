package ar.uba.fi.ingsoft1.todo_template.config;

import ar.uba.fi.ingsoft1.todo_template.booking.Booking;
import ar.uba.fi.ingsoft1.todo_template.booking.BookingRepository;
import ar.uba.fi.ingsoft1.todo_template.field.Field;
import ar.uba.fi.ingsoft1.todo_template.field.FieldRepository;
import ar.uba.fi.ingsoft1.todo_template.match.OpenMatch;
import ar.uba.fi.ingsoft1.todo_template.match.OpenMatchRepository;
import ar.uba.fi.ingsoft1.todo_template.team.Team;
import ar.uba.fi.ingsoft1.todo_template.team.TeamRepository;
import ar.uba.fi.ingsoft1.todo_template.timeslot.TimeSlot;
import ar.uba.fi.ingsoft1.todo_template.timeslot.TimeSlotRepository;
import ar.uba.fi.ingsoft1.todo_template.user.User;
import ar.uba.fi.ingsoft1.todo_template.user.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class GlobalSeeder {
//
//    private final UserRepository userRepository;
//    private final OpenMatchRepository openMatchRepository;
//    private final FieldRepository fieldRepository;
//    private final TimeSlotRepository timeSlotRepository;
//    private final BookingRepository bookingRepository;
//    private final TeamRepository teamRepository;
//
//    @PostConstruct
//    public void seedAll() {
//        if (!userRepository.findAll().isEmpty()) return;
//
//        int currentYear = LocalDate.now().getYear();
//        List<User> players = new ArrayList<>();
//        for (int i = 1; i <= 10; i++) {
//
//            int age = 35 - (i - 1);
//            int birthYear = currentYear - age;
//
//
//            // Tira error porque nos faltaban atributos de User en nuestra branch.
//            User player = new User(
//                    "jugador" + i + "@mail.com", // username
//                    "password",                  // password
//                    "PLAYER",                    // role
//                    "male",                      // gender
//                    String.valueOf(birthYear),  // age como string -> birthYear se calcula internamente
//                    "CABA",                      // zone
//                    "Jugador",                   // name
//                    "Número" + i,                // last_name
//                    "https://picsum.photos/200?random=" + i // profilePicture
//            );
//            player.setEmailVerified(true); // opcional si querés que arranque verificado
//            player.setActive(true);        // ya está true por defecto, pero explícito es mejor
//            players.add(userRepository.save(player));
//        }
//
//
//
//            User owner = new User(
//                    "dueno@mail.com",
//                    "password",
//                    "OWNER",
//                    "female",
//                    "40",
//                    "Zona Norte",
//                    "Dueña",
//                    "DeLaCancha",
//                    "https://picsum.photos/200?random=99"
//            );
//            owner.setEmailVerified(true);
//            owner.setActive(true);
//            userRepository.save(owner);
//
//
//            userRepository.save(owner);
//
//        // 🏟️ Crear cancha
//        Field field = Field.builder()
//                .name("Cancha Monumental")
//                .grassType("Sintético")
//                .lighting(true)
//                .zone("Zona Norte")
//                .address("Av. Libertador 1234")
//                .photoUrl("https://cancha.example.com/foto.jpg")
//                .price(15000.0)
//                .active(true)
//                .owner(owner)
//                .build();
//        fieldRepository.save(field);
//
//        // ⏰ Crear franja horaria
//        TimeSlot timeSlot = TimeSlot.builder()
//                .dayOfWeek(DayOfWeek.THURSDAY)
//                .openTime(18)
//                .closeTime(23)
//                .field(field)
//                .build();
//        timeSlotRepository.save(timeSlot);
//
//
//        Booking booking = new Booking(
//                players.get(0),
//                timeSlot,
//                LocalDate.now().plusDays(1),
//                20 // 20hs
//        );
//        bookingRepository.save(booking);
//
//
//        Team teamOne = new Team();
//        teamOne.setName("Los Rápidos");
//        teamOne.setCaptain(players.get(0).getUsername());
//        teamOne.setPrimaryColor("Rojo");
//        teamOne.setSecondaryColor("Negro");
//        teamOne.setLogo("https://logo.example.com/rapidos.png");
//        for (int i = 0; i < 5; i++) {
//            teamOne.addMember(players.get(i));
//        }
//
//        Team teamTwo = new Team();
//        teamTwo.setName("Los Furiosos");
//        teamTwo.setCaptain(players.get(5).getUsername());
//        teamTwo.setPrimaryColor("Azul");
//        teamTwo.setSecondaryColor("Blanco");
//        teamTwo.setLogo("https://logo.example.com/furiosos.png");
//        for (int i = 5; i < 10; i++) {
//            teamTwo.addMember(players.get(i));
//        }
//
//        teamRepository.save(teamOne);
//        teamRepository.save(teamTwo);
//
//
//
//
//
//        OpenMatch match = new OpenMatch();
//        match.setBooking(booking);
//        match.setPlayers(players);
//        match.setMaxPlayers(10);
//
//        match.setTeamOne(teamOne);
//        match.setTeamTwo(teamTwo);
//
//        openMatchRepository.save(match);
//
//        System.out.println("✅ Seed completada con jugadores, cancha, franja horaria, reserva y OpenMatch.");
//    }
}
