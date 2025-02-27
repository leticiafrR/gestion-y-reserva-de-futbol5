import { BASE_API_URL } from "@/config";
import { LoginResponseSchema } from "@/models/LoginResponse";

export async function login(formData: FormData) {
  return auth("/session", formData);
}

export async function signup(formData: FormData) {
  return auth("/users", formData);
}

export async function auth(endpoint: string, formData: FormData) {
  const response = await fetch(BASE_API_URL + endpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(Object.fromEntries(formData.entries())),
  });
  return LoginResponseSchema.parse(await response.json());
}
