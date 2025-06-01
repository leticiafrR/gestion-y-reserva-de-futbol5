// @ts-nocheck - Mocked for development
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@/models/User";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      // Invalidate the profile query to refetch the updated data
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

// Mock database
let mockProfile: User = {
  id: "1",
  name: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  photo: "https://tr.rbxcdn.com/180DAY-640e7ce81edf999db2182d4847548dc5/420/420/Image/Png/noFilter",
  age: 25,
  gender: "male",
  userType: "player"
};

async function getProfile(): Promise<User> {
  // Return the current mock profile
  return mockProfile;

  /* Actual API call
  const response = await fetch(BASE_API_URL + "/profile", {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`, // from TokenContext?
    },
  });
  return response.json();
  */
}

type UpdateProfileData = Omit<User, 'id' | 'userType'>;

async function updateProfile(data: UpdateProfileData): Promise<User> {
  // Update the mock profile
  mockProfile = {
    ...mockProfile,
    ...data
  };
  
  return mockProfile;

  /* Actual API call
  const response = await fetch(BASE_API_URL + "/profile", {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
  */
}