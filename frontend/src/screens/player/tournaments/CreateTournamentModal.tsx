import { useState } from "react";
import { useCreateTournament } from "@/services/TournamentService";

interface CreateTournamentModalProps {
  onClose: () => void;
  onError: (msg: string) => void;
}

const TOURNAMENT_FORMATS = [
  "SINGLE_ELIMINATION",
  "ROUND_ROBIN",
  "GROUP_STAGE_AND_ELIMINATION"
];

export const CreateTournamentModal = ({ onClose, onError }: CreateTournamentModalProps) => {
  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    format: TOURNAMENT_FORMATS[0],
    maxTeams: 8,
    description: "",
    prizes: "",
    registrationFee: 0
  });
  const [error, setError] = useState<string | null>(null);
  const createTournament = useCreateTournament();

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: name === "maxTeams" || name === "registrationFee" ? Number(value) : value }));
  };

  const validate = () => {
    if (!form.name.trim()) return "El nombre es obligatorio";
    if (!form.startDate) return "La fecha de inicio es obligatoria";
    if (!form.endDate) return "La fecha de fin es obligatoria";
    if (!form.format) return "El formato es obligatorio";
    if (!form.maxTeams || form.maxTeams < 2) return "El máximo de equipos debe ser al menos 2";
    if (form.registrationFee < 0) return "La inscripción no puede ser negativa";
    if (form.startDate < tomorrow) return "La fecha de inicio debe ser al menos mañana";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    try {
      await createTournament.mutateAsync(form);
      onClose();
    } catch (e: any) {
      onError(e?.message || "Error al crear torneo");
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "white", borderRadius: 12, maxWidth: 500, width: "100%", padding: 32, boxShadow: "0 2px 12px #0002" }}>
        <h2 style={{ marginBottom: 24, fontSize: 22, fontWeight: 700 }}>Crear Torneo</h2>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 20 }}>
          <div>
            <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Nombre del Torneo *</label>
            <input name="name" value={form.name} onChange={handleChange} required style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc", fontSize: 15 }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Inicio *</label>
              <input name="startDate" type="date" value={form.startDate} onChange={handleChange} required min={tomorrow} style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc", fontSize: 15 }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Fin *</label>
              <input name="endDate" type="date" value={form.endDate} onChange={handleChange} required style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc", fontSize: 15 }} />
            </div>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Formato *</label>
            <select name="format" value={form.format} onChange={handleChange} required style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc", fontSize: 15 }}>
              {TOURNAMENT_FORMATS.map(f => <option key={f} value={f}>{f.replace(/_/g, " ")}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Máximo de Equipos *</label>
            <input name="maxTeams" type="number" min={2} value={form.maxTeams} onChange={handleChange} required style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc", fontSize: 15 }} />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Descripción</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={2} style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc", fontSize: 15 }} />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Premios</label>
            <input name="prizes" value={form.prizes} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc", fontSize: 15 }} />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Inscripción ($) *</label>
            <input name="registrationFee" type="number" min={0} value={form.registrationFee} onChange={handleChange} required style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc", fontSize: 15 }} />
          </div>
          {error && <div style={{ color: "#dc3545", fontSize: 14 }}>{error}</div>}
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={{ padding: "10px 18px", background: "#eee", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 15 }}>Cancelar</button>
            <button type="submit" disabled={createTournament.isPending} style={{ padding: "10px 18px", background: "#007bff", color: "white", border: "none", borderRadius: 6, cursor: "pointer", opacity: createTournament.isPending ? 0.7 : 1, fontSize: 15 }}>
              {createTournament.isPending ? "Creando..." : "Crear Torneo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 