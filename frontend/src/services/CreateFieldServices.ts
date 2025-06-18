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

async function getOwnerFields(): Promise<Field[]> {
  // return mockFields;
  const accessToken = getAuthToken();
  const response = await fetch(`${BASE_API_URL}/fields/own`, {
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

  if (response.ok) {
    return response.json();
  } else {
    throw new Error(`Field status update failed with status ${response.status}: ${await response.text()}`);
  }
}
