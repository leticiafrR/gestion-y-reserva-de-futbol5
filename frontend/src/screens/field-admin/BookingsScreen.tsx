import React, { useEffect, useState } from 'react';
import { getOwnerBookings, OwnerBooking } from '@/services/bookingService';
import { navigate } from "wouter/use-browser-location";
import { Calendar, MapPin, Clock } from 'lucide-react';

export const BookingsScreen: React.FC = () => {
  const [bookings, setBookings] = useState<OwnerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await getOwnerBookings();
        setBookings(data);
        setError(null);
      } catch (error: any) {
        setBookings([]);
        setError(error.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Separar reservas en próximas e historial
  const now = new Date();
  const parseDateTime = (date: string, hour: number) => {
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day, hour);
  };

  const upcomingBookings = bookings.filter(b => {
    const dt = parseDateTime(b.bookingDate, b.bookingHour);
    return dt >= now && b.active;
  });

  const historyBookings = bookings.filter(b => {
    const dt = parseDateTime(b.bookingDate, b.bookingHour);
    return dt < now || !b.active;
  });

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Cargando reservas...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', marginTop: '2rem', color: '#ef4444' }}>{error}</div>;
  }

  return (
    <div style={{
      padding: '2rem',
      maxWidth: 1000,
      margin: '0 auto',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ color: '#212529', margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
          Gestión de Reservas
        </h1>
        <button
          style={{
            padding: '10px 16px',
            backgroundColor: 'var(--secondary)',
            color: 'var(--secondary-foreground)',
            border: '1px solid var(--border)',
            cursor: 'pointer',
            fontSize: '14px',
            borderRadius: 'var(--radius-lg)',
            transition: 'all 0.2s ease',
            textDecoration: 'none'
          }}
          onClick={() => navigate('/main')}
        >
          Volver a Inicio
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0 }}>
        <button
          onClick={() => setActiveTab('upcoming')}
          style={{
            flex: 1,
            padding: '12px 0',
            background: activeTab === 'upcoming' ? '#3b82f6' : 'white',
            color: activeTab === 'upcoming' ? 'white' : '#3b82f6',
            border: '1px solid #3b82f6',
            borderBottom: activeTab === 'upcoming' ? 'none' : '1px solid #3b82f6',
            borderTopLeftRadius: 8,
            borderTopRightRadius: 0,
            fontWeight: 600,
            fontSize: 16,
            cursor: 'pointer',
            outline: 'none',
            transition: 'all 0.2s',
          }}
        >
          Próximas reservas
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            flex: 1,
            padding: '12px 0',
            background: activeTab === 'history' ? '#3b82f6' : 'white',
            color: activeTab === 'history' ? 'white' : '#3b82f6',
            border: '1px solid #3b82f6',
            borderBottom: activeTab === 'history' ? 'none' : '1px solid #3b82f6',
            borderTopLeftRadius: 0,
            borderTopRightRadius: 8,
            fontWeight: 600,
            fontSize: 16,
            cursor: 'pointer',
            outline: 'none',
            transition: 'all 0.2s',
          }}
        >
          Historial de reservas
        </button>
      </div>

      {/* Contenido de la pestaña activa */}
      <div style={{ background: 'white', border: 'none', borderRadius: '0 0 8px 8px', padding: '2rem 1rem', minHeight: 200 }}>
        {activeTab === 'upcoming' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {upcomingBookings.length === 0 && (
              <div style={{ color: '#6b7280', fontSize: '1.1rem', textAlign: 'center', padding: '30px' }}>
                No hay próximas reservas.
              </div>
            )}
            {upcomingBookings.map((booking) => (
              <div
                key={booking.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  background: booking.active ? 'white' : '#f8f9fa',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                  padding: '1.2rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  opacity: booking.active ? 1 : 0.7,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h2 style={{ margin: 0, color: '#3b82f6', fontSize: '1.2rem', fontWeight: 600 }}>
                      Reserva #{booking.id}
                    </h2>
                    <span style={{
                      marginLeft: 12,
                      padding: '2px 10px',
                      backgroundColor: booking.active ? '#10b981' : '#ef4444',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                    }}>
                      {booking.active ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  <div style={{ color: '#374151', fontSize: 15, marginTop: 4 }}>
                    <b>Fecha:</b> {booking.bookingDate}
                  </div>
                  <div style={{ color: '#374151', fontSize: 15 }}>
                    <b>Hora:</b> {booking.bookingHour}:00
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {historyBookings.length === 0 && (
              <div style={{ color: '#6b7280', fontSize: '1.1rem', textAlign: 'center', padding: '30px' }}>
                No hay reservas anteriores.
              </div>
            )}
            {historyBookings.map((booking) => (
              <div
                key={booking.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  background: booking.active ? 'white' : '#f8f9fa',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                  padding: '1.2rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  opacity: booking.active ? 1 : 0.7,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h2 style={{ margin: 0, color: '#3b82f6', fontSize: '1.2rem', fontWeight: 600 }}>
                      Reserva #{booking.id}
                    </h2>
                    <span style={{
                      marginLeft: 12,
                      padding: '2px 10px',
                      backgroundColor: booking.active ? '#10b981' : '#ef4444',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                    }}>
                      {booking.active ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  <div style={{ color: '#374151', fontSize: 15, marginTop: 4 }}>
                    <b>Fecha:</b> {booking.bookingDate}
                  </div>
                  <div style={{ color: '#374151', fontSize: 15 }}>
                    <b>Hora:</b> {booking.bookingHour}:00
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 