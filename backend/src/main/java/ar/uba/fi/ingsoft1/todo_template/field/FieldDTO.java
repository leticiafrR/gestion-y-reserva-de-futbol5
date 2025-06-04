package ar.uba.fi.ingsoft1.todo_template.field;

public record FieldDTO(
        Long id,
        String name,
        String grassType,
        Boolean lighting,
        String zone,
        String photoUrl,
        Double price,
        Boolean active,
        LocationDTO location
) {
    public static FieldDTO from(Field field) {
        return new FieldDTO(
                field.getId(),
                field.getName(),
                field.getGrassType(),
                field.getLighting(),
                field.getZone(),
                field.getPhotoUrl(),
                field.getPrice(),
                field.getActive(),
                new LocationDTO(field.getLat(), field.getLng(),field.getAddress())
        );
    }
}
