import { z } from "zod";

export const SignupRequestSchema = z.object({
  firstName: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "El apellido es requerido"),
  email: z.string().email("Email inválido"),
  photo: z.union([z.instanceof(File), z.string().url(), z.literal("")]).optional(),
  age: z.number().min(18, "Debe ser mayor de 18 años"),
  gender: z.enum(["male", "female", "other"], {
    required_error: "El género es requerido",
  }),
  zone: z.string().min(1, "La zona es requerida"),
  password: z.string().min(1, "La contraseña no puede estar vacía"),
  userType: z.enum(["owner", "user"], { 
    required_error: "El tipo de usuario es requerido",
    invalid_type_error: "El tipo de usuario debe ser 'owner' o 'user'"
  }),
});

export type SignupRequest = z.infer<typeof SignupRequestSchema>; 
