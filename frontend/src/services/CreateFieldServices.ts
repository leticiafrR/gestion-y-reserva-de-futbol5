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
    isAvailable: true
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
    isAvailable: false
  }
];

async function getOwnerFields(): Promise<Field[]> {
  const accessToken = getAuthToken();
  console.log("accessToken", accessToken);
  const response = await fetch(`${BASE_API_URL}/fields`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`, 
    },
  });
  if (response.ok) {
    return response.json();
  } else {
    throw new Error(`Failed to fetch owner fields with status ${response.status}: ${await response.text()}`);
  }
}

async function createField(data: Omit<Field, "id">) {
  
  
  // const datita = {
  //   name: "Cancha Principal",
  //   grassType: "sintetico",
  //   lighting: true,
  //   roofing: false,
  //   zone: "Centro",
  //   photoUrl: "https://example.com/photo1.jpg",
  //   address: "Calle Principal 123",
  //   description: "Cancha de fútbol 5 con césped sintético y excelente iluminación",
  //   price: 100,
  // }
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