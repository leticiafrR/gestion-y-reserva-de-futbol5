"use client"

import React, { useState, useRef } from "react"
import { X, Upload } from "lucide-react"
import { uploadFieldImage } from "@/services/supabaseClient"
import type { Field } from "@/models/Field"
import { useLoadScript, Autocomplete } from "@react-google-maps/api"

interface CreateFieldModalProps {
  onClose: () => void
  onSubmit: (field: Omit<Field, "id">) => void
}

export const CreateFieldModal = ({ onClose, onSubmit }: CreateFieldModalProps) => {
  const [formData, setFormData] = useState<Omit<Field, "id">>({
    name: "",
    grassType: "sintetico",
    lighting: false,
    roofing: false,
    address: "",
    zone: "",
    photoUrl: "",
    description: "",
    price: 0,
    active: true,
    schedule: []
  })
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyAV-7--jx2dP-MyDxVrhcSYlNnY8KNb8g8",
    libraries: ["places"],
  })

  const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete
  }

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace()
      if (place.formatted_address) {
        let zone = ""
        if (place.address_components) {
          const neighborhood = place.address_components.find(
            component => component.types.includes("neighborhood")
          )
          const locality = place.address_components.find(
            component => component.types.includes("locality")
          )
          zone = neighborhood?.long_name || locality?.long_name || ""
        }
        setFormData(prev => ({
          ...prev,
          address: place.formatted_address || prev.address,
          zone: zone || prev.zone
        }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const fieldData = {
        ...formData,
        address: formData.address,
      }
      await onSubmit(fieldData)
    } catch (err: any) {
      setUploadError(err.message || "Error al crear la cancha")
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          width: "100%",
          maxWidth: "600px",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 24px",
            borderBottom: "1px solid #e9ecef",
          }}
        >
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#212529", margin: "0 0 4px 0" }}>
              Nueva Cancha
            </h2>
            <p style={{ color: "#6c757d", margin: 0, fontSize: "14px" }}>
              Completa la información para crear una nueva cancha
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: "8px",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              borderRadius: "4px",
            }}
          >
            <X size={20} color="#6c757d" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
          {uploadError && (
            <div
              style={{
                backgroundColor: "#fff5f5",
                color: "#dc3545",
                padding: "12px",
                borderRadius: "6px",
                marginBottom: "20px",
                fontSize: "14px",
              }}
            >
              {uploadError}
            </div>
          )}

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#212529",
                marginBottom: "6px",
              }}
            >
              Nombre de la Cancha *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setUploadError(null)
                setFormData({ ...formData, name: e.target.value })
              }}
              placeholder="Ej: Cancha Principal"
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ced4da",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
                backgroundColor: "white",
                color: "#212529",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#212529",
                marginBottom: "6px",
              }}
            >
              Tipo de Césped *
            </label>
            <select
              value={formData.grassType}
              onChange={(e) => setFormData({ ...formData, grassType: e.target.value as "natural" | "sintetico" })}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ced4da",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
                backgroundColor: "white",
                color: "#212529",
              }}
            >
              <option value="sintetico">Sintético</option>
              <option value="natural">Natural</option>
            </select>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#212529",
                marginBottom: "6px",
              }}
            >
              Ubicación *
            </label>
            {isLoaded ? (
              <Autocomplete
                onLoad={onLoad}
                onPlaceChanged={onPlaceChanged}
                restrictions={{ country: "ar" }}
              >
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    address: e.target.value
                  }))}
                  placeholder="Ej: Av. Principal 123"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #ced4da",
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    backgroundColor: "white",
                    color: "#212529",
                  }}
                />
              </Autocomplete>
            ) : (
              <div>Cargando...</div>
            )}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#212529",
                marginBottom: "6px",
              }}
            >
              Zona *
            </label>
            <input
              type="text"
              value={formData.zone}
              onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
              placeholder="Ej: Centro"
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ced4da",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
                backgroundColor: "white",
                color: "#212529",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#212529",
                marginBottom: "6px",
              }}
            >
              Precio por Hora ($)
            </label>
            <input
              type="number"
              min="1"
              value={formData.price}
              onChange={(e) => {
                const value = Number(e.target.value)
                if (value > 0) {
                  setFormData({ ...formData, price: value })
                }
              }}
              placeholder="50"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ced4da",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
                backgroundColor: "white",
                color: "#212529",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#212529",
                marginBottom: "6px",
              }}
            >
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe las características de la cancha"
              rows={3}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ced4da",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
                resize: "vertical",
                backgroundColor: "white",
                color: "#212529",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={formData.lighting}
                onChange={(e) => setFormData({ ...formData, lighting: e.target.checked })}
                style={{ width: "16px", height: "16px" }}
              />
              <span style={{ fontSize: "14px", color: "#495057" }}>Tiene iluminación</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={formData.roofing}
                onChange={(e) => setFormData({ ...formData, roofing: e.target.checked })}
                style={{ width: "16px", height: "16px" }}
              />
              <span style={{ fontSize: "14px", color: "#495057" }}>Cancha techada</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => {
                  setFormData({ ...formData, active: e.target.checked })
                }}
                style={{ width: "16px", height: "16px" }}
              />
              <span style={{ fontSize: "14px", color: "#212529" }}>Cancha activa</span>
            </label>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#212529",
                marginBottom: "6px",
              }}
            >
              Foto de la Cancha
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                if (!file.type.startsWith("image/")) {
                  setUploadError("El archivo debe ser una imagen")
                  return
                }
                if (file.size > 2 * 1024 * 1024) {
                  setUploadError("La imagen no debe superar los 2MB")
                  return
                }
                setIsUploading(true)
                setUploadError(null)
                try {
                  const photoUrl = await uploadFieldImage(file, formData.name)
                  setFormData({ ...formData, photoUrl })
                } catch (error) {
                  setUploadError("Error al subir la imagen")
                } finally {
                  setIsUploading(false)
                }
              }}
              style={{ display: "none" }}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: "2px dashed #e2e8f0",
                borderRadius: "8px",
                padding: "20px",
                textAlign: "center",
                cursor: "pointer",
                backgroundColor: formData.photoUrl ? "transparent" : "#f8fafc",
                transition: "all 0.2s ease",
                position: "relative",
                minHeight: "150px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
              }}
            >
              {formData.photoUrl ? (
                <>
                  <img
                    src={formData.photoUrl}
                    alt="Preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "200px",
                      borderRadius: "4px",
                      objectFit: "cover",
                    }}
                  />
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      setFormData({ ...formData, photoUrl: "" })
                      if (fileInputRef.current) fileInputRef.current.value = ""
                    }}
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "24px",
                      height: "24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "background-color 0.2s ease",
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.7)"
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.5)"
                    }}
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <>
                  <Upload size={32} color="#64748b" />
                  <div style={{ color: "#64748b" }}>
                    <p style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "500" }}>
                      Haz clic para subir una foto
                    </p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>
                      PNG, JPG o JPEG (max. 2MB)
                    </p>
                  </div>
                </>
              )}
            </div>
            {uploadError && (
              <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>{uploadError}</p>
            )}
            {isUploading && (
              <p style={{ color: "#3b82f6", fontSize: "12px", marginTop: "4px" }}>Subiendo foto...</p>
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
              paddingTop: "20px",
              borderTop: "1px solid #e9ecef",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 20px",
                backgroundColor: "white",
                color: "#6c757d",
                border: "1px solid #ced4da",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                backgroundColor: "#212529",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Crear Cancha
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
