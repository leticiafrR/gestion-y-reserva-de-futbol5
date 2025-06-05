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

let mockFields: Field[] = [
  {
    id: "1",
    name: "Cancha CENTRAL",
    grass: "sintetico",
    lighting: true,
    roofing: false,
    address: "Av. Principal 123",
    area: "Centro",
    photos: [],
    description: "Cancha con césped sintético y buena iluminación.",
    price: 80,
    isAvailable: true,
    schedule: [
      { dayOfWeek: "MONDAY", openTime: "10:00", closeTime: "18:00" },
      { dayOfWeek: "TUESDAY", openTime: "10:00", closeTime: "18:00" },
      { dayOfWeek: "WEDNESDAY", openTime: "10:00", closeTime: "18:00" },
      { dayOfWeek: "THURSDAY", openTime: "10:00", closeTime: "18:00" },
      { dayOfWeek: "FRIDAY", openTime: "10:00", closeTime: "18:00" }
    ],
    photoUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "2",
    name: "Cancha NORTE",
    grass: "natural",
    lighting: false,
    roofing: false,
    address: "Calle Norte 456",
    area: "Norte",
    photos: [],
    description: "Cancha de césped natural, ideal para torneos.",
    price: 50,
    isAvailable: false,
    schedule: [
      { dayOfWeek: "SATURDAY", openTime: "09:00", closeTime: "14:00" },
      { dayOfWeek: "SUNDAY", openTime: "09:00", closeTime: "14:00" }
    ],
    photoUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80"
  }
];

async function getAvailableFields(): Promise<Field[]> {
  // return mockFields;
  const accessToken = getAuthToken();
  console.log("accessToken", accessToken);
  const response = await fetch(`${BASE_API_URL}/fields/all`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`, 
    },
  });


  console.log(response);

  if (response.ok) {
    const data = await response.json();
    console.log(data);
    return data;
π
  } else {
    throw new Error(`Failed to fetch fields with status ${response.status}: ${await response.text()}`);
  }
} 