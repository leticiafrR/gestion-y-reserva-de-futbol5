import { z } from "zod";

export const FieldSchema = z.object({
    id: z.string().uuid("ID de cancha inválido"),
    name: z.string().min(1, "El nombre es requerido"),
    type: z.string().min(1, "El tipo de cancha es requerido"),
    description: z.string().min(1, "La descripción es requerida"),
    pricePerHour: z.number().min(0, "El precio por hora debe ser mayor o igual a 0"),
    capacity: z.number().min(1, "La capacidad debe ser mayor a 0"),
    grassType: z.enum(["natural", "synthetic"], {
        required_error: "El tipo de césped es requerido",
    }),
    address: z.string().min(1, "La dirección es requerida"),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    isCovered: z.boolean(),
    hasLighting: z.boolean(),
    status: z.enum(["available", "unavailable", "maintenance"]),
    isAvailable: z.boolean().optional(),
});
export type Field = z.infer<typeof FieldSchema>;

