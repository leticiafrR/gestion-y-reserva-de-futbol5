import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface DeleteBookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  bookingId: number;
  isLoading: boolean;
}

export const DeleteBookingConfirmationModal: React.FC<DeleteBookingConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  bookingId,
  isLoading
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <AlertTriangle size={20} style={{ color: '#ef4444' }} />
            <h3 style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
            }}>
              Confirmar Cancelación
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            style={{
              background: 'none',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              padding: '4px',
              borderRadius: '4px',
              opacity: isLoading ? 0.5 : 1,
            }}
          >
            <X size={20} style={{ color: '#6b7280' }} />
          </button>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: '#6b7280',
            lineHeight: '1.5',
          }}>
            ¿Estás seguro de que quieres cancelar la reserva #{bookingId}?
          </p>
          <p style={{
            margin: '8px 0 0 0',
            fontSize: '14px',
            color: '#ef4444',
            fontWeight: '500',
          }}>
            Esta acción no se puede deshacer.
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              opacity: isLoading ? 0.5 : 1,
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: '1px solid #ef4444',
              borderRadius: '6px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              opacity: isLoading ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '12px',
                  height: '12px',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }} />
                Cancelando...
              </>
            ) : (
              'Sí, Cancelar Reserva'
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}; 