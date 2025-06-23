// Re-export authentication services
export { useLogin } from "./LoginServices.ts";
export { useSignup } from "./SignupServices.ts";
export { useCreateField } from "./CreateFieldServices.ts";
export { useAvailableFields } from "./AvailableFieldsServices.ts";
export { useUserTeams } from "./TeamServices.ts";
export { useProfile } from "./ProfileServices.ts";
export { useAllTournaments } from "./TournamentService.ts";

import { useQuery } from "@tanstack/react-query";
import { BASE_API_URL, getAuthToken } from "@/config/app-query-client";

const fetchUserProfile = async () => {
    const accessToken = getAuthToken();
    if (!accessToken) return null;

    try {
        const response = await fetch(`${BASE_API_URL}/users/me`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/json",
            },
        });
        if (!response.ok) {
            throw new Error("Failed to fetch user profile");
        }
        const profile = await response.json();
        localStorage.setItem("userProfile", JSON.stringify(profile));
        return profile;
    } catch (e) {
        // En caso de error (ej. token expirado), limpiamos el perfil del storage
        localStorage.removeItem("userProfile");
        return null;
    }
};


export const useUserProfile = () => {
    return useQuery({
        queryKey: ["userProfile"],
        queryFn: fetchUserProfile,
        staleTime: 1000 * 60 * 5, // Cache por 5 minutos
    });
};