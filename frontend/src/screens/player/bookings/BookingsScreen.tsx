import React, { useEffect, useState } from 'react';
import { bookingService } from '@/services/bookingService';
import { useAvailableFields } from '@/services/AvailableFieldsServices';
import { FieldAvailabilityService } from '@/services/fieldAvailabilityService';
import type { Field } from '@/models/Field';
import { useState as useReactState } from 'react';
import { navigate } from "wouter/use-browser-location";
import { DeleteBookingConfirmationModal } from './DeleteBookingConfirmationModal';

const fieldAvailabilityService = new FieldAvailabilityService();

interface Booking {
  id: number;
  userId: number;
  timeSlotId: number;
  bookingDate: string;
  bookingHour: number;
  active: boolean;
}

interface TimeSlot {
  id: number;
  fieldId: number;
  dayOfWeek: string;
  openTime: number;
  closeTime: number;
}

export const BookingsScreen: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [timeSlots, setTimeSlots] = useState<Record<number, TimeSlot>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useReactState<'upcoming' | 'history'>('upcoming');
  const [cancelingId, setCancelingId] = useReactState<number | null>(null);
  const [cancelError, setCancelError] = useReactState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useReactState(false);
  const [bookingToDelete, setBookingToDelete] = useReactState<{ id: number, fieldName: string } | null>(null);

  // Obtener canchas disponibles
  const { data: availableFields } = useAvailableFields();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Obtener reservas
        const myBookings = await bookingService.getAllMyBookings();
        // Mapear para asegurar que cada booking tenga las propiedades necesarias
        setBookings(myBookings.map((b: any) => ({
          id: b.id,
          userId: b.userId,
          timeSlotId: b.timeSlotId,
          bookingDate: b.bookingDate,
          bookingHour: b.bookingHour,
          active: b.active,
        })));

        // 2. Obtener todas las canchas
        setFields(availableFields || []);

        // 3. Obtener todos los timeslots usados en las reservas
        const uniqueTimeSlotIds = Array.from(new Set(myBookings.map(b => b.timeSlotId)));
        const slots: Record<number, TimeSlot> = {};
        for (const tsId of uniqueTimeSlotIds) {
          // Buscar el timeslot en todas las canchas
          let found = false;
          for (const field of availableFields || []) {
            const slotsForField = await fieldAvailabilityService.getFieldAvailability(Number(field.id));
            const slot = slotsForField.find(s => s.id === tsId);
            if (slot) {
              slots[tsId] = slot;
              found = true;
              break;
            }
          }
          if (!found) {
            slots[tsId] = { id: tsId, fieldId: -1, dayOfWeek: '', openTime: 0, closeTime: 0 };
          }
        }
        setTimeSlots(slots);
      } catch (e) {
        setError('Error al cargar tus reservas.');
      } finally {
        setLoading(false);
      }
    };
    if (availableFields) fetchData();
  }, [availableFields]);

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

  const handleCancel = (id: number, fieldName: string) => {
    setBookingToDelete({ id, fieldName });
    setShowDeleteModal(true);
  };

  const confirmCancel = async () => {
    if (!bookingToDelete) return;
    setCancelError(null);
    setCancelingId(bookingToDelete.id);
    try {
      await bookingService.cancelBooking(bookingToDelete.id);
      setBookings(prev => prev.map(b => b.id === bookingToDelete.id ? { ...b, active: false } : b));
      setShowDeleteModal(false);
      setBookingToDelete(null);
    } catch (e) {
      setCancelError('No se pudo cancelar la reserva.');
    } finally {
      setCancelingId(null);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Cargando reservas...</div>;
  }
  if (error) {
    return <div style={{ textAlign: 'center', marginTop: '2rem', color: '#ef4444' }}>{error}</div>;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--background)',
        padding: '24px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Header */}
      <header style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        backgroundColor: 'var(--card)',
        borderRadius: '12px',
        boxShadow: '0 1px 3px var(--border)',
        marginBottom: '32px'
      }}>
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'var(--foreground)',
            margin: 0
          }}>
            📅 Mis Reservas
          </h1>
          <p style={{
            color: 'var(--muted-foreground)',
            margin: '4px 0 0 0',
            fontSize: '14px'
          }}>
            Gestiona tus reservas de canchas
          </p>
        </div>
        <button
          style={{
            padding: '8px 16px',
            backgroundColor: 'var(--secondary)',
            border: '1px solid transparent',
            borderRadius: '8px',
            color: 'var(--secondary-foreground)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'var(--accent)';
            e.currentTarget.style.borderColor = 'black';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'var(--secondary)';
            e.currentTarget.style.borderColor = 'transparent';
          }}
          onClick={() => navigate('/main')}
        >
          Volver a Inicio
        </button>
      </header>
      {/* Main Content */}
      <main style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '0 16px'
      }}>
        <div style={{
          backgroundColor: 'var(--card)',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px var(--border)'
        }}>
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
                    No tienes próximas reservas.
                  </div>
                )}
                {upcomingBookings.map((booking) => {
                  const slot = timeSlots[booking.timeSlotId];
                  const field = fields.find(f => String(f.id) === String(slot?.fieldId));
                  return (
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
                        position: 'relative',
                      }}
                    >
                      <img
                        src={field?.photoUrl || '/placeholder.svg'}
                        alt={field?.name || 'Cancha'}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <h2 style={{ margin: 0, color: '#3b82f6', fontSize: '1.2rem', fontWeight: 600 }}>
                            {field?.name || 'Cancha'}
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
                          <b>Dirección:</b> {field?.address || '-'}
                        </div>
                        <div style={{ color: '#374151', fontSize: 15 }}>
                          <b>Fecha:</b> {booking.bookingDate}
                        </div>
                        <div style={{ color: '#374151', fontSize: 15 }}>
                          <b>Hora:</b> {booking.bookingHour}:00
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                        <button
                          onClick={() => handleCancel(booking.id, field?.name || 'Cancha')}
                          disabled={cancelingId === booking.id}
                          style={{
                            padding: '8px 14px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: cancelingId === booking.id ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: 500,
                            opacity: cancelingId === booking.id ? 0.7 : 1,
                            marginTop: 8
                          }}
                        >
                          Cancelar reserva
                        </button>
                      </div>
                    </div>
                  );
                })}
                {cancelError && (
                  <div style={{ color: '#ef4444', textAlign: 'center', marginTop: 12 }}>{cancelError}</div>
                )}
              </div>
            )}
            {activeTab === 'history' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {historyBookings.length === 0 && (
                  <div style={{ color: '#6b7280', fontSize: '1.1rem', textAlign: 'center', padding: '30px' }}>
                    No tienes reservas anteriores.
                  </div>
                )}
                {historyBookings.map((booking) => {
                  const slot = timeSlots[booking.timeSlotId];
                  const field = fields.find(f => String(f.id) === String(slot?.fieldId));
                  return (
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
                        position: 'relative',
                      }}
                    >
                      <img
                        src={field?.photoUrl || '/placeholder.svg'}
                        alt={field?.name || 'Cancha'}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <h2 style={{ margin: 0, color: '#3b82f6', fontSize: '1.2rem', fontWeight: 600 }}>
                            {field?.name || 'Cancha'}
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
                          <b>Dirección:</b> {field?.address || '-'}
                        </div>
                        <div style={{ color: '#374151', fontSize: 15 }}>
                          <b>Fecha:</b> {booking.bookingDate}
                        </div>
                        <div style={{ color: '#374151', fontSize: 15 }}>
                          <b>Hora:</b> {booking.bookingHour}:00
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      {showDeleteModal && bookingToDelete && (
        <DeleteBookingConfirmationModal
          bookingId={bookingToDelete.id}
          fieldName={bookingToDelete.fieldName}
          onClose={() => { setShowDeleteModal(false); setBookingToDelete(null); }}
          onConfirm={confirmCancel}
          loading={cancelingId === bookingToDelete.id}
        />
      )}
    </div>
  );
};
