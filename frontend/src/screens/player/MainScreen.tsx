import { useLocation } from "wouter";
import { useToken } from "@/services/TokenContext";

export const PlayerMainScreen = () => {
  const [, setLocation] = useLocation();
  const [, setTokenState] = useToken();

  const handleLogout = () => {
    setTokenState({ state: "LOGGED_OUT" });
    setLocation("/login");
  };

  const menuItems = [
    {
      title: "Ver canchas",
      description: "Explora y reserva canchas disponibles",
      path: "/available-fields",
      emoji: "⚽"
    },
    {
      title: "Partidos",
      description: "Encuentra y gestiona partidos",
      path: "/matches",
      emoji: "🎯"
    },
    {
      title: "Torneos disponibles",
      description: "Participa en torneos y competencias",
      path: "/tournaments",
      emoji: "🏆"
    },
    {
      title: "Mis reservas",
      description: "Gestiona tus reservas activas",
      path: "/bookings",
      emoji: "📅"
    },
    {
      title: "Mis equipos",
      description: "Administra tus equipos",
      path: "/teams",
      emoji: "👥"
    },
    {
      title: "Mis torneos",
      description: "Gestiona tus torneos",
      path: "/my-tournaments",
      emoji: "🏆"
    }

  ];

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
            ⚽ Panel de Jugador
          </h1>
          <p style={{
            color: "var(--muted-foreground)",
            margin: "4px 0 0 0",
            fontSize: "14px"
          }}>
            Bienvenido de nuevo
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => setLocation("/profile")}
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
            👤 Mi Perfil
          </button>
          <button
            onClick={handleLogout}
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
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 16px"
      }}>
        {/* General Features Section */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
          marginBottom: "32px"
        }}>
          {menuItems.slice(0, 3).map(item => (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                padding: "24px",
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                textAlign: "left"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 6px -1px var(--border), 0 2px 4px -1px var(--border)";
                e.currentTarget.style.borderColor = "var(--primary)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              <span style={{ fontSize: "32px", marginBottom: "16px" }}>
                {item.emoji}
              </span>
              <h2 style={{
                margin: "0 0 8px 0",
                fontSize: "18px",
                fontWeight: "600",
                color: "var(--foreground)"
              }}>
                {item.title}
              </h2>
              <p style={{
                margin: 0,
                fontSize: "14px",
                color: "var(--muted-foreground)"
              }}>
                {item.description}
              </p>
            </button>
          ))}
        </div>

        {/* Separator */}
        <div style={{
          width: "100%",
          height: "1px",
          backgroundColor: "var(--border)",
          margin: "32px 0"
        }} />

        {/* Personal Features Section */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px"
        }}>
          {menuItems.slice(3).map(item => (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                padding: "24px",
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                textAlign: "left"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 6px -1px var(--border), 0 2px 4px -1px var(--border)";
                e.currentTarget.style.borderColor = "var(--primary)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              <span style={{ fontSize: "32px", marginBottom: "16px" }}>
                {item.emoji}
              </span>
              <h2 style={{
                margin: "0 0 8px 0",
                fontSize: "18px",
                fontWeight: "600",
                color: "var(--foreground)"
              }}>
                {item.title}
              </h2>
              <p style={{
                margin: 0,
                fontSize: "14px",
                color: "var(--muted-foreground)"
              }}>
                {item.description}
              </p>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};
