// @ts-nocheck - Mocked for development
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BASE_API_URL, getAuthToken } from "@/config/app-query-client";
import type { Field } from "@/models/Field";
import { CreateFieldRequest } from "@/models/CreateField";

export function useCreateField() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (req: Omit<Field, "id">) => createField(req),
    onSuccess: () => {
      // Invalidate the fields query so it refetches
      queryClient.invalidateQueries({ queryKey: ["owner-fields"] });
    },
  });
}

export function useGetOwnerFields() {
  return useQuery({
    queryKey: ["owner-fields"],
    queryFn: getOwnerFields,
  });
}

let mockFields: Field[] = [
  {
    id: "1",
    name: "Cancha CENTRAL",
    grass: "sintetico",
    lighting: true,
    roofing: false,
    location: {
      lat: -34.6037,
      lng: -58.3816,
      address: "Av. Principal 123"
    },
    area: "Centro",
    photos: [],
    description: "Cancha con césped sintético y buena iluminación.",
    price: 80,
    active: true,
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
    location: {
      lat: -34.5837,
      lng: -58.4016,
      address: "Calle Norte 456"
    },
    area: "Norte",
    photos: [],
    description: "Cancha de césped natural, ideal para torneos.",
    price: 50,
    active: false,
    schedule: [
      { dayOfWeek: "SATURDAY", openTime: "09:00", closeTime: "14:00" },
      { dayOfWeek: "SUNDAY", openTime: "09:00", closeTime: "14:00" }
    ],
    photoUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80"
  }
];

async function getOwnerFields(): Promise<Field[]> {
  // return mockFields;
  const accessToken = getAuthToken();
  console.log("accessToken", accessToken);
  const response = await fetch(`${BASE_API_URL}/fields/own`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`, 
    },
  });
  console.log("response", response);
  if (response.ok) {
    return response.json();
  } else {
    throw new Error(`Failed to fetch owner fields with status ${response.status}: ${await response.text()}`);
  }
}

async function createField(data: Omit<Field, "id">) {
  console.log("data", data);
  const accessToken = getAuthToken();
  const response = await fetch(`${BASE_API_URL}/fields`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });
  console.log("response", response);

  if (response.ok) {
    return response.json();
  } else {
    throw new Error(`Field creation failed with status ${response.status}: ${await response.text()}`);
  }
}

export function useDeleteField() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (fieldId: string) => deleteField(fieldId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-fields"] });
    },
  });
}

async function deleteField(fieldId: string) {
  const accessToken = getAuthToken();
  const response = await fetch(`${BASE_API_URL}/fields/${fieldId}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  console.log("response", response);


  if (response.ok) {
    return { success: true };
  } else {
    throw new Error(`Field deletion failed with status ${response.status}: ${await response.text()}`);
  }
}

export function useUpdateField() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string; updates: Omit<Field, "id"> }) => updateField(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-fields"] });
    },
  });
}

async function updateField(fieldId: string, updates: Omit<Field, "id">) {
  const accessToken = getAuthToken();
  const response = await fetch(`${BASE_API_URL}/fields/${fieldId}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(updates),
  });

  if (response.ok) {
    return response.json();
  } else {
    throw new Error(`Field update failed with status ${response.status}: ${await response.text()}`);
  }
}

export function useUpdateFieldActiveStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: number; active: boolean }) => updateFieldActiveStatus(data.id, data.active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-fields"] });
    },
  });
}

async function updateFieldActiveStatus(fieldId: number, active: boolean) {
  const accessToken = getAuthToken();
  const endpoint = `${BASE_API_URL}/fields/${fieldId}/${active}`;
  const response = await fetch(endpoint, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  console.log("response", response);

  if (response.ok) {
    return response.json();
  } else {
    throw new Error(`Field status update failed with status ${response.status}: ${await response.text()}`);
  }
}
