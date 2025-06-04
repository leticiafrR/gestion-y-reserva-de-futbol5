import { z } from "zod";

export const FieldSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "El nombre es requerido"),
    grassType: z.enum(["natural", "sintetico"], {
        required_error: "El tipo de césped es requerido",
    }),
    lighting: z.boolean(),
    roofing: z.boolean(),
    // address: z.string().min(1, "La dirección es requerida"),
    location: z.object({
        lat: z.number(),
        lng: z.number(),
        address: z.string().min(1, "La dirección es requerida"),
    }),
    zone: z.string().min(1, "La zona es requerida"),
    photoUrl: z.string().url("URL de foto inválida").optional().default(""),
    description: z.string().optional(),
    price: z.number().min(0, "El precio debe ser un número positivo").optional(),
    isAvailable: z.boolean().optional(),
    active: z.boolean().default(true),
    schedule: z.array(z.object({
      dayOfWeek: z.enum([
        "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"
      ]),
      openTime: z.string(),
      closeTime: z.string()
    })).optional().default([]),
});

export type Field = z.infer<typeof FieldSchema>;

