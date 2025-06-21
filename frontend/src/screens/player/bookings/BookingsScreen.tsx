import React, { useEffect, useState } from 'react';
import { usePastOpenMatches, usePastCloseMatches } from '@/services/MatchServices';
import { useAvailableFields } from '@/services/AvailableFieldsServices';
import { FieldAvailabilityService } from '@/services/fieldAvailabilityService';
import type { Field } from '@/models/Field';
import { useState as useReactState } from 'react';
import { navigate } from "wouter/use-browser-location";

const fieldAvailabilityService = new FieldAvailabilityService();

interface PastMatch {
  id: number;
  booking: {
    id: number;
    userId: number;
    timeSlotId: number;
    bookingDate: string;
    bookingHour: number;
    active: boolean;
    timeSlot: {
      id: number;
      field: Field;
    }
  };
  isActive: boolean;
  matchType: "open" | "closed";
  // Para partidos abiertos
  players?: Array<{
    id: number;
    name: string;
    last_name: string;
    email: string;
    profilePicture: string;
  }>;
  minPlayers?: number;
  maxPlayers?: number;
  // Para partidos cerrados
  teamOne?: {
    id: number;
    name: string;
    members: Array<{
      id: number;
      name: string;
      last_name: string;
      email: string;
      profilePicture: string;
    }>;
  };
  teamTwo?: {
    id: number;
    name: string;
    members: Array<{
      id: number;
      name: string;
      last_name: string;
      email: string;
      profilePicture: string;
    }>;
  };
}

interface TimeSlot {
  id: number;
  fieldId: number;
  dayOfWeek: string;
  openTime: number;
  closeTime: number;
}

export const BookingsScreen: React.FC = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [timeSlots, setTimeSlots] = useState<Record<number, TimeSlot>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useReactState<'open' | 'closed'>('open');

  // Obtener canchas disponibles
  const { data: availableFields } = useAvailableFields();
  
  // Obtener partidos pasados
  const { data: pastOpenMatches, isLoading: loadingOpen, error: errorOpen } = usePastOpenMatches();
  const { data: pastCloseMatches, isLoading: loadingClose, error: errorClose } = usePastCloseMatches();

  useEffect(() => {
    setLoading(loadingOpen || loadingClose);
  }, [loadingOpen, loadingClose]);

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Cargando historial de partidos...</div>;
  }
  
  if (error || errorOpen || errorClose) {
    return <div style={{ textAlign: 'center', marginTop: '2rem', color: '#ef4444' }}>
      {error || errorOpen || errorClose}
    </div>;
  }

  const renderPlayerList = (players: any[]) => {
    return (
      <div style={{ marginTop: '8px' }}>
        <div style={{ fontWeight: '600', color: '#374151', fontSize: '14px', marginBottom: '4px' }}>
          Jugadores participantes:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {players.map((player, index) => (
            <span
              key={player.id}
              style={{
                backgroundColor: '#f3f4f6',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                color: '#374151',
                border: '1px solid #e5e7eb'
              }}
            >
              {player.name} {player.last_name}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderTeams = (teamOne: any, teamTwo: any) => {
    return (
      <div style={{ marginTop: '8px' }}>
        <div style={{ fontWeight: '600', color: '#374151', fontSize: '14px', marginBottom: '4px' }}>
          Equipos participantes:
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '500', color: '#3b82f6', fontSize: '13px', marginBottom: '4px' }}>
              {teamOne?.name || 'Equipo 1'}:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
              {teamOne?.members?.map((member: any) => (
                <span
                  key={member.id}
                  style={{
                    backgroundColor: '#dbeafe',
                    padding: '1px 6px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#1e40af',
                    border: '1px solid #bfdbfe'
                  }}
                >
                  {member.name} {member.last_name}
                </span>
              ))}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '500', color: '#dc2626', fontSize: '13px', marginBottom: '4px' }}>
              {teamTwo?.name || 'Equipo 2'}:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
              {teamTwo?.members?.map((member: any) => (
                <span
                  key={member.id}
                  style={{
                    backgroundColor: '#fee2e2',
                    padding: '1px 6px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#991b1b',
                    border: '1px solid #fecaca'
                  }}
                >
                  {member.name} {member.last_name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMatchCard = (match: PastMatch) => {
    const field = match.booking.timeSlot.field;
    
    return (
      <div
        key={match.id}
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: '10px',
          background: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
          padding: '1.2rem 1.5rem',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '8px' }}>
              <h2 style={{ margin: 0, color: '#3b82f6', fontSize: '1.2rem', fontWeight: 600 }}>
                {field?.name || 'Cancha'}
              </h2>
              <span style={{
                padding: '2px 10px',
                backgroundColor: match.matchType === 'open' ? '#10b981' : '#8b5cf6',
                color: 'white',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500',
              }}>
                {match.matchType === 'open' ? 'Partido Abierto' : 'Partido Cerrado'}
              </span>
            </div>
            
            <div style={{ color: '#374151', fontSize: 15, marginBottom: '4px' }}>
              <b>Dirección:</b> {field?.address || '-'}
            </div>
            <div style={{ color: '#374151', fontSize: 15, marginBottom: '4px' }}>
              <b>Fecha:</b> {match.booking.bookingDate}
            </div>
            <div style={{ color: '#374151', fontSize: 15, marginBottom: '8px' }}>
              <b>Hora:</b> {match.booking.bookingHour}:00
            </div>

            {/* Mostrar información específica según el tipo de partido */}
            {match.matchType === 'open' && match.players && (
              renderPlayerList(match.players)
            )}
            
            {match.matchType === 'closed' && match.teamOne && match.teamTwo && (
              renderTeams(match.teamOne, match.teamTwo)
            )}
          </div>
        </div>
      </div>
    );
  };

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
            📅 Historial de Partidos
          </h1>
          <p style={{
            color: 'var(--muted-foreground)',
            margin: '4px 0 0 0',
            fontSize: '14px'
          }}>
            Consulta tus partidos pasados y reservas
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
              onClick={() => setActiveTab('open')}
              style={{
                flex: 1,
                padding: '12px 0',
                background: activeTab === 'open' ? '#10b981' : 'white',
                color: activeTab === 'open' ? 'white' : '#10b981',
                border: '1px solid #10b981',
                borderBottom: activeTab === 'open' ? 'none' : '1px solid #10b981',
                borderTopLeftRadius: 8,
                borderTopRightRadius: 0,
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.2s',
              }}
            >
              Partidos Abiertos
            </button>
            <button
              onClick={() => setActiveTab('closed')}
              style={{
                flex: 1,
                padding: '12px 0',
                background: activeTab === 'closed' ? '#8b5cf6' : 'white',
                color: activeTab === 'closed' ? 'white' : '#8b5cf6',
                border: '1px solid #8b5cf6',
                borderBottom: activeTab === 'closed' ? 'none' : '1px solid #8b5cf6',
                borderTopLeftRadius: 0,
                borderTopRightRadius: 8,
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.2s',
              }}
            >
              Partidos Cerrados
            </button>
          </div>

          {/* Contenido de la pestaña activa */}
          <div style={{ background: 'white', border: 'none', borderRadius: '0 0 8px 8px', padding: '2rem 1rem', minHeight: 200 }}>
            {activeTab === 'open' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {(!pastOpenMatches || pastOpenMatches.length === 0) && (
                  <div style={{ color: '#6b7280', fontSize: '1.1rem', textAlign: 'center', padding: '30px' }}>
                    No tienes partidos abiertos pasados.
                  </div>
                )}
                {pastOpenMatches && pastOpenMatches.map((match) => renderMatchCard(match))}
              </div>
            )}
            
            {activeTab === 'closed' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {(!pastCloseMatches || pastCloseMatches.length === 0) && (
                  <div style={{ color: '#6b7280', fontSize: '1.1rem', textAlign: 'center', padding: '30px' }}>
                    No tienes partidos cerrados pasados.
                  </div>
                )}
                {pastCloseMatches && pastCloseMatches.map((match) => renderMatchCard(match))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
