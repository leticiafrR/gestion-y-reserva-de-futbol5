import { useUserTeams } from "@/services/TeamServices";
import { navigate } from "wouter/use-browser-location";

export const TeamsScreen = () => {
  const { data: teams, isLoading, error } = useUserTeams();

  if (isLoading) return <div style={{ textAlign: "center", marginTop: "2rem" }}>Cargando equipos...</div>;
  if (error) return <div style={{ textAlign: "center", marginTop: "2rem", color: "var(--destructive)" }}>Error al cargar los equipos.</div>;

  return (
    <div style={{ 
      padding: "2rem", 
      maxWidth: 1200, 
      margin: "0 auto",
      backgroundColor: "var(--background)",
      minHeight: "100vh"
    }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "2rem" 
      }}>
        <h1 style={{ color: "var(--foreground)", margin: 0, fontSize: "2rem" }}>Mis Equipos</h1>
        <button
          style={{
            padding: "10px 16px",
            backgroundColor: "var(--secondary)",
            color: "var(--secondary-foreground)",
            border: "1px solid var(--border)",
            cursor: "pointer",
            fontSize: "14px",
            borderRadius: "var(--radius-lg)",
            transition: "all 0.2s ease",
            textDecoration: "none"
          }}
          onClick={() => {
            navigate("/main");
          }}
        >
          Volver a Inicio
        </button>
      </div>

      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", justifyContent: "center" }}>
        {teams?.length === 0 && (
          <div style={{ color: "var(--muted-foreground)", fontSize: "1.2rem" }}>No participas en ningún equipo.</div>
        )}
        {teams?.map((team) => (
          <div
            key={team.id}
            style={{
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "1.5rem",
              width: "320px",
              background: "var(--card)",
              boxShadow: "0 2px 8px var(--border)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px var(--border)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 2px 8px var(--border)";
            }}
          >
            <img
              src={team.logo}
              alt={team.name}
              style={{
                width: "120px",
                height: "120px",
                objectFit: "cover",
                borderRadius: "50%",
                marginBottom: "1rem",
                boxShadow: "0 1px 4px var(--border)"
              }}
            />
            <h2 style={{ margin: "0.5rem 0", color: "var(--primary)", fontSize: "1.5rem", textAlign: "center" }}>
              {team.name}
            </h2>
            <div style={{ 
              display: "flex", 
              gap: "0.5rem", 
              marginBottom: "1rem" 
            }}>
              {team.colors?.map((color, index) => (
                <div
                  key={index}
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    backgroundColor: color,
                    border: "1px solid var(--border)"
                  }}
                />
              ))}
            </div>
            <p style={{ 
              margin: "0.2rem 0", 
              color: "var(--muted-foreground)",
              fontSize: "0.9rem"
            }}>
              Ranking: #{team.ranking}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}; 