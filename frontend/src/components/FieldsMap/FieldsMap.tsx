"use client"

import { useLoadScript, GoogleMap, Marker } from "@react-google-maps/api"
import { useState, useEffect } from "react"
import ReactDOMServer from "react-dom/server"
import CustomMarkerLabel from "./CustomMarkerLabel"
import type { Field } from "@/models/Field"
import { getCoordinatesFromAddress } from "@/utils/geocoding"

const mapContainerStyle = {
  width: "100%",
  height: "600px",
  borderRadius: "var(--radius-lg)",
}

const defaultCenter = {
  lat: -34.6037, // Buenos Aires coordinates
  lng: -58.3816,
}

interface FieldsMapProps {
  fields: Field[]
  onFieldSelect?: (field: Field) => void
}

function createSimpleMarker(field: Field): google.maps.Icon {
  const { name, price = 0, active = true } = field
  const color = active ? "#4caf50" : "#ef4444"

  // Renderizar el componente a string
  const markerHTML = ReactDOMServer.renderToString(
    <CustomMarkerLabel name={name} price={price} color={color} />
  )

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="200" height="80" xmlns="http://www.w3.org/2000/svg">
        <foreignObject width="200" height="80">
          <div xmlns="http://www.w3.org/1999/xhtml">
            ${markerHTML}
          </div>
        </foreignObject>
      </svg>
    `)}`,
    scaledSize: new google.maps.Size(200, 80),
    anchor: new google.maps.Point(100, 80),
  }
}

export const FieldsMap = ({ fields, onFieldSelect }: FieldsMapProps) => {
  // @ts-expect-error - map is used indirectly through setMap
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [fieldsWithCoordinates, setFieldsWithCoordinates] = useState<Field[]>(fields)

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyAV-7--jx2dP-MyDxVrhcSYlNnY8KNb8g8",
    libraries: ["places"],
  })

  useEffect(() => {
    const getCoordinatesForFields = async () => {
      const fieldsToUpdate = fields.filter(field => !field.lat || !field.lng)
      
      if (fieldsToUpdate.length === 0) {
        setFieldsWithCoordinates(fields)
        return
      }

      const updatedFields = await Promise.all(
        fields.map(async (field) => {
          if (field.lat && field.lng) return field

          try {
            const coordinates = await getCoordinatesFromAddress(field.address)
            return {
              ...field,
              lat: coordinates.lat,
              lng: coordinates.lng,
            }
          } catch (error) {
            console.error(`Error getting coordinates for field ${field.name}:`, error)
            return field
          }
        })
      )

      setFieldsWithCoordinates(updatedFields)
    }

    if (isLoaded) {
      getCoordinatesForFields()
    }
  }, [fields, isLoaded])

  if (loadError) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "600px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          color: "#dc3545",
        }}
      >
        ❌ Error loading maps
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "600px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          color: "#6c757d",
        }}
      >
        🗺️ Loading maps...
      </div>
    )
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "600px" }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={12}
        center={defaultCenter}
        onLoad={setMap}
        options={{
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
            {
              featureType: "transit",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: true,
        }}
      >
        {fieldsWithCoordinates.map((field) => (
          field.lat && field.lng ? (
            <Marker
              key={field.id}
              position={{
                lat: field.lat,
                lng: field.lng,
              }}
              icon={createSimpleMarker(field)}
              onClick={() => onFieldSelect?.(field)}
              title={`${field.name} - $${field.price}/hora`}
            />
          ) : null
        ))}
      </GoogleMap>
    </div>
  )
}
