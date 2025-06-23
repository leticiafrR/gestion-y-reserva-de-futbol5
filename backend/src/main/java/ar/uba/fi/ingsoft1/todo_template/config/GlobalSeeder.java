package ar.uba.fi.ingsoft1.todo_template.config;

import ar.uba.fi.ingsoft1.todo_template.booking.Booking;
import ar.uba.fi.ingsoft1.todo_template.booking.BookingRepository;
import ar.uba.fi.ingsoft1.todo_template.field.Field;
import ar.uba.fi.ingsoft1.todo_template.field.FieldRepository;
import ar.uba.fi.ingsoft1.todo_template.match.CloseMatch;
import ar.uba.fi.ingsoft1.todo_template.match.CloseMatchRepository;
import ar.uba.fi.ingsoft1.todo_template.match.OpenMatch;
import ar.uba.fi.ingsoft1.todo_template.match.OpenMatchRepository;
import ar.uba.fi.ingsoft1.todo_template.match.OpenMatchTeam;
import ar.uba.fi.ingsoft1.todo_template.match.OpenMatchTeamRepository;
import ar.uba.fi.ingsoft1.todo_template.team.Team;
import ar.uba.fi.ingsoft1.todo_template.team.TeamRepository;
import ar.uba.fi.ingsoft1.todo_template.timeslot.TimeSlot;
import ar.uba.fi.ingsoft1.todo_template.timeslot.TimeSlotRepository;
import ar.uba.fi.ingsoft1.todo_template.tournament.Tournament;
import ar.uba.fi.ingsoft1.todo_template.tournament.TournamentFormat;
import ar.uba.fi.ingsoft1.todo_template.tournament.TournamentRepository;
import ar.uba.fi.ingsoft1.todo_template.tournament.fixture.MatchStatus;
import ar.uba.fi.ingsoft1.todo_template.tournament.fixture.TournamentMatch;
import ar.uba.fi.ingsoft1.todo_template.tournament.fixture.TournamentMatchRepository;
import ar.uba.fi.ingsoft1.todo_template.tournament.teamRegistration.TeamRegisteredTournament;
import ar.uba.fi.ingsoft1.todo_template.tournament.teamRegistration.TeamRegisteredTournamentRepository;
import ar.uba.fi.ingsoft1.todo_template.tournament.teamRegistration.TeamTournamentId;
import ar.uba.fi.ingsoft1.todo_template.user.User;
import ar.uba.fi.ingsoft1.todo_template.user.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
public class GlobalSeeder {

    private final UserRepository userRepository;
    private final OpenMatchRepository openMatchRepository;
    private final CloseMatchRepository closeMatchRepository;
    private final FieldRepository fieldRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final BookingRepository bookingRepository;
    private final TeamRepository teamRepository;
    private final TournamentRepository tournamentRepository;
    private final OpenMatchTeamRepository openMatchTeamRepository;
    private final TeamRegisteredTournamentRepository teamRegisteredTournamentRepository;
    private final TournamentMatchRepository tournamentMatchRepository;
    private final PasswordEncoder passwordEncoder;

    @PostConstruct
    public void seedAll() {
        if (!userRepository.findAll().isEmpty())
            return;
        
        // Generar los 25 usuarios primero
        List<User> players = seedPlayers();
        
        // Generar usuarios owner con canchas
        seedFieldOwners();
        
        seedForLeavingTeam(players);
        
        // Generar 8 equipos adicionales
        List<Team> additionalTeams = seedAdditionalTeams(players);
        
        // Generar torneo con organizador
        seedTournamentWithOrganizer(additionalTeams);
        
        // Generar partidos abiertos y cerrados
        seedOpenAndClosedMatches(players);
        
        // Generar partidos pasados para el historial
        seedPastMatches(players);
    }

    private List<User> seedPlayers() {
        List<User> players = new ArrayList<>();
        
        for (int i = 1; i <= 25; i++) {
            User player = new User(
                    "PLAYER." + i + "@example.com",
                    "$2a$10$csUxD/U6Q6NeJOtDA9BpoeAIsAUdIBaWA5pNauZ3LE4xL75B/AW1C", // "abcd" encriptada
                    "user",
                    "male",
                    String.valueOf(20 + i),
                    "CABA",
                    "Player",
                    "Number" + i,
                    "https://picsum.photos/200?random=player" + i
            );
            player.setEmailVerified(true);
            player.setActive(true);
            players.add(userRepository.save(player));
        }
        
        return players;
    }

    private void seedFieldOwners() {
        // Verificar si ya existen los owners para evitar duplicados
        if (userRepository.findByUsername("FIELD.OWNER@example.com").isPresent()) {
            return;
        }

        // 👤 Crear un solo FIELD.OWNER con 3 canchas
        User fieldOwner = new User(
                "FIELD.OWNER@example.com",
                "$2a$10$csUxD/U6Q6NeJOtDA9BpoeAIsAUdIBaWA5pNauZ3LE4xL75B/AW1C", // "abcd" encriptada
                "owner",
                "male",
                "35",
                "CABA",
                "Field",
                "Owner",
                "https://picsum.photos/200?random=owner"
        );
        fieldOwner.setEmailVerified(true);
        fieldOwner.setActive(true);
        fieldOwner = userRepository.save(fieldOwner);

        // Crear 3 canchas con horarios distintos
        List<Field> fields = createFieldsForOwner(fieldOwner, 3, "Complejo Deportivo Central");
        
        // Cancha 1: 15-23 lun-vie
        createTimeSlotsForField(fields.get(0), 
            List.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY), 
            15, 23);
        
        // Cancha 2: 7-18 mar-vie
        createTimeSlotsForField(fields.get(1), 
            List.of(DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY), 
            7, 18);
        
        // Cancha 3: 17-23 jue-dom
        createTimeSlotsForField(fields.get(2), 
            List.of(DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY), 
            17, 23);
    }

    private List<Field> createFieldsForOwner(User owner, int fieldCount, String complexName) {
        List<Field> fields = new ArrayList<>();
        
        for (int i = 1; i <= fieldCount; i++) {
            Field field = Field.builder()
                    .name(complexName + " - Cancha " + i)
                    .grassType(i % 2 == 0 ? "Sintético" : "Natural")
                    .lighting(true)
                    .roofing(i == 2) // La cancha 2 será techada
                    .zone(owner.getZone())
                    .address("Av. Deportiva " + i + ", " + owner.getZone())
                    .photoUrl("https://picsum.photos/400/300?random=field" + owner.getId() + "_" + i)
                    .price(1500.0 + (i * 100.0)) // Precios variados: 1600, 1700, 1800
                    .active(true)
                    .owner(owner)
                    .build();
            
            fields.add(fieldRepository.save(field));
        }
        
        return fields;
    }

    private void createTimeSlotsForField(Field field, List<DayOfWeek> days, int openTime, int closeTime) {
        for (DayOfWeek day : days) {
            TimeSlot timeSlot = TimeSlot.builder()
                    .dayOfWeek(day)
                    .openTime(openTime)
                    .closeTime(closeTime)
                    .field(field)
                    .build();
            
            timeSlotRepository.save(timeSlot);
        }
    }

    private void seedForLeavingTeam(List<User> players) {
        // Verificar si ya existe el seed para evitar duplicados
        if (userRepository.findByUsername("PLAYER.1@example.com").isPresent() && 
            !teamRepository.findAll().isEmpty()) {
            return;
        }

        // 👤 Usar el primer usuario como dueño del equipo (PLAYER.1@example.com)
        User teamOwner = players.get(0);

        // 👥 Usar los usuarios 2, 3 y 4 como miembros del equipo
        List<User> teamMembers = new ArrayList<>();
        teamMembers.add(players.get(1)); // PLAYER.2@example.com
        teamMembers.add(players.get(2)); // PLAYER.3@example.com
        teamMembers.add(players.get(3)); // PLAYER.4@example.com

        // 🏆 Crear el equipo
        Team team = Team.builder()
                .name("Equipo de Prueba")
                .captain("PLAYER.1@example.com")
                .primaryColor("#FF0000")
                .secondaryColor("#0000FF")
                .logo("https://picsum.photos/200?random=team")
                .build();
        
        // Agregar el dueño como miembro
        try {
            team.addMember(teamOwner);
        } catch (Exception e) {
            // Ignorar si ya es miembro
        }
        
        // Agregar los otros miembros
        for (User member : teamMembers) {
            try {
                team.addMember(member);
            } catch (Exception e) {
                // Ignorar si ya es miembro
            }
        }
        
        team = teamRepository.save(team);
    }

    private List<Team> seedAdditionalTeams(List<User> players) {
        // Verificar si ya existen equipos adicionales para evitar duplicados
        if (teamRepository.findByName("Equipo Los Tigres").isPresent()) {
            return teamRepository.findAll();
        }

        String[] teamNames = {
            "Equipo Los Tigres",
            "Equipo Los Leones", 
            "Equipo Los Halcones",
            "Equipo Los Águilas",
            "Equipo Los Lobos",
            "Equipo Los Toros",
            "Equipo Los Dragones",
            "Equipo Los Fénix"
        };

        String[] primaryColors = {
            "#FF6B35", "#4ECDC4", "#45B7D1", "#96CEB4", 
            "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F"
        };

        String[] secondaryColors = {
            "#2C3E50", "#34495E", "#8E44AD", "#2980B9",
            "#E67E22", "#E74C3C", "#27AE60", "#F39C12"
        };

        Random random = new Random(42); // Seed fijo para reproducibilidad
        List<Team> teams = new ArrayList<>();

        for (int i = 0; i < 8; i++) {
            // Usar PLAYER.5 a PLAYER.12 como owners de los equipos
            User teamOwner = players.get(4 + i); // PLAYER.5 a PLAYER.12
            
            // Crear lista de jugadores disponibles
            List<User> availablePlayers = new ArrayList<>();
            
            // Agregar PLAYER.14 a PLAYER.25
            availablePlayers.addAll(players.subList(13, players.size()));
            
            List<User> selectedMembers = new ArrayList<>();
            
            // Para el primer equipo, incluir PLAYER.1 garantizado
            if (i == 0) {
                selectedMembers.add(players.get(0)); // PLAYER.1 garantizado
                // Seleccionar 3 jugadores más aleatorios
                Collections.shuffle(availablePlayers, random);
                selectedMembers.addAll(availablePlayers.subList(0, 3));
            } else {
                // Para los otros equipos, seleccionar 4 jugadores aleatorios
                Collections.shuffle(availablePlayers, random);
                selectedMembers = availablePlayers.subList(0, 4);
            }
            
            // Crear el equipo
            Team team = Team.builder()
                    .name(teamNames[i])
                    .captain(teamOwner.getUsername())
                    .primaryColor(primaryColors[i])
                    .secondaryColor(secondaryColors[i])
                    .logo("https://picsum.photos/200?random=team" + (i + 2))
                    .build();
            
            // Agregar el owner como miembro
            try {
                team.addMember(teamOwner);
            } catch (Exception e) {
                // Ignorar si ya es miembro
            }
            
            // Agregar los miembros seleccionados
            for (User member : selectedMembers) {
                try {
                    team.addMember(member);
                } catch (Exception e) {
                    // Ignorar si ya es miembro
                }
            }
            
            teams.add(teamRepository.save(team));
        }
        
        return teams;
    }

    private void seedTournamentWithOrganizer(List<Team> teams) {
        // Verificar si ya existe el torneo para evitar duplicados
        if (userRepository.findByUsername("ORGANIZER@example.com").isPresent()) {
            return;
        }

        // 👤 Crear el organizador
        User organizer = new User(
                "ORGANIZER@example.com",
                "$2a$10$csUxD/U6Q6NeJOtDA9BpoeAIsAUdIBaWA5pNauZ3LE4xL75B/AW1C", // "abcd" encriptada
                "organizer",
                "male",
                "30",
                "CABA",
                "Tournament",
                "Organizer",
                "https://picsum.photos/200?random=organizer"
        );
        organizer.setEmailVerified(true);
        organizer.setActive(true);
        organizer = userRepository.save(organizer);

        // 🏆 Crear el torneo
        Tournament tournament = Tournament.builder()
                .name("Torneo de Verano 2024")
                .startDate(LocalDate.now().minusDays(7)) // Comenzó hace 7 días
                .format(TournamentFormat.ROUND_ROBIN)
                .maxTeams(8)
                .endDate(LocalDate.now().plusDays(14)) // Termina en 14 días
                .description("Torneo de fútbol 5 con formato todos contra todos")
                .prizes("1er lugar: $5000, 2do lugar: $3000, 3er lugar: $1000")
                .registrationFee(new BigDecimal("500"))
                .openInscription(false) // Ya no está abierto para inscripción
                .registeredTeams(8) // Todos los equipos inscriptos
                .organizer(organizer)
                .build();
        
        tournament = tournamentRepository.save(tournament);

        // 📝 Registrar todos los equipos en el torneo
        List<TeamRegisteredTournament> registeredTeams = new ArrayList<>();
        for (Team team : teams) {
            TeamTournamentId id = new TeamTournamentId(tournament.getId(), team.getId());
            TeamRegisteredTournament registeredTeam = TeamRegisteredTournament.builder()
                    .id(id)
                    .tournament(tournament)
                    .team(team)
                    .points(0)
                    .goalsFor(0)
                    .goalsAgainst(0)
                    .wins(0)
                    .draws(0)
                    .losses(0)
                    .build();
            registeredTeams.add(teamRegisteredTournamentRepository.save(registeredTeam));
        }

        // 🏟️ Obtener una cancha para los partidos
        Field field = fieldRepository.findAll().get(0);

        // ⚽ Crear 6 partidos con resultados (primeras 6 fechas del round robin)
        createTournamentMatches(tournament, registeredTeams, field);
    }

    private void createTournamentMatches(Tournament tournament, List<TeamRegisteredTournament> registeredTeams, Field field) {
        // Para 8 equipos en ROUND_ROBIN, necesitamos 28 partidos (8 * 7 / 2)
        // Los primeros 6 partidos ya se jugaron, 1 en progreso, el resto están programados
        
        // Resultados predefinidos para los primeros 6 partidos (ya jugados)
        int[][] completedResults = {
            {3, 1}, {4, 2}, {2, 2}, {5, 1}, {1, 4}, {3, 3}
        };

        LocalDateTime baseDateTime = LocalDateTime.now().minusDays(6).withHour(20).withMinute(0);
        int matchNumber = 1;
        int roundNumber = 1;

        // Generar todos los partidos del ROUND_ROBIN
        for (int i = 0; i < registeredTeams.size(); i++) {
            for (int j = i + 1; j < registeredTeams.size(); j++) {
                TeamRegisteredTournament homeTeam = registeredTeams.get(i);
                TeamRegisteredTournament awayTeam = registeredTeams.get(j);

                TournamentMatch match = new TournamentMatch();
                match.setTournament(tournament);
                match.setHomeTeam(homeTeam);
                match.setAwayTeam(awayTeam);
                match.setField(field);
                match.setRoundNumber(roundNumber);
                match.setMatchNumber(matchNumber);
                match.setHomeTeamNextMatch(false);

                // Los primeros 6 partidos ya se jugaron
                if (matchNumber <= 6) {
                    match.setScheduledDateTime(baseDateTime.plusDays(matchNumber - 1));
                    match.setStatus(MatchStatus.COMPLETED);
                    match.setHomeTeamScore(completedResults[matchNumber - 1][0]);
                    match.setAwayTeamScore(completedResults[matchNumber - 1][1]);
                    
                    // Actualizar estadísticas de los equipos
                    updateTeamStatistics(homeTeam, awayTeam, completedResults[matchNumber - 1][0], completedResults[matchNumber - 1][1]);
                } 
                // El partido 7 está en progreso
                else if (matchNumber == 7) {
                    match.setScheduledDateTime(LocalDateTime.now().minusMinutes(30)); // Comenzó hace 30 minutos
                    match.setStatus(MatchStatus.IN_PROGRESS);
                    match.setHomeTeamScore(null); // Sin resultado registrado
                    match.setAwayTeamScore(null); // Sin resultado registrado
                }
                // Los partidos restantes están programados para el futuro
                else {
                    match.setScheduledDateTime(baseDateTime.plusDays(matchNumber + 5)); // Comenzar después de los partidos jugados
                    match.setStatus(MatchStatus.SCHEDULED);
                    match.setHomeTeamScore(null);
                    match.setAwayTeamScore(null);
                }

                match = tournamentMatchRepository.save(match);
                matchNumber++;
            }
            
            // Incrementar round number cada 4 partidos (aproximadamente)
            if (matchNumber % 4 == 1 && matchNumber > 1) {
                roundNumber++;
            }
        }
    }

    private void updateTeamStatistics(TeamRegisteredTournament homeTeam, TeamRegisteredTournament awayTeam, int homeScore, int awayScore) {
        // Actualizar estadísticas del equipo local
        homeTeam.setGoalsFor(homeTeam.getGoalsFor() + homeScore);
        homeTeam.setGoalsAgainst(homeTeam.getGoalsAgainst() + awayScore);
        
        // Actualizar estadísticas del equipo visitante
        awayTeam.setGoalsFor(awayTeam.getGoalsFor() + awayScore);
        awayTeam.setGoalsAgainst(awayTeam.getGoalsAgainst() + homeScore);

        // Determinar resultado y actualizar puntos
        if (homeScore > awayScore) {
            // Victoria local
            homeTeam.setWins(homeTeam.getWins() + 1);
            homeTeam.setPoints(homeTeam.getPoints() + 3);
            awayTeam.setLosses(awayTeam.getLosses() + 1);
        } else if (awayScore > homeScore) {
            // Victoria visitante
            awayTeam.setWins(awayTeam.getWins() + 1);
            awayTeam.setPoints(awayTeam.getPoints() + 3);
            homeTeam.setLosses(homeTeam.getLosses() + 1);
        } else {
            // Empate
            homeTeam.setDraws(homeTeam.getDraws() + 1);
            homeTeam.setPoints(homeTeam.getPoints() + 1);
            awayTeam.setDraws(awayTeam.getDraws() + 1);
            awayTeam.setPoints(awayTeam.getPoints() + 1);
        }

        teamRegisteredTournamentRepository.save(homeTeam);
        teamRegisteredTournamentRepository.save(awayTeam);
    }

    private void seedOpenAndClosedMatches(List<User> players) {
        // Verificar si ya existen partidos para evitar duplicados
        if (!openMatchRepository.findAll().isEmpty()) {
            return;
        }

        // Obtener una cancha para los partidos
        Field field = fieldRepository.findAll().get(0);
        
        // Crear 6 partidos abiertos
        for (int i = 1; i <= 6; i++) {
            // Seleccionar un creador aleatorio (PLAYER.1 a PLAYER.25)
            User creator = players.get((i - 1) % players.size());
            
            // Obtener un TimeSlot válido para la cancha
            List<TimeSlot> timeSlots = timeSlotRepository.findAll();
            TimeSlot timeSlot = timeSlots.get(0); // Usar el primer time slot disponible
            
            // Crear booking para el partido
            Booking booking = new Booking(
                creator,
                timeSlot,
                LocalDate.now().plusDays(i),
                20 + (i % 3) // 20, 21, 22 horas
            );
            booking = bookingRepository.save(booking);
            
            // Crear equipos para el partido abierto
            OpenMatchTeam teamOne = OpenMatchTeam.builder()
                    .members(new ArrayList<>())
                    .build();
            teamOne = openMatchTeamRepository.save(teamOne);
            
            OpenMatchTeam teamTwo = OpenMatchTeam.builder()
                    .members(new ArrayList<>())
                    .build();
            teamTwo = openMatchTeamRepository.save(teamTwo);
            
            // Crear partido abierto
            OpenMatch openMatch = new OpenMatch();
            openMatch.setBooking(booking);
            openMatch.setIsActive(true);
            openMatch.setMinPlayers(8);
            openMatch.setMaxPlayers(12);
            openMatch.setTeamOne(teamOne);
            openMatch.setTeamTwo(teamTwo);
            openMatch.setPlayers(new ArrayList<>());
            
            // Agregar algunos jugadores al partido
            List<User> matchPlayers = new ArrayList<>();
            for (int j = 0; j < 6; j++) {
                User player = players.get((i + j) % players.size());
                matchPlayers.add(player);
            }
            openMatch.setPlayers(matchPlayers);
            
            openMatchRepository.save(openMatch);
        }
        
        // Crear 6 partidos cerrados (CloseMatch)
        for (int i = 1; i <= 6; i++) {
            // Seleccionar un creador aleatorio (PLAYER.1 a PLAYER.25)
            User creator = players.get((i + 5) % players.size());
            
            // Obtener un TimeSlot válido para la cancha
            List<TimeSlot> timeSlots = timeSlotRepository.findAll();
            TimeSlot timeSlot = timeSlots.get(0); // Usar el primer time slot disponible
            
            // Crear booking para el partido
            Booking booking = new Booking(
                creator,
                timeSlot,
                LocalDate.now().plusDays(i + 7),
                19 + (i % 2) // 19, 20 horas
            );
            booking = bookingRepository.save(booking);
            
            // Obtener equipos para asignar al partido cerrado
            List<Team> availableTeams = teamRepository.findAll();
            Team teamOne = availableTeams.get(i % availableTeams.size());
            Team teamTwo = availableTeams.get((i + 1) % availableTeams.size());
            
            // Crear partido cerrado
            CloseMatch closeMatch = new CloseMatch();
            closeMatch.setBooking(booking);
            closeMatch.setIsActive(true);
            closeMatch.setTeamOne(teamOne);
            closeMatch.setTeamTwo(teamTwo);
            
            closeMatchRepository.save(closeMatch);
        }
    }

    private void seedPastMatches(List<User> players) {
        // Verificar si ya existen partidos pasados para evitar duplicados
        if (!openMatchRepository.findAll().isEmpty() && openMatchRepository.findAll().size() > 6) {
            return;
        }

        // Obtener las 3 canchas para los partidos
        List<Field> fields = fieldRepository.findAll();
        User player1 = players.get(0); // PLAYER.1
        int[] diasPasados = {3, 5, 8};
        int[] horas = {18, 20, 22};
        
        // Crear 3 partidos abiertos pasados variados
        for (int i = 0; i < 3; i++) {
            final int idx = i;
            User creator = players.get((idx + 2) % players.size());
            Field field = fields.get(idx % fields.size());
            // Buscar un timeslot compatible con la cancha y la hora
            List<TimeSlot> timeSlots = timeSlotRepository.findAll();
            TimeSlot timeSlot = timeSlots.stream().filter(ts -> ts.getField().getId().equals(field.getId()) && ts.getOpenTime() <= horas[idx] && ts.getCloseTime() > horas[idx]).findFirst().orElse(timeSlots.get(0));
            Booking booking = new Booking(
                creator,
                timeSlot,
                LocalDate.now().minusDays(diasPasados[idx]),
                horas[idx]
            );
            booking = bookingRepository.save(booking);
            OpenMatchTeam teamOne = OpenMatchTeam.builder().members(new ArrayList<>()).build();
            teamOne = openMatchTeamRepository.save(teamOne);
            OpenMatchTeam teamTwo = OpenMatchTeam.builder().members(new ArrayList<>()).build();
            teamTwo = openMatchTeamRepository.save(teamTwo);
            OpenMatch openMatch = new OpenMatch();
            openMatch.setBooking(booking);
            openMatch.setIsActive(true);
            openMatch.setMinPlayers(8);
            openMatch.setMaxPlayers(12);
            openMatch.setTeamOne(teamOne);
            openMatch.setTeamTwo(teamTwo);
            openMatch.setPlayers(new ArrayList<>());
            List<User> matchPlayers = new ArrayList<>();
            matchPlayers.add(player1);
            for (int j = 1; j < 8; j++) {
                User player = players.get((idx + j + 3) % players.size());
                if (!player.getUsername().equals(player1.getUsername())) {
                    matchPlayers.add(player);
                }
            }
            openMatch.setPlayers(matchPlayers);
            openMatchRepository.save(openMatch);
        }
        
        // Crear 2 partidos cerrados pasados (igual que antes)
        List<Team> availableTeams = teamRepository.findAll();
        for (int i = 1; i <= 2; i++) {
            User creator = players.get((i + 10) % players.size());
            List<TimeSlot> timeSlots = timeSlotRepository.findAll();
            TimeSlot timeSlot = timeSlots.get(0);
            Booking booking = new Booking(
                creator,
                timeSlot,
                LocalDate.now().minusDays(i + 5),
                19 + (i % 2)
            );
            booking = bookingRepository.save(booking);
            Team teamOne = availableTeams.get(i % availableTeams.size());
            Team teamTwo = availableTeams.get((i + 1) % availableTeams.size());
            if (i == 1 && !teamOne.getMembers().contains(player1)) {
                teamOne.getMembers().add(player1);
                teamRepository.save(teamOne);
            }
            CloseMatch closeMatch = new CloseMatch();
            closeMatch.setBooking(booking);
            closeMatch.setIsActive(true);
            closeMatch.setTeamOne(teamOne);
            closeMatch.setTeamTwo(teamTwo);
            closeMatchRepository.save(closeMatch);
        }
    }
}


