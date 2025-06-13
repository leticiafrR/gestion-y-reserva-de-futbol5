import React from "react";
import { X } from "lucide-react";

interface DeleteBookingConfirmationModalProps {
  bookingId: number;
  fieldName: string;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export const DeleteBookingConfirmationModal: React.FC<DeleteBookingConfirmationModalProps> = ({
  bookingId,
  fieldName,
  onClose,
  onConfirm,
  loading = false,
}) => {
  return (
    <div style={{
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
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: "8px",
        width: "100%",
        maxWidth: "420px",
        maxHeight: "90vh",
        overflow: "auto",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 24px",
          borderBottom: "1px solid #e5e7eb",
        }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", margin: "0 0 4px 0" }}>
              Confirmar Cancelación
            </h2>
            <p style={{ color: "#6c757d", margin: 0, fontSize: "14px" }}>
              ¿Estás seguro de que quieres cancelar la reserva para <b>{fieldName}</b>?
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
            <X size={20} />
          </button>
        </div>
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", padding: "24px" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "8px 16px",
              backgroundColor: "#f3f4f6",
              color: "#374151",
              border: "1px solid #e5e7eb",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: "8px 16px",
              backgroundColor: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "14px",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Cancelando..." : "Confirmar Cancelación"}
          </button>
        </div>
      </div>
    </div>
  );
}; 