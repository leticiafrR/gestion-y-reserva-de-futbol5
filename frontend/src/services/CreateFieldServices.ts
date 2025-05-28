// @ts-nocheck - Mocked for development
import { useMutation } from "@tanstack/react-query";

// @ts-expect-error - Mocked for development
// import { BASE_API_URL } from "@/config/app-query-client";
// @ts-expect-error - Mocked for development
import { CreateFieldRequest } from "@/models/CreateField.ts";

export function useCreateField() {
  return useMutation({
    mutationFn: async (req: CreateFieldRequest) => {
      return createField(req);
    },
  });
}

async function createField(data: CreateFieldRequest) {
  // Mock successful field creation response
  return { success: true };

  /*
  const response = await fetch(BASE_API_URL + "/fields", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`, // from TokenContext?
    },
    body: JSON.stringify(data),
  });

  if (response.ok) {
    return { success: true };
  } else {
    throw new Error(`Field creation failed with status ${response.status}: ${await response.text()}`);
  }
  */
}
