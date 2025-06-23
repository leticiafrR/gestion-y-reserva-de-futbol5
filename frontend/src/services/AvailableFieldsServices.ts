import { useQuery } from "@tanstack/react-query";
import type { Field } from "@/models/Field";
import { BASE_API_URL, getAuthToken } from "@/config/app-query-client";

export function useAvailableFields() {
  return useQuery({
    queryKey: ["availableFields"],
    queryFn: getAvailableFields,
  });
}

async function getAvailableFields(): Promise<Field[]> {
  const accessToken = getAuthToken();
  const response = await fetch(`${BASE_API_URL}/fields/all`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`, 
    },
  });



  if (response.ok) {
    const data = await response.json();
    return data;
π
  } else {
    throw new Error(`Failed to fetch fields with status ${response.status}: ${await response.text()}`);
  }
} 