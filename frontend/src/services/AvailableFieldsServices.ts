// @ts-nocheck - Mocked for development
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
  const response = await fetch(`${BASE_API_URL}/fields/available`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`, // 👈 esto es clave
    },
  });


  console.log(response);

  if (response.ok) {
    const data = await response.json();
    console.log(data);
    return data.map((field: any) => ({
      id: field.id.toString(),
      name: field.name,
      grass: field.grassType.toLowerCase(),
      lighting: field.lighting,
      roofing: false, // This field is not in the backend model yet
      location: {
        lat: -34.6037, // These coordinates should come from the backend
        lng: -58.3816,
        address: field.address,
      },
      area: field.zone,
      photos: [field.photoUrl],
      description: "", // This field is not in the backend model yet
      price: field.price,
    }));
  } else {
    throw new Error(`Failed to fetch fields with status ${response.status}: ${await response.text()}`);
  }
} 