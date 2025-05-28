import { z } from "zod";

export const CreateFieldRequestSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  grassType: z.enum(["natural", "sintetico"], {
    required_error: "El tipo de césped es requerido",
  }),
  hasLighting: z.boolean(),
  location: z.object({
    area: z.string().min(1, "El área es requerida"),
    address: z.string().min(1, "La dirección es requerida"),
  }),
  photos: z.array(z.string().url("URL de foto inválida")).optional(),
});

export type CreateFieldRequest = z.infer<typeof CreateFieldRequestSchema>; 