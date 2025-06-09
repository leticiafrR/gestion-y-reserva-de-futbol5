import { useLocation } from "wouter";

export const MyTournamentsScreen = () => {
  const [, setLocation] = useLocation();

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "var(--background)",
      padding: "24px",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      {/* Header */}
      <header style={{
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px",
        backgroundColor: "var(--card)",
        borderRadius: "12px",
        boxShadow: "0 1px 3px var(--border)",
        marginBottom: "32px"
      }}>
        <div>
          <h1 style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "var(--foreground)",
            margin: 0
          }}>
            🏆 Mis Torneos
          </h1>
          <p style={{
            color: "var(--muted-foreground)",
            margin: "4px 0 0 0",
            fontSize: "14px"
          }}>
            Gestiona tus torneos activos
          </p>
        </div>
        <button
          onClick={() => setLocation("/main")}
          style={{
            padding: "8px 16px",
            backgroundColor: "var(--secondary)",
            border: "1px solid transparent",
            borderRadius: "8px",
            color: "var(--secondary-foreground)",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = "var(--accent)";
            e.currentTarget.style.borderColor = "black";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = "var(--secondary)";
            e.currentTarget.style.borderColor = "transparent";
          }}
        >
          Volver a Inicio
        </button>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 16px"
      }}>
        <div style={{
          backgroundColor: "var(--card)",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 1px 3px var(--border)"
        }}>
          <p style={{
            color: "var(--muted-foreground)",
            textAlign: "center",
            fontSize: "16px"
          }}>
            Aquí podrás ver y gestionar tus torneos activos
          </p>
        </div>
      </main>
    </div>
  );
}; 