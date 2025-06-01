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
    type: "FUTBOL 11",
    description: "Cancha principal con césped sintético de alta calidad",
    pricePerHour: 80,
    capacity: 22,
    grassType: "synthetic",
    address: "Av. Principal 123, Ciudad",
    latitude: -34.6037,
    longitude: -58.3816,
    isCovered: false,
    hasLighting: true,
    photos: [],
  },
  {
    id: "2",
    name: "Cancha Norte",
    type: "FUTBOL 7",
    description: "Cancha techada ideal para días de lluvia",
    pricePerHour: 50,
    capacity: 14,
    grassType: "synthetic",
    address: "Calle Norte 456, Ciudad",
    latitude: -34.5937,
    longitude: -58.3716,
    isCovered: true,
    hasLighting: true,
    photos: [],
  }
];

async function getOwnerFields(): Promise<Field[]> {
  // Return the current mock fields
  return mockFields;
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
