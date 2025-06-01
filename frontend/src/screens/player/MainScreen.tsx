import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToken } from "@/services/TokenContext";

export const PlayerMainScreen = () => {
  const [, setLocation] = useLocation();
  const [, setTokenState] = useToken();

  const handleLogout = () => {
    setTokenState({ state: "LOGGED_OUT" });
    setLocation("/login");
  };

  return (
    <div className="p-8">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 className="text-2xl font-bold">Panel de Jugador</h1>
        <Button variant="outline" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </div>
      <div className="space-y-4">
        <Button
          className="w-full"
          onClick={() => setLocation("/reservations")}
        >
          Mis Reservas
        </Button>
        <Button
          className="w-full"
          onClick={() => setLocation("/available-fields")}
        >
          Ver Canchas Disponibles
        </Button>
        <Button
          className="w-full"
          onClick={() => setLocation("/tournaments")}
        >
          Ver Torneos
        </Button>
        <Button
          className="w-full"
          onClick={() => setLocation("/teams")}
        >
          Equipos
        </Button>
      </div>
    </div>
  );
}; 