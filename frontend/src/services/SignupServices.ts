// @ts-nocheck - Mocked for development
import { useMutation } from "@tanstack/react-query";
import { SignupRequest } from "@/models/Signup";
import { BASE_API_URL } from "@/config/app-query-client";

// @ts-expect-error - Mocked for development
// import { LoginResponseSchema } from "@/models/Login";

export function useSignup() {
  return useMutation({
    mutationFn: async (req: SignupRequest) => {
      // Transformar los datos al formato que espera el backend
      const backendRequest = {
        name: req.firstName,
        last_name: req.lastName,
        username: req.email,
        password: req.password,
        role: req.userType,
        gender: req.gender,
        age: req.age.toString(), // El backend calculará el birthYear a partir de la edad
        zone: req.zone,
        urlProfilePicture: req.photo || req.urlProfilePicture // Usar la URL de la foto subida o la URL por defecto
      };

      const response = await signup(backendRequest);
      return response;
    },
  });
}

interface BackendSignupRequest {
  name: string;
  last_name: string;
  username: string;
  password: string;
  role: string;
  gender: string;
  age: string;
  zone: string;
  urlProfilePicture: string;
}

async function signup(data: BackendSignupRequest) {
  const response = await fetch(`${BASE_API_URL}/users/register`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || `Error en el registro: ${response.status}`);
  }

  // No necesitamos devolver los tokens ya que el usuario debe verificar su email primero
  return {
    success: true,
    message: "Registro exitoso. Por favor, verifica tu email para continuar."
  };

  /*
  const response = await fetch(BASE_API_URL + "/users", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (response.ok) {
    return LoginResponseSchema.parse(await response.json());
  } else {
    throw new Error(`Signup failed with status ${response.status}: ${await response.text()}`);
  }
  */
}
