 import { z } from "zod";

export const CreateFieldRequestSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    grass: z.enum(["natural", "sintetico"], {
        required_error: "El tipo de césped es requerido",
    }),
    lighting: z.boolean(),
    roofing: z.boolean(),
    location: z.string().min(1, "La ubicación es requerida"),
    area: z.string().min(1, "La zona es requerida"),
    photos: z.array(z.string().url("URL de foto inválida")).optional().default([]),
    description: z.string().optional(),
    price: z.number().min(0, "El precio debe ser un número positivo").optional()
});


export type CreateFieldRequest = z.infer<typeof CreateFieldRequestSchema>;