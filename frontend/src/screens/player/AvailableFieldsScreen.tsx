import { useAvailableFields } from "@/services/AvailableFieldsServices";
import type { Field } from "@/models/Field";
import { useState } from "react";
import { navigate } from "wouter/use-browser-location";

export const AvailableFieldsScreen = () => {
  const { data: fields, isLoading, error } = useAvailableFields();

  // Estados para los filtros
  const [search, setSearch] = useState("");
  const [grassType, setGrassType] = useState("");
  const [onlyWithLighting, setOnlyWithLighting] = useState(false);
  const [onlyRoofed, setOnlyRoofed] = useState(false);

  // Obtener tipos de césped únicos para el filtro
  const grassTypes = Array.from(new Set(fields?.map(f => f.grass) ?? []));

  // Filtrado de canchas
  const filteredFields = (fields ?? []).filter((field: Field) => {
    const matchesName = field.name.toLowerCase().includes(search.toLowerCase());
    const matchesGrass = grassType ? field.grass === grassType : true;
    const matchesLighting = onlyWithLighting ? field.lighting : true;
    const matchesRoofed = onlyRoofed ? field.roofing : true;
    return matchesName && matchesGrass && matchesLighting && matchesRoofed;
  });

  if (isLoading) return <div style={{ textAlign: "center", marginTop: "2rem" }}>Cargando canchas...</div>;
  if (error) return <div style={{ textAlign: "center", marginTop: "2rem", color: "red" }}>Error al cargar las canchas.</div>;

  return (
    <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "2rem" 
      }}>
        <h1 style={{ color: "#2d3748", margin: 0 }}>Canchas Disponibles</h1>
        <button
          style={{
            padding: "10px 16px",
            backgroundColor: "transparent",
            color: "#6c757d",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
            textDecoration: "underline",
          }}
          onClick={() => {
            navigate("/main");
          }}
        >
          Volver a Inicio
        </button>
      </div>
      <div
        style={{
          marginBottom: "2rem",
          display: "flex",
          gap: "1.5rem",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7fafc",
          padding: "1rem 2rem",
          borderRadius: "12px",
          boxShadow: "0 2px 8px #0001"
        }}
      >
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            border: "1px solid #cbd5e1",
            minWidth: 180
          }}
        />
        <select
          value={grassType}
          onChange={e => setGrassType(e.target.value)}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            border: "1px solid #cbd5e1",
            minWidth: 180
          }}
        >
          <option value="">Todos los tipos de césped</option>
          {grassTypes.map(type => (
            <option key={type} value={type}>{type === "natural" ? "Natural" : "Sintético"}</option>
          ))}
        </select>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1rem" }}>
          <input
            type="checkbox"
            checked={onlyWithLighting}
            onChange={e => setOnlyWithLighting(e.target.checked)}
            style={{ width: 18, height: 18 }}
          />
          Solo con iluminación
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1rem" }}>
          <input
            type="checkbox"
            checked={onlyRoofed}
            onChange={e => setOnlyRoofed(e.target.checked)}
            style={{ width: 18, height: 18 }}
          />
          Solo techadas
        </label>
      </div>
      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", justifyContent: "center" }}>
        {filteredFields.length === 0 && (
          <div style={{ color: "#718096", fontSize: "1.2rem" }}>No se encontraron canchas.</div>
        )}
        {filteredFields.map((field) => (
          <div
            key={field.id}
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "1.5rem",
              width: "320px",
              background: "#fff",
              boxShadow: "0 2px 8px #0001",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}
          >
            <img
              src={field.photos[0]}
              alt={field.name}
              style={{
                width: "100%",
                height: "180px",
                objectFit: "cover",
                borderRadius: "8px",
                marginBottom: "1rem",
                boxShadow: "0 1px 4px #0002"
              }}
            />
            <h2 style={{ margin: "0.5rem 0", color: "#2b6cb0" }}>{field.name}</h2>
            <p style={{ margin: "0.2rem 0" }}><b>Dirección:</b> {field.location}</p>
            <p style={{ margin: "0.2rem 0" }}><b>Zona:</b> {field.area}</p>
            <p style={{ margin: "0.2rem 0" }}><b>Césped:</b> {field.grass === "natural" ? "Natural" : "Sintético"}</p>
            <p style={{ margin: "0.2rem 0" }}>
              <b>Iluminación:</b>{" "}
              <span style={{ color: field.lighting ? "#38a169" : "#e53e3e", fontWeight: 600 }}>
                {field.lighting ? "Sí" : "No"}
              </span>
            </p>
            <p style={{ margin: "0.2rem 0" }}>
              <b>Techada:</b>{" "}
              <span style={{ color: field.roofing ? "#38a169" : "#e53e3e", fontWeight: 600 }}>
                {field.roofing ? "Sí" : "No"}
              </span>
            </p>
            <p style={{ margin: "0.2rem 0", fontSize: "1.25rem", color: "#2b6cb0", fontWeight: "bold" }}>
              ${field.price}/hora
            </p>
            {field.description && (
              <p style={{ margin: "0.5rem 0", color: "#4a5568", textAlign: "center", fontSize: "0.9rem" }}>
                {field.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};