import { Calendar, MapPin, Users, Clock } from 'lucide-react'
import { navigate } from 'wouter/use-browser-location'
import { useToken } from '@/services/TokenContext'

export const MainScreen = () => {
  const [, setTokenState] = useToken();
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb', 
      padding: '24px',
      fontFamily: 'system-ui, sans-serif',
      color: '#111827'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '4px' }}>⚽ Dashboard - FutbolManager</h1>
              <p style={{ color: '#4b5563' }}>Gestión de Canchas de Fútbol</p>
            </div>
            <button style={{ 
              padding: '8px 16px', 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb', 
              borderRadius: '6px',
              color: '#374151',
              cursor: 'pointer'
            }}
            onClick={() => {
              navigate("/login")
              setTokenState({ state: "LOGGED_OUT" });
            }}
            >
              Cerrar Sesión
            </button>
          </div>
        </header>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
          gap: '24px', 
          marginBottom: '32px' 
        }}>
          {/* Canchas Disponibles */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            border: '1px solid #e5e7eb', 
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#4b5563' }}>Canchas Disponibles</h3>
              <MapPin size={20} color="#9ca3af" />
            </div>
            <div style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '4px' }}>8</div>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>+2 desde el mes pasado</p>
          </div>

          {/* Reservas Hoy */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            border: '1px solid #e5e7eb', 
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#4b5563' }}>Reservas Hoy</h3>
              <Calendar size={20} color="#9ca3af" />
            </div>
            <div style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '4px' }}>12</div>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>+3 desde ayer</p>
          </div>

          {/* Clientes Activos */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            border: '1px solid #e5e7eb', 
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#4b5563' }}>Clientes Activos</h3>
              <Users size={20} color="#9ca3af" />
            </div>
            <div style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '4px' }}>45</div>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>+5 esta semana</p>
          </div>

          {/* Horas Ocupadas */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            border: '1px solid #e5e7eb', 
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#4b5563' }}>Horas Ocupadas</h3>
              <Clock size={20} color="#9ca3af" />
            </div>
            <div style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '4px' }}>36</div>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>75% de ocupación</p>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))', 
          gap: '24px' 
        }}>
          {/* Acciones Rápidas */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            border: '1px solid #e5e7eb', 
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Acciones Rápidas</h2>
              <p style={{ color: '#4b5563' }}>Gestiona tu sistema de canchas</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button style={{ 
                width: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'flex-start', 
                padding: '12px 16px', 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb', 
                borderRadius: '6px',
                color: '#374151',
                cursor: 'pointer'
              }}>
                <Calendar style={{ marginRight: '12px' }} size={16} />
                Nueva Reserva
              </button>
              <button style={{ 
                width: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'flex-start', 
                padding: '12px 16px', 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb', 
                borderRadius: '6px',
                color: '#374151',
                cursor: 'pointer'
              }}
              onClick={() => (window.location.href = "/canchas")}>
                <MapPin style={{ marginRight: '12px' }} size={16} />
                Gestionar Canchas
              </button>
              <button style={{ 
                width: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'flex-start', 
                padding: '12px 16px', 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb', 
                borderRadius: '6px',
                color: '#374151',
                cursor: 'pointer'
              }}>
                <Users style={{ marginRight: '12px' }} size={16} />
                Ver Clientes
              </button>
            </div>
          </div>

          {/* Próximas Reservas */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            border: '1px solid #e5e7eb', 
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Próximas Reservas</h2>
              <p style={{ color: '#4b5563' }}>Reservas programadas para hoy</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Cancha A */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '16px', 
                backgroundColor: '#ecfdf5', 
                border: '1px solid #d1fae5', 
                borderRadius: '8px' 
              }}>
                <div>
                  <p style={{ fontWeight: '600', color: '#111827' }}>Cancha A</p>
                  <p style={{ fontSize: '14px', color: '#4b5563' }}>15:00 - 16:00</p>
                </div>
                <span style={{ color: '#047857', fontWeight: '500', fontSize: '14px' }}>Confirmada</span>
              </div>

              {/* Cancha B */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '16px', 
                backgroundColor: '#fffbeb', 
                border: '1px solid #fef3c7', 
                borderRadius: '8px' 
              }}>
                <div>
                  <p style={{ fontWeight: '600', color: '#111827' }}>Cancha B</p>
                  <p style={{ fontSize: '14px', color: '#4b5563' }}>17:00 - 18:00</p>
                </div>
                <span style={{ color: '#b45309', fontWeight: '500', fontSize: '14px' }}>Pendiente</span>
              </div>

              {/* Cancha C */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '16px', 
                backgroundColor: '#eff6ff', 
                border: '1px solid #dbeafe', 
                borderRadius: '8px' 
              }}>
                <div>
                  <p style={{ fontWeight: '600', color: '#111827' }}>Cancha C</p>
                  <p style={{ fontSize: '14px', color: '#4b5563' }}>19:00 - 20:00</p>
                </div>
                <span style={{ color: '#1d4ed8', fontWeight: '500', fontSize: '14px' }}>Confirmada</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
