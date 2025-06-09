import { z } from "zod";

export const UserSchema = z.object({
    id: z.string().uuid("ID de usuario inválido"),
    name: z.string().min(1, "El nombre es requerido"),
    lastName: z.string().min(1, "El apellido es requerido"),
    email: z.string().email("Email inválido"),
    photo: z.string().url("URL de foto inválida").optional(),
    age: z.number().min(1, "La edad es requerida"),
    gender: z.enum(["M", "F"]).optional(),
    userType: z.enum(["player", "admin"]).optional(),
});

export type User = z.infer<typeof UserSchema>;

