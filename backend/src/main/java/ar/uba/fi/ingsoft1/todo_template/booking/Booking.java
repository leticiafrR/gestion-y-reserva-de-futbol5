package ar.uba.fi.ingsoft1.todo_template.booking;

import ar.uba.fi.ingsoft1.todo_template.timeslot.TimeSlot;
import ar.uba.fi.ingsoft1.todo_template.user.User;
import jakarta.persistence.*;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Entity
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private User user;

    @ManyToOne(optional = false)
    private TimeSlot timeSlot;

    @Column(nullable = false)
    private LocalDate bookingDate;

    private int bookingHour;

    private boolean active = true;

    private LocalDateTime createdAt;


    protected Booking() {}

    public Booking(User user, TimeSlot timeSlot, LocalDate bookingDate, int bookingHour) {
        this.user = user;
        this.timeSlot = timeSlot;
        this.bookingDate = bookingDate;
        this.bookingHour = bookingHour;
    }


    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public void cancel() {
        this.active = false;
    }
}
