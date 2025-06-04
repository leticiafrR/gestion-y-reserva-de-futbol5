package ar.uba.fi.ingsoft1.todo_template.booking;

import java.time.LocalTime;

public record TimeSlotDTO(LocalTime startTime, LocalTime endTime) {}
