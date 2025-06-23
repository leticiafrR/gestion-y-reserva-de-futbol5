import React from "react";

interface ConfirmFinishMatchModalProps {
  onClose: () => void;
  onConfirm: () => void;
  isConfirming: boolean;
}

export const ConfirmFinishMatchModal: React.FC<ConfirmFinishMatchModalProps> = ({
  onClose,
  onConfirm,
  isConfirming,
}) => {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", maxWidth: "450px", width: "90%", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
        <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "12px", color: "#111827" }}>Confirmar Finalización del Partido</h3>
        <p style={{ color: "#4b5563", marginBottom: "24px", fontSize: "15px" }}>
          Estás a punto de registrar el resultado de este partido. Al hacerlo, el estado del partido cambiará a <strong>"Finalizado"</strong> y se actualizarán las estadísticas y la tabla de posiciones.
        </p>
        <p style={{ color: "#4b5563", marginBottom: "24px", fontSize: "15px", fontWeight: "600" }}>
          ¿Estás seguro de que deseas continuar?
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button 
            onClick={onClose} 
            disabled={isConfirming}
            style={{ padding: "10px 16px", backgroundColor: "#e5e7eb", color: "#374151", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm} 
            disabled={isConfirming} 
            style={{ padding: "10px 16px", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", opacity: isConfirming ? 0.7 : 1 }}
          >
            {isConfirming ? "Confirmando..." : "Confirmar y Finalizar"}
          </button>
        </div>
      </div>
    </div>
  );
}; 