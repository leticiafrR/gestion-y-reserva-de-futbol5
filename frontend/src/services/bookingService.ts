import axios from 'axios';
import { BookingDTO } from '@/models/BookingDTO';

const API_URL = 'http://localhost:30002';

export const bookingService = {
    // Create a new booking
    createBooking: async (userId: number, timeslotId: number, date: string, hour: number): Promise<BookingDTO> => {
        const response = await axios.post(`${API_URL}/bookings`, null, {
            params: {
                userId,
                timeslotId,
                date,
                hour
            }
        });
        return response.data;
    },

    // Get booking by ID
    getBookingById: async (id: number): Promise<BookingDTO> => {
        const response = await axios.get(`${API_URL}/bookings/${id}`);
        return response.data;
    },

    // Cancel a booking
    cancelBooking: async (id: number): Promise<void> => {
        await axios.delete(`${API_URL}/bookings/${id}`);
    },

    // Get bookings for field owner
    getBookingsForOwner: async (): Promise<BookingDTO[]> => {
        const response = await axios.get(`${API_URL}/bookings/owner`);
        return response.data;
    },

    // Get user's own bookings
    getMyBookings: async (): Promise<BookingDTO[]> => {
        const response = await axios.get(`${API_URL}/bookings/my`);
        return response.data;
    },

    // Get active bookings by field
    getBookingsByField: async (fieldId: number): Promise<BookingDTO[]> => {
        const response = await axios.get(`${API_URL}/bookings/field/${fieldId}`);
        return response.data;
    },

    // Get available hours for a field
    getAvailableHours: async (fieldId: number, days: number = 10): Promise<Record<string, number[]>> => {
        const response = await axios.get(`${API_URL}/bookings/availability/${fieldId}`, {
            params: { days }
        });
        return response.data;
    }
}; 