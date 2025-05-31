// @ts-nocheck - Mocked for development
import { useQuery } from "@tanstack/react-query";

export interface Field {
  name: string;
  grassType: string;
  lighting: boolean;
  zone: string;
  address: string;
  photoUrl: string;
  active: boolean;
}

export function useAvailableFields() {
  return useQuery({
    queryKey: ["availableFields"],
    queryFn: getAvailableFields,
  });
}

async function getAvailableFields(): Promise<Field[]> {
  // Mock data for development
  return [
    {
      name: "Cancha Central",
      grassType: "Sintético",
      lighting: true,
      zone: "Norte",
      address: "Av. Siempreviva 742",
      photoUrl: "https://example.com/cancha-central.jpg",
      active: true
    },
    {
      name: "Cancha Auxiliar",
      grassType: "Natural",
      lighting: false,
      zone: "Sur",
      address: "Calle Falsa 123",
      photoUrl: "https://example.com/cancha-auxiliar.jpg",
      active: true
    },
      {
      name: "Cancha Oeste",
      grassType: "Sintético",
      lighting: true,
      zone: "Oeste",
      address: "Boulevard 456",
      photoUrl: "https://example.com/cancha-auxiliar.jpg",
      active: true
    },
    {
      name: "Cancha Sur",
      grassType: "Natural",
      lighting: true,
      zone: "Sur",
      address: "Ruta 8 km 12",
      photoUrl: "https://example.com/cancha-auxiliar.jpg",
      active: true
    },
    {
      name: "Cancha Norte",
      grassType: "Sintético",
      lighting: false,
      zone: "Norte",
      address: "Av. Libertad 999",
      photoUrl: "https://example.com/cancha-auxiliar.jpg",
      active: true
    },
    {
      name: "Cancha Este",
      grassType: "Sintético",
      lighting: true,
      zone: "Este",
      address: "Camino Real 321",
      photoUrl: "https://example.com/cancha-auxiliar.jpg",
      active: true
    }
  ];

  /*
  const response = await fetch(BASE_API_URL + "/fields/available", {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`, // from TokenContext?
    },
  });

  if (response.ok) {
    return response.json();
  } else {
    throw new Error(`Failed to fetch fields with status ${response.status}: ${await response.text()}`);
  }
  */
} 