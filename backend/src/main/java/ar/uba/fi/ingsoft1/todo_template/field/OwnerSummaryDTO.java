package ar.uba.fi.ingsoft1.todo_template.field;

public record OwnerSummaryDTO(
        int totalFields,
        int totalBookingsToday,
        double occupancyPercentage
) {}
