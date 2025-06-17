import { Calendar, MapPin, Clock } from 'lucide-react'
import { navigate } from 'wouter/use-browser-location'
import { useToken } from '@/services/TokenContext'
import { useEffect, useState } from 'react'
import { FieldSummary, getFieldSummary } from '@/services/fieldService'
import { getOwnerBookings, OwnerBooking } from '@/services/bookingService'

function groupBookingsByDate(bookings: OwnerBooking[]) {
  return bookings.reduce((acc, booking) => {
    if (!acc[booking.bookingDate]) acc[booking.bookingDate] = [];
    acc[booking.bookingDate].push(booking);
    return acc;
  }, {} as Record<string, OwnerBooking[]>);
}

export const MainScreen = () => {
  const [, setTokenState] = useToken();
  const [summaryData, setSummaryData] = useState<FieldSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<OwnerBooking[]>([]);
  const [bookingsError, setBookingsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await getFieldSummary(new Date(), 10);
        setSummaryData(data);
        setError(null);
      } catch (error: any) {
        setSummaryData(null);
        setError(error.message || 'Error desconocido');
        console.error('Error fetching summary data:', error);
      }
    };
    fetchSummary();
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await getOwnerBookings();
        setBookings(data);
        setBookingsError(null);
      } catch (error: any) {
        setBookings([]);
        setBookingsError(error.message || 'Error desconocido');
      }
    };
    fetchBookings();
  }, []);

  const grouped = groupBookingsByDate(bookings);
  const sortedDates = Object.keys(grouped).sort();

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
              <h1 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '4px' }}>⚽ Menu Principal - Administracion de Canchas</h1>
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

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            textAlign: 'center',
            fontWeight: 'bold',
          }}>
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
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
            <div style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '4px' }}>{summaryData?.totalFields || 0}</div>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Total de canchas</p>
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
            <div style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '4px' }}>{summaryData?.totalBookingsToday || 0}</div>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Reservas del día</p>
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
              <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#4b5563' }}>Ocupación</h3>
              <Clock size={20} color="#9ca3af" />
            </div>
            <div style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '4px' }}>{summaryData?.occupancyPercentage || 0}%</div>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Porcentaje de ocupación</p>
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
              }}
              onClick={() => navigate("/canchas")}>
                <MapPin style={{ marginRight: '12px' }} size={16} />
                Gestionar Canchas
              </button>
              <button
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  padding: "12px 16px",
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  color: "#374151",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/horarios")}
              >
                <Clock style={{ marginRight: "12px" }} size={16} />
                Gestionar Horarios
              </button>
              <button
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  padding: "12px 16px",
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  color: "#374151",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/bookings")}
              >
                <Calendar style={{ marginRight: "12px" }} size={16} />
                Gestionar Reservas
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
            {bookingsError && (
              <div style={{ color: '#b91c1c', marginBottom: 12 }}>{bookingsError}</div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {sortedDates.length === 0 && <p>No hay reservas para hoy.</p>}
              {sortedDates.slice(0, 1).map(date => {
                // Solo mostrar si la fecha es hoy
                const today = new Date().toISOString().split('T')[0];
                if (date !== today) {
                  return <p key={date}>No hay reservas para hoy.</p>;
                }
                return (
                  <div key={date}>
                    <h3 style={{ fontWeight: 600, marginBottom: 8 }}>{date}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {grouped[date].map(b => (
                        <div
                          key={b.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '16px',
                            backgroundColor: b.active ? '#ecfdf5' : '#fffbeb',
                            border: `1px solid ${b.active ? '#d1fae5' : '#fef3c7'}`,
                            borderRadius: '8px',
                          }}
                        >
                          <div>
                            <p style={{ fontWeight: '600', color: '#111827' }}>Reserva #{b.id}</p>
                            <p style={{ fontSize: '14px', color: '#4b5563' }}>
                              {b.bookingHour}:00 - {b.bookingHour + 1}:00
                            </p>
                          </div>
                          <span
                            style={{
                              color: b.active ? '#047857' : '#b45309',
                              fontWeight: '500',
                              fontSize: '14px',
                            }}
                          >
                            {b.active ? 'Confirmada' : 'Pendiente'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

