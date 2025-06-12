import { X } from "lucide-react";

interface ErrorPopupProps {
  message: string;
  onClose: () => void;
}

export const ErrorPopup = ({ message, onClose }: ErrorPopupProps) => {
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
        maxWidth: "500px",
        overflow: "hidden",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          backgroundColor: "var(--destructive)",
          color: "var(--destructive-foreground)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>
              Error
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: "4px",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              color: "currentColor",
            }}
          >
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: "20px 24px" }}>
          <p style={{ margin: 0, color: "var(--foreground)", fontSize: "18px" }}>
            {message}
          </p>
        </div>
        <div style={{ 
          padding: "12px 24px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          justifyContent: "flex-end"
        }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              backgroundColor: "var(--secondary)",
              color: "var(--secondary-foreground)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}; 