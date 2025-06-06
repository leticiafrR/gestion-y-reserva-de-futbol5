"use client"

import type React from "react"

import { useState, useRef } from "react"
import { X, Upload } from "lucide-react"
import { uploadFieldImage } from "@/services/supabaseClient"

interface Field {
  address: string
  name: string
  grassType: "natural" | "synthetic"
  hasLighting: boolean
  zone: string
  features: string[]
  photo: string
  isActive: boolean
}

interface CreateFieldModalProps {
  onClose: () => void
  onSubmit: (field: Field) => void
}

export const CreateFieldModal = ({ onClose, onSubmit }: CreateFieldModalProps) => {
  const [formData, setFormData] = useState<Field>({
    name: "",
    grassType: "synthetic",
    hasLighting: false,
    zone: "",
    address: "",
    features: [],
    photo: "",
    isActive: true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newFeature, setNewFeature] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio"
    }
    if (!formData.zone.trim()) {
      newErrors.zone = "La zona es obligatoria"
    }
    if (!formData.address.trim()) {
      newErrors.address = "La dirección es obligatoria"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()],
      })
      setNewFeature("")
    }
  }

  const removeFeature = (feature: string) => {
    setFormData({
      ...formData,
      features: formData.features.filter((f) => f !== feature),
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        setIsUploading(true)
        setUploadError(null)

        // Validar el tipo de archivo
        if (!file.type.startsWith('image/')) {
          throw new Error('El archivo debe ser una imagen')
        }

        // Validar el tamaño (2MB máximo)
        if (file.size > 2 * 1024 * 1024) {
          throw new Error('El tamaño del archivo debe ser menor a 2MB')
        }

        const photoUrl = await uploadFieldImage(file, formData.name)
        setFormData({
          ...formData,
          photo: photoUrl,
        })
      } catch (error) {
        console.error('Error uploading photo:', error)
        setUploadError(error instanceof Error ? error.message : 'Error al subir la foto')
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    setFormData({
      ...formData,
      photo: "",
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
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
            padding: "20px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#111827" }}>Nueva Cancha</h2>
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
            <X size={20} color="#6b7280" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px" }}
            >
              Nombre de la Cancha *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{
                width: "100%",
                padding: "10px",
                border: `1px solid ${errors.name ? "#ef4444" : "#d1d5db"}`,
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
              placeholder="Ej: Cancha Principal"
            />
            {errors.name && <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>{errors.name}</p>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <div>
              <label
                style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px" }}
              >
                Zona *
              </label>
              <input
                type="text"
                value={formData.zone}
                onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: `1px solid ${errors.zone ? "#ef4444" : "#d1d5db"}`,
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
                placeholder="Ej: Centro, Norte, Sur"
              />
              {errors.zone && <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>{errors.zone}</p>}
            </div>

            <div>
              <label
                style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px" }}
              >
                Tipo de Césped
              </label>
              <select
                value={formData.grassType}
                onChange={(e) => setFormData({ ...formData, grassType: e.target.value as "natural" | "synthetic" })}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              >
                <option value="synthetic">Sintético</option>
                <option value="natural">Natural</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px" }}
            >
              Dirección *
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              style={{
                width: "100%",
                padding: "10px",
                border: `1px solid ${errors.address ? "#ef4444" : "#d1d5db"}`,
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
              placeholder="Ej: Av. Principal 123"
            />
            {errors.address && <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>{errors.address}</p>}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={formData.hasLighting}
                onChange={(e) => setFormData({ ...formData, hasLighting: e.target.checked })}
                style={{ width: "16px", height: "16px" }}
              />
              <span style={{ fontSize: "14px", color: "#374151" }}>Cuenta con iluminación</span>
            </label>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px" }}
            >
              Características Adicionales
            </label>
            <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                style={{
                  flex: 1,
                  padding: "8px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
                placeholder="Ej: Vestuarios, Bar, Estacionamiento"
              />
              <button
                type="button"
                onClick={addFeature}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Agregar
              </button>
            </div>
            {formData.features.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {formData.features.map((feature, index) => (
                  <span
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "4px 8px",
                      backgroundColor: "#f3f4f6",
                      borderRadius: "12px",
                      fontSize: "12px",
                      color: "#374151",
                    }}
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => removeFeature(feature)}
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: "0",
                        color: "#6b7280",
                      }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px" }}
            >
              Foto de la Cancha
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <div
              onClick={handleButtonClick}
              style={{
                border: "2px dashed #e2e8f0",
                borderRadius: "8px",
                padding: "20px",
                textAlign: "center",
                cursor: "pointer",
                backgroundColor: formData.photo ? "transparent" : "#f8fafc",
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
              {formData.photo ? (
                <>
                  <img
                    src={formData.photo}
                    alt="Preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "200px",
                      borderRadius: "4px",
                      objectFit: "cover",
                    }}
                  />
                  <button
                    onClick={handleRemovePhoto}
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
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
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
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 20px",
                backgroundColor: "white",
                color: "#374151",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isUploading}
              style={{
                padding: "10px 20px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: isUploading ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "500",
                opacity: isUploading ? 0.7 : 1,
              }}
            >
              {isUploading ? "Subiendo..." : "Crear Cancha"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
