package ar.uba.fi.ingsoft1.todo_template.field;

import jakarta.validation.constraints.NotNull;

public class FieldCreateDTO {

    @NotNull(message = "Name cannot be null")
    public String name;

    @NotNull(message = "Grass type cannot be null")
    public String grassType;

    @NotNull (message = "Lighting cannot be null")
    public Boolean lighting;

    @NotNull(message = "Zone cannot be null")
    public String zone;

    @NotNull (message = "Address cannot be null")
    public String address;

    @NotNull(message = "Photo URL cannot be null")
    public String photoUrl;

    public boolean active = true;
}
