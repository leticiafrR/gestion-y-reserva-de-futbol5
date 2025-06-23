import axios from 'axios';
import { BookingDTO } from '@/models/BookingDTO';
import { BASE_API_URL, getAuthToken } from '@/config/app-query-client';
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from 'react';
import { useOwnerPastOpenMatches, useOwnerPastCloseMatches } from './MatchServices';

export interface OwnerBooking {
  id: number;
  userId: number;
  timeSlotId: number;
  bookingDate: string; // 'YYYY-MM-DD'
  bookingHour: number;
  active: boolean;
  // Additional information for detailed view
  userName?: string;
  userLastName?: string;
  userEmail?: string;
  fieldId?: number;
  fieldName?: string;
  fieldAddress?: string;
  matchType?: 'open' | 'closed' | null; // null if no match
  fieldPhotoUrl?: string | null;
}

export const bookingService = {
    // Create a new booking
    createBooking: async (timeslotId: number, date: string, hour: number): Promise<BookingDTO> => {
        const accessToken = getAuthToken();
        const response = await axios.post(`${BASE_API_URL}/bookings`, null, {
            params: {
                timeslotId,
                date,
                hour
            },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        return response.data;
    },

    // Get booking by ID
    getBookingById: async (id: number): Promise<BookingDTO> => {
        const accessToken = getAuthToken();
        const response = await axios.get(`${BASE_API_URL}/bookings/${id}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        return response.data;
    },

    // Cancel a booking
    cancelBooking: async (id: number): Promise<void> => {
        const accessToken = getAuthToken();
        await axios.delete(`${BASE_API_URL}/bookings/${id}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
    },

    // Get bookings for field owner
    getBookingsForOwner: async (): Promise<BookingDTO[]> => {
        const accessToken = getAuthToken();
        const response = await axios.get(`${BASE_API_URL}/bookings/owner`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        return response.data;
    },

    // Get user's own bookings
    getMyBookings: async (): Promise<BookingDTO[]> => {
        const accessToken = getAuthToken();
        const response = await axios.get(`${BASE_API_URL}/bookings/my`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        return response.data;
    },

    // Get active bookings by field
    getBookingsByField: async (fieldId: number): Promise<BookingDTO[]> => {
        const accessToken = getAuthToken();
        const response = await axios.get(`${BASE_API_URL}/bookings/field/${fieldId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        return response.data;
    },

    // Get available hours for a field
    getAvailableHours: async (fieldId: number, days: number = 10): Promise<Record<string, number[]>> => {
        const accessToken = getAuthToken();
        const response = await axios.get(`${BASE_API_URL}/bookings/availability/${fieldId}`, {
            params: { days },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        return response.data;
    },

    // Get user's all bookings (active and inactive)
    getAllMyBookings: async (): Promise<BookingDTO[]> => {
        const accessToken = getAuthToken();
        const response = await axios.get(`${BASE_API_URL}/bookings/my/all`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        return response.data;
    }
};

export function useFieldAvailableHours(fieldId: string | number | undefined, days: number = 10) {
  return useQuery({
    queryKey: ["field-available-hours", fieldId, days],
    queryFn: async () => {
      if (!fieldId) return {};
      const accessToken = getAuthToken();
      const response = await fetch(`${BASE_API_URL}/bookings/availability/${fieldId}?days=${days}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!response.ok) throw new Error("Error fetching available hours");
      return response.json();
    },
    enabled: !!fieldId,
  });
}

export const getOwnerBookings = async (): Promise<OwnerBooking[]> => {
  const accessToken = getAuthToken();
  const response = await axios.get(`${BASE_API_URL}/bookings/owner`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  return response.data;
};

export function useOwnerBookingsDetailed() {
  const [data, setData] = useState<OwnerBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use the new owner-specific match hooks for past matches
  const { data: ownerPastOpenMatches, isLoading: loadingPastOpen, error: errorPastOpen } = useOwnerPastOpenMatches();
  const { data: ownerPastCloseMatches, isLoading: loadingPastClose, error: errorPastClose } = useOwnerPastCloseMatches();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const accessToken = getAuthToken();
        
        // Fetch bookings
        const bookingsResponse = await axios.get(`${BASE_API_URL}/bookings/owner`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        
        // Fetch active matches (for upcoming bookings)
        const [activeOpenResponse, activeCloseResponse] = await Promise.all([
          axios.get(`${BASE_API_URL}/matches/open`, {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }),
          axios.get(`${BASE_API_URL}/matches/close`, {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          })
        ]);
        
        const bookings = bookingsResponse.data;
        const activeOpenMatches = activeOpenResponse.data;
        const activeCloseMatches = activeCloseResponse.data;
        
        // Wait for past match data to be loaded
        if (loadingPastOpen || loadingPastClose) {
          return;
        }
        
        if (errorPastOpen || errorPastClose) {
          throw new Error(errorPastOpen || errorPastClose || 'Error loading past match data');
        }
        
        // Create a map of booking ID to match type and match data
        const bookingToMatch = new Map<number, { type: 'open' | 'closed', match: any }>();
        
        // Map active open matches (for upcoming bookings)
        activeOpenMatches.forEach((match: any) => {
          if (match.booking && match.booking.id) {
            bookingToMatch.set(match.booking.id, { type: 'open', match });
          }
        });
        
        // Map active close matches (for upcoming bookings)
        activeCloseMatches.forEach((match: any) => {
          if (match.booking && match.booking.id) {
            bookingToMatch.set(match.booking.id, { type: 'closed', match });
          }
        });
        
        // Map past open matches (for history bookings)
        ownerPastOpenMatches?.forEach((match: any) => {
          if (match.booking && match.booking.id) {
            bookingToMatch.set(match.booking.id, { type: 'open', match });
          }
        });
        
        // Map past close matches (for history bookings)
        ownerPastCloseMatches?.forEach((match: any) => {
          if (match.booking && match.booking.id) {
            bookingToMatch.set(match.booking.id, { type: 'closed', match });
          }
        });
        
        const detailedBookings = bookings.map((booking: any) => {
          const matchInfo = bookingToMatch.get(booking.id);
          const match = matchInfo?.match;
          
          return {
            ...booking,
            // Use match data if available, otherwise use more appropriate defaults
            userName: match?.booking?.user?.name || 'Usuario',
            userLastName: match?.booking?.user?.last_name || 'No disponible',
            userEmail: match?.booking?.user?.username || 'No disponible',
            fieldId: match?.booking?.timeSlot?.field?.id || booking.timeSlotId,
            fieldName: match?.booking?.timeSlot?.field?.name || 'Cancha',
            fieldAddress: match?.booking?.timeSlot?.field?.address || 'Dirección no disponible',
            fieldPhotoUrl: match?.booking?.timeSlot?.field?.photoUrl || null,
            matchType: matchInfo?.type || null
          };
        });
        
        setData(detailedBookings);
      } catch (error: any) {
        console.error('Error fetching detailed bookings:', error);
        setError(error.message || 'Error al cargar las reservas');
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [ownerPastOpenMatches, ownerPastCloseMatches, loadingPastOpen, loadingPastClose, errorPastOpen, errorPastClose]);

  return { data, isLoading, error };
} 