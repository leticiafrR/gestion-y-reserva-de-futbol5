import React from "react";

const CustomMarkerLabel = ({ name, price, color }: { name: string; price: number; color: string }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        background: "white",
        padding: "8px 12px",
        borderRadius: 8,
        border: `2px solid ${color}`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        whiteSpace: "nowrap",
        position: "relative",
      }}
    >
      <div
        style={{
          width: 12,
          height: 12,
          background: color,
          borderRadius: "50%",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 6,
            height: 6,
            background: "white",
            borderRadius: "50%",
          }}
        ></div>
      </div>
      <div>
        <div style={{ color: "#212529", fontSize: 14, fontWeight: 600, lineHeight: 1.2 }}>{name}</div>
        <div style={{ color: "#6c757d", fontSize: 12, lineHeight: 1.2 }}>{`$${price}/hora`}</div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: -8,
          left: "50%",
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: "8px solid transparent",
          borderRight: "8px solid transparent",
          borderTop: `8px solid ${color}`,
        }}
      ></div>
    </div>
  );
};

export default CustomMarkerLabel; 