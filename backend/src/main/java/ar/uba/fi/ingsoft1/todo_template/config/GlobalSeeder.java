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
import ar.uba.fi.ingsoft1.todo_template.tournament.Tournament;
import ar.uba.fi.ingsoft1.todo_template.tournament.TournamentFormat;
import ar.uba.fi.ingsoft1.todo_template.tournament.TournamentRepository;
import ar.uba.fi.ingsoft1.todo_template.user.User;
import ar.uba.fi.ingsoft1.todo_template.user.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class GlobalSeeder {

    private final UserRepository userRepository;
    private final OpenMatchRepository openMatchRepository;
    private final FieldRepository fieldRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final BookingRepository bookingRepository;
    private final TeamRepository teamRepository;
    private final TournamentRepository tournamentRepository;

    @PostConstruct
    public void seedAll() {
        if (!userRepository.findAll().isEmpty())
            return;
        // seedForTournament();
        //seedForLeaveMatchTest();

    }

    private void seedForTournament() {

        User tournamentCreator = new User(
                "organizador@tournaments.com",
                "password",
                "OWNER",
                "other",
                "30",
                "Zona Sur",
                "Organizador",
                "DeTorneos",
                "https://picsum.photos/200?random=777");
        tournamentCreator.setEmailVerified(true);
        tournamentCreator.setActive(true);
        userRepository.save(tournamentCreator);

        // Crear 6 torneos con distintos estados
        List<Tournament> tournaments = new ArrayList<>();

        // 📅 Hoy
        LocalDate today = LocalDate.now();

        // 🏁 2 torneos finalizados
        for (int i = 1; i <= 2; i++) {
            Tournament finished = Tournament.builder()
                    .name("Finalizado " + i)
                    .startDate(today.minusMonths(3).minusDays(i))
                    .endDate(today.minusMonths(2).minusDays(i)) // ya terminó
                    .format(TournamentFormat.SINGLE_ELIMINATION)
                    .maxTeams(8)
                    .description("Torneo finalizado")
                    .prizes("Premio simbólico")
                    .registrationFee(BigDecimal.valueOf(1000))
                    .openInscription(false)
                    .organizer(tournamentCreator)
                    .build();
            tournaments.add(finished);
        }

        // 🕒 2 torneos en progreso (ya empezaron pero no terminaron)
        for (int i = 1; i <= 2; i++) {
            Tournament inProgress = Tournament.builder()
                    .name("En Progreso " + i)
                    .startDate(today.minusDays(10 + i))
                    .endDate(today.plusDays(10 + i))
                    .format(TournamentFormat.ROUND_ROBIN)
                    .maxTeams(16)
                    .description("Torneo actualmente en curso")
                    .prizes("Medallas")
                    .registrationFee(BigDecimal.valueOf(3000))
                    .openInscription(false)
                    .organizer(tournamentCreator)
                    .build();
            tournaments.add(inProgress);
        }

        // 📬 2 torneos abiertos a inscripción (empiezan en el futuro)
        for (int i = 1; i <= 2; i++) {
            Tournament openToRegister = Tournament.builder()
                    .name("Abierto " + i)
                    .startDate(today.plusDays(10 + i))
                    .endDate(today.plusDays(40 + i))
                    .format(TournamentFormat.GROUP_STAGE_AND_ELIMINATION)
                    .maxTeams(32)
                    .description("¡Inscripciones abiertas!")
                    .prizes("Trofeo y camiseta")
                    .registrationFee(BigDecimal.valueOf(2000))
                    .openInscription(true)
                    .organizer(tournamentCreator)
                    .build();
            tournaments.add(openToRegister);
        }

        tournamentRepository.saveAll(tournaments);

        System.out.println("✅ 6 torneos creados: 2 finalizados, 2 en progreso, 2 abiertos a inscripción.");
    }

    private void seedForBooking() {
        if (!userRepository.findAll().isEmpty())
            return;

        int currentYear = LocalDate.now().getYear();
        List<User> players = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {

            int age = 35 - (i - 1);
            int birthYear = currentYear - age;

            // Tira error porque nos faltaban atributos de User en nuestra branch.
            User player = new User(
                    "jugador" + i + "@mail.com", // username
                    "password", // password
                    "PLAYER", // role
                    "male", // gender
                    String.valueOf(birthYear), // age como string -> birthYear se calcula internamente
                    "CABA", // zone
                    "Jugador", // name
                    "Número" + i, // last_name
                    "https://picsum.photos/200?random=" + i // profilePicture
            );
            player.setEmailVerified(true); // opcional si querés que arranque verificado
            player.setActive(true); // ya está true por defecto, pero explícito es mejor
            players.add(userRepository.save(player));
        }

        User owner = new User(
                "dueno@mail.com",
                "password",
                "OWNER",
                "female",
                "40",
                "Zona Norte",
                "Dueña",
                "DeLaCancha",
                "https://picsum.photos/200?random=99");
        owner.setEmailVerified(true);
        owner.setActive(true);
        userRepository.save(owner);

        userRepository.save(owner);

        // 🏟️ Crear cancha
        Field field = Field.builder()
                .name("Cancha Monumental")
                .grassType("Sintético")
                .lighting(true)
                .zone("Zona Norte")
                .address("Av. Libertador 1234")
                .photoUrl("https://cancha.example.com/foto.jpg")
                .price(15000.0)
                .active(true)
                .owner(owner)
                .build();
        fieldRepository.save(field);

        // ⏰ Crear franja horaria
        TimeSlot timeSlot = TimeSlot.builder()
                .dayOfWeek(DayOfWeek.THURSDAY)
                .openTime(18)
                .closeTime(23)
                .field(field)
                .build();
        timeSlotRepository.save(timeSlot);

        Booking booking = new Booking(
                players.get(0),
                timeSlot,
                LocalDate.now().plusDays(1),
                20 // 20hs
        );
        bookingRepository.save(booking);

        Team teamOne = new Team();
        teamOne.setName("Los Rápidos");
        teamOne.setCaptain(players.get(0).getUsername());
        teamOne.setPrimaryColor("Rojo");
        teamOne.setSecondaryColor("Negro");
        teamOne.setLogo("https://logo.example.com/rapidos.png");
        for (int i = 0; i < 5; i++) {
            teamOne.addMember(players.get(i));
        }

        Team teamTwo = new Team();
        teamTwo.setName("Los Furiosos");
        teamTwo.setCaptain(players.get(5).getUsername());
        teamTwo.setPrimaryColor("Azul");
        teamTwo.setSecondaryColor("Blanco");
        teamTwo.setLogo("https://logo.example.com/furiosos.png");
        for (int i = 5; i < 10; i++) {
            teamTwo.addMember(players.get(i));
        }

        teamRepository.save(teamOne);
        teamRepository.save(teamTwo);

        OpenMatch match = new OpenMatch();
        match.setBooking(booking);
        match.setPlayers(players);
        match.setMaxPlayers(10);

        match.setTeamOne(teamOne);
        match.setTeamTwo(teamTwo);

        openMatchRepository.save(match);

        System.out.println("✅ Seed completada con jugadores, cancha, franja horaria, reserva y OpenMatch.");
    }

    private void seedForLeaveMatchTest() {
        // 👤 Crear un jugador
        User player = new User(
                "jugadorabandonador@mail.com",
                "password",
                "PLAYER",
                "male",
                "25",
                "CABA",
                "Jugador",
                "Uno",
                "https://picsum.photos/200?random=123"
        );
        player.setEmailVerified(true);
        player.setActive(true);
        userRepository.save(player);

        // 👤 Crear un dueño
        User owner = new User(
                "duenoabandonado@mail.com",
                "password",
                "OWNER",
                "female",
                "45",
                "Zona Oeste",
                "Dueña",
                "DeCancha",
                "https://picsum.photos/200?random=124"
        );
        owner.setEmailVerified(true);
        owner.setActive(true);
        userRepository.save(owner);

        // 🏟️ Crear cancha
        Field field = Field.builder()
                .name("Cancha Test")
                .grassType("Natural")
                .lighting(false)
                .zone("Zona Oeste")
                .address("Calle Falsa 123")
                .photoUrl("https://cancha.example.com/test.jpg")
                .price(10000.0)
                .active(true)
                .owner(owner)
                .build();
        fieldRepository.save(field);

        // ⏰ Crear franja horaria
        TimeSlot timeSlot = TimeSlot.builder()
                .dayOfWeek(LocalDate.now().getDayOfWeek())
                .openTime(17)
                .closeTime(21)
                .field(field)
                .build();
        timeSlotRepository.save(timeSlot);

        // 🗓️ Crear booking para mañana
        Booking booking = new Booking(
                player,
                timeSlot,
                LocalDate.now().plusDays(1),
                18 // 18hs
        );
        bookingRepository.save(booking);

        // 👥 Crear OpenMatch con el jugador incluido
        OpenMatch match = new OpenMatch();
        match.setBooking(booking);
        match.setPlayers(List.of(player));
        match.setMaxPlayers(5);
        openMatchRepository.save(match);

        System.out.println("✅ Seed para leaveOpenMatch cargada correctamente.");
        System.out.println("👉 matchId: " + match.getId() + ", userId: " + player.getId());
    }

}
