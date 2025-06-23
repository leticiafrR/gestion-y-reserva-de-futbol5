import React, { useState } from 'react';
import { useOwnerBookingsDetailed, OwnerBooking, bookingService } from '@/services/bookingService';
import { navigate } from "wouter/use-browser-location";
import { Calendar, MapPin, Clock, User, X } from 'lucide-react';
import { DeleteBookingConfirmationModal } from '@/components/DeleteBookingConfirmationModal';

export const BookingsScreen: React.FC = () => {
  const { data: bookings, isLoading, error } = useOwnerBookingsDetailed();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [cancellingBooking, setCancellingBooking] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<number | null>(null);

  const handleCancelBooking = async (bookingId: number) => {
    setBookingToDelete(bookingId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!bookingToDelete) return;
    
    setCancellingBooking(bookingToDelete);
    try {
      await bookingService.cancelBooking(bookingToDelete);
      // The hook will automatically refetch data
      window.location.reload(); // Simple refresh for now
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      // You could add a toast notification here instead of alert
    } finally {
      setCancellingBooking(null);
      setShowDeleteModal(false);
      setBookingToDelete(null);
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setBookingToDelete(null);
  };

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

  // Función para verificar si una reserva se puede cancelar (solo futuras y activas)
  const canCancelBooking = (booking: OwnerBooking) => {
    const dt = parseDateTime(booking.bookingDate, booking.bookingHour);
    return dt >= now && booking.active;
  };

  const renderMatchTypeBadge = (matchType: 'open' | 'closed' | null | undefined) => {
    if (!matchType) {
      return (
        <span style={{
          padding: '2px 8px',
          backgroundColor: '#6b7280',
          color: 'white',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: '500',
        }}>
          Sin partido
        </span>
      );
    }
    
    return (
      <span style={{
        padding: '2px 8px',
        backgroundColor: matchType === 'open' ? '#10b981' : '#8b5cf6',
        color: 'white',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: '500',
      }}>
        {matchType === 'open' ? 'Partido Abierto' : 'Partido Cerrado'}
      </span>
    );
  };

  const renderBookingCard = (booking: OwnerBooking) => (
    <div
      key={booking.id}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '10px',
        background: booking.active ? 'white' : '#f8f9fa',
        boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
        padding: '1.2rem 1.5rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1.5rem',
        opacity: booking.active ? 1 : 0.7,
      }}
    >
      {/* Field Photo */}
      <img
        src={booking.fieldPhotoUrl || '/placeholder.svg'}
        alt={booking.fieldName || 'Cancha'}
        style={{
          width: 80,
          height: 80,
          objectFit: 'cover',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          flexShrink: 0,
        }}
      />
      
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '8px' }}>
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
          {renderMatchTypeBadge(booking.matchType)}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '4px' }}>
          <User size={14} style={{ color: '#6b7280' }} />
          <div style={{ color: '#374151', fontSize: 15 }}>
            <b>Organizador:</b> {booking.userName} {booking.userLastName}
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '4px' }}>
          <MapPin size={14} style={{ color: '#6b7280' }} />
          <div style={{ color: '#374151', fontSize: 15 }}>
            <b>Cancha:</b> {booking.fieldName} - {booking.fieldAddress}
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '4px' }}>
          <Calendar size={14} style={{ color: '#6b7280' }} />
          <div style={{ color: '#374151', fontSize: 15 }}>
            <b>Fecha:</b> {booking.bookingDate}
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '8px' }}>
          <Clock size={14} style={{ color: '#6b7280' }} />
          <div style={{ color: '#374151', fontSize: 15 }}>
            <b>Hora:</b> {booking.bookingHour}:00
          </div>
        </div>
        
        <div style={{ color: '#6b7280', fontSize: 14 }}>
          <b>Email:</b> {booking.userEmail}
        </div>
      </div>
      
      {canCancelBooking(booking) && (
        <button
          onClick={() => handleCancelBooking(booking.id)}
          disabled={cancellingBooking === booking.id}
          style={{
            padding: '8px 12px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: cancellingBooking === booking.id ? 'not-allowed' : 'pointer',
            fontSize: '12px',
            fontWeight: '500',
            opacity: cancellingBooking === booking.id ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <X size={14} />
          {cancellingBooking === booking.id ? 'Cancelando...' : 'Cancelar'}
        </button>
      )}
    </div>
  );

  if (isLoading) {
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
            {upcomingBookings.map(renderBookingCard)}
          </div>
        )}

        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {historyBookings.length === 0 && (
              <div style={{ color: '#6b7280', fontSize: '1.1rem', textAlign: 'center', padding: '30px' }}>
                No hay reservas anteriores.
              </div>
            )}
            {historyBookings.map(renderBookingCard)}
          </div>
        )}
      </div>

      {showDeleteModal && (
        <DeleteBookingConfirmationModal
          isOpen={showDeleteModal}
          onClose={closeDeleteModal}
          onConfirm={confirmDelete}
          bookingId={bookingToDelete || 0}
          isLoading={cancellingBooking !== null}
        />
      )}
    </div>
  );
}; 