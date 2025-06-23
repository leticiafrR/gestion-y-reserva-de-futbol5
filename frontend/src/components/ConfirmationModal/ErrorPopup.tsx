import React from "react";
import { X } from "lucide-react";

export const ErrorPopup = ({ message, onClose }: { message: string; onClose: () => void }) => {
  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        backgroundColor: "#dc3545",
        color: "white",
        padding: "16px 24px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        gap: "12px",
        maxWidth: "400px",
      }}
    >
      <div style={{ flex: 1 }}>{message}</div>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "white",
          cursor: "pointer",
          padding: "4px",
        }}
      >
        <X size={20} />
      </button>
    </div>
  );
}; 