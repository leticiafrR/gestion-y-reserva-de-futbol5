import React from "react";
import { X } from "lucide-react";

interface DeleteConfirmationModalProps {
  fieldId: string;
  fieldName: string;
  onClose: () => void;
  onConfirm: (fieldId: string) => void;
}

export const DeleteConfirmationModal = ({
  fieldId,
  fieldName,
  onClose,
  onConfirm,
}: DeleteConfirmationModalProps) => {
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
              Confirmar Eliminación
            </h2>
            <p style={{ color: "#6c757d", margin: 0, fontSize: "14px" }}>
              ¿Estás seguro de que quieres eliminar la cancha "{fieldName}"?
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

        {/* Main content area */}
        <div style={{ padding: "0 24px 24px 24px" }}>
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
              paddingTop: "20px",
              paddingLeft: "0",
              paddingRight: "0",
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
              type="button"
              onClick={() => {
                onConfirm(fieldId)
              }}
              style={{
                padding: "10px 20px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 