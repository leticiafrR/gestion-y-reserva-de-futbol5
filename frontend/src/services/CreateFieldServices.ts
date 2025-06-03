// @ts-nocheck - Mocked for development
import { useMutation, useQuery } from "@tanstack/react-query";

// @ts-expect-error - Mocked for development
// import { BASE_API_URL } from "@/config/app-query-client";
// @ts-expect-error - Mocked for development
import { CreateFieldRequest } from "@/models/CreateField.ts";
import { CreateField } from "@/models/CreateField.ts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
  // Return the current mock fields
  return mockFields;
  /*
  const response = await fetch(BASE_API_URL + "/fields/owner", {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      // Authorization: `Bearer ${accessToken}`, 
    },
  });
  if (response.ok) {
    return response.json();
  } else {
    throw new Error(`Failed to fetch owner fields with status ${response.status}: ${await response.text()}`);
  */
}

async function createField(data: Omit<Field, "id">) {
  // Check for duplicate name
  if (mockFields.some(f => f.name.toLowerCase() === data.name.toLowerCase())) {
    throw new Error("Ya existe una cancha con ese nombre");
  }
  // Add new field to the mock database
  const newField: Field = { ...data, id: (mockFields.length + 1).toString() };
  mockFields = [...mockFields, newField];
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
    return response.json();
  } else {
    throw new Error(`Field creation failed with status ${response.status}: ${await response.text()}`);
  }
  */
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
  // Remove the field from the mock database
  mockFields = mockFields.filter(f => f.id !== fieldId);
  return { success: true };

  /*
  const response = await fetch(`${BASE_API_URL}/fields/${fieldId}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      // Authorization: `Bearer ${accessToken}`, 
    },
  });

  if (response.ok) {
    return { success: true };
  } else {
    throw new Error(`Field deletion failed with status ${response.status}: ${await response.text()}`);
  }
}
*/
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
  // Validar nombre único (excepto para la cancha actual)
  if (
    mockFields.some(
      f => f.id !== fieldId && f.name.toLowerCase() === updates.name.toLowerCase()
    )
  ) {
    throw new Error("Ya existe una cancha con ese nombre");
  }
  mockFields = mockFields.map(f =>
    f.id === fieldId ? { ...f, ...updates, id: fieldId } : f
  );
  return { success: true };

  /*
  // Real API example:
  const response = await fetch(`${BASE_API_URL}/fields/${fieldId}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      // Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(updates),
  });

  if (response.ok) {
    return response.json();
  } else {
    throw new Error(`Field update failed with status ${response.status}: ${await response.text()}`);
  }
  */
}