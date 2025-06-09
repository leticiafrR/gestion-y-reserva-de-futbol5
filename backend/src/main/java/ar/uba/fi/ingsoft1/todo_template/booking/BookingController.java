package ar.uba.fi.ingsoft1.todo_template.booking;

import ar.uba.fi.ingsoft1.todo_template.config.security.JwtUserDetails;
import ar.uba.fi.ingsoft1.todo_template.timeslot.TimeSlotService;
import ar.uba.fi.ingsoft1.todo_template.user.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotNull;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bookings")
@Tag(name = "4 - Bookings", description = "Booking management endpoints")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;
    private final TimeSlotService timeSlotService;


    @GetMapping("/field/{fieldId}")
    @Operation(summary = "Get active bookings by field", description = "Returns all active bookings for a specific field")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of active bookings for the field", content = @Content(mediaType = "application/json", schema = @Schema(implementation = BookingDTO.class))),
            @ApiResponse(responseCode = "404", description = "Field not found", content = @Content)
    })
    public ResponseEntity<List<BookingDTO>> getBookingsByField(
            @Parameter(description = "ID of the field") @PathVariable @NotNull Long fieldId) {
        return ResponseEntity.ok(bookingService.getBookingsByField(fieldId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get booking by ID", description = "Returns the booking details by booking ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Booking found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = BookingDTO.class))),
            @ApiResponse(responseCode = "404", description = "Booking not found", content = @Content)
    })
    public ResponseEntity<BookingDTO> getBookingById(
            @Parameter(description = "ID of the booking") @PathVariable @NotNull Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @GetMapping("/availability/{fieldId}")
    @Operation(summary = "Horas disponibles para reservar", description = "Devuelve las horas libres por día para los próximos X días")
    public ResponseEntity<Map<LocalDate, List<Integer>>> getAvailableHours(
            @PathVariable Long fieldId,
            @RequestParam(defaultValue = "10") int days
    ) {
        return ResponseEntity.ok(timeSlotService.getAvailableHours(fieldId, days));
    }



    @GetMapping("/owner")
    @Operation(summary = "Reservas sobre canchas del dueño logueado")
    public ResponseEntity<List<BookingDTO>> getBookingsForOwner() {
        String username = getAuthenticatedUser().username();
        return ResponseEntity.ok(bookingService.getBookingsByOwnerUsername(username));
    }

    @GetMapping("/my")
    @Operation(summary = "Reservas propias del usuario logueado")
    public ResponseEntity<List<BookingDTO>> getMyBookings() {
        String username = getAuthenticatedUser().username();
        Long userId = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND)).getId();
        return ResponseEntity.ok(bookingService.getBookingsByUser(userId));
    }

    private JwtUserDetails getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (JwtUserDetails) authentication.getPrincipal();
    }


    @PostMapping
    @Operation(summary = "Create a new booking", description = "Create a new booking for a user, field, date and hour")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Booking created successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = BookingDTO.class))),
            @ApiResponse(responseCode = "400", description = "Invalid user or field", content = @Content)
    })
    public ResponseEntity<BookingDTO> createBooking(
            @RequestParam @NotNull Long userId,
            @RequestParam @NotNull Long timeslotId,
            @RequestParam @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam @NotNull Integer hour) {

        BookingDTO createdBooking = bookingService.createBooking(userId, timeslotId, date, hour);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdBooking);
    }


    @DeleteMapping("/{id}")
    @Operation(summary = "Cancel a booking", description = "Marks a booking as inactive (cancelled) without deleting it")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Booking cancelled successfully", content = @Content),
            @ApiResponse(responseCode = "404", description = "Booking not found", content = @Content)
    })
    public ResponseEntity<Void> cancelBooking(
            @Parameter(description = "ID of the booking to cancel") @PathVariable @NotNull Long id) {
        bookingService.cancelBooking(id);
        return ResponseEntity.noContent().build();
    }
}
