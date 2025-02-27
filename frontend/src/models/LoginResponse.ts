import { z } from "zod";

export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().nullable(),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;
