import axios from 'axios';
import { BookingDTO } from '@/models/BookingDTO';
import { BASE_API_URL, getAuthToken } from '@/config/app-query-client';

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
    }
}; 