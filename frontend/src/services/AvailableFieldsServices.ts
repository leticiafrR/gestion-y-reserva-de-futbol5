// @ts-nocheck - Mocked for development
import { useQuery } from "@tanstack/react-query";
import type { Field } from "@/models/Field";

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
      id: "1",
      name: "Cancha Central",
      grass: "sintetico",
      lighting: true,
      roofing: true,
      location: "Av. Siempreviva 742",
      area: "Norte",
      photos: ["https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8"],
      description: "Cancha principal con las mejores instalaciones",
      price: 54
    },
    {
      id: "2",
      name: "Cancha Auxiliar",
      grass: "natural",
      lighting: false,
      roofing: false,
      location: "Calle Falsa 123",
      area: "Sur",
      photos: ["https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d"],
      description: "Cancha con césped natural ideal para partidos amistosos",
      price: 60
    },
    {
      id: "3",
      name: "Cancha Oeste",
      grass: "sintetico",
      lighting: true,
      roofing: false,
      location: "Boulevard 456",
      area: "Oeste",
      photos: ["https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8"],
      description: "Cancha con iluminación perfecta para partidos nocturnos",
      price: 75
    },
    {
      id: "4",
      name: "Cancha Sur",
      grass: "natural",
      lighting: true,
      roofing: true,
      location: "Ruta 8 km 12",
      area: "Sur",
      photos: ["https://images.unsplash.com/photo-1461896836934-ffe607ba8211"],
      description: "Cancha techada con césped natural de primera calidad",
      price: 85
    },
    {
      id: "5",
      name: "Cancha Norte",
      grass: "sintetico",
      lighting: false,
      roofing: true,
      location: "Av. Libertad 999",
      area: "Norte",
      photos: ["https://wallpapers.com/images/featured-full/imagenes-de-perritos-o5kux3u31f8r6zqg.jpg"],
      description: "Cancha techada ideal para días lluviosos",
      price: 70
    },
    {
      id: "6",
      name: "Cancha Este",
      grass: "sintetico",
      lighting: true,
      roofing: true,
      location: "Camino Real 321",
      area: "Este",
      photos: ["https://images.unsplash.com/photo-1474494819794-90f9664b530d"],
      description: "Cancha completa con todas las comodidades",
      price: 80
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