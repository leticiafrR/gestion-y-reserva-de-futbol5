import { z } from "zod";

export const TeamSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "El nombre es requerido"),
    logo: z.string().url("URL de logo inválida").optional(),
    colors: z.array(z.string().min(1, "El color es requerido")).optional(),
    ranking: z.number().min(1, "El ranking es requerido").optional(),
    ownerId: z.string(),
    members: z.array(z.string()).default([]), // Array of user IDs
});

export type Team = z.infer<typeof TeamSchema>;