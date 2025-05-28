import { z } from "zod";

export const SignupRequestSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  photo: z.union([z.string().url(), z.literal("")]).optional(),
  age: z.number().min(18, "Must be at least 18 years old"),
  gender: z.enum(["male", "female", "other"]),
  zone: z.string().min(1, "Zone is required"),
  password: z.string().min(1, "Password must not be empty"),
});

export type SignupRequest = z.infer<typeof SignupRequestSchema>; 
