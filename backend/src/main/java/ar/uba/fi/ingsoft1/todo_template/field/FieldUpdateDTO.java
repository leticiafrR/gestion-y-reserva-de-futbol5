package ar.uba.fi.ingsoft1.todo_template.field;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record FieldUpdateDTO(
        @NotBlank String name,
        @NotBlank String grassType,
        @NotNull Boolean lighting,
        @NotBlank String zone,
        @NotBlank String address,
        @NotBlank String photoUrl,
        @NotNull @PositiveOrZero Double price
) {}
