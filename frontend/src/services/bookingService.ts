import axios from 'axios';
import { BookingDTO } from '@/models/BookingDTO';
import { BASE_API_URL, getAuthToken } from '@/config/app-query-client';
import { useQuery } from "@tanstack/react-query";

export const bookingService = {
    // Create a new booking
    createBooking: async (timeslotId: number, date: string, hour: number): Promise<BookingDTO> => {
        console.log(timeslotId, date, hour)
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
        console.log("response", response)
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
        console.log("response", response)
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