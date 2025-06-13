import { z } from "zod";

export const TeamSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "El nombre es requerido"),
  logo: z.string().url("URL de logo inválida").optional(),
  colors: z.tuple([z.string(), z.string()]).optional(),
  ownerId: z.string(),
  members: z.array(z.string()).optional(),
});

export type Team = z.infer<typeof TeamSchema>;