package ar.uba.fi.ingsoft1.todo_template.field;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record LocationDTO(
        @NotNull(message = "La latitud es obligatoria") Double lat,
        @NotNull(message = "La longitud es obligatoria") Double lng,
        @NotBlank(message = "La dirección es obligatoria") String address
) {}
