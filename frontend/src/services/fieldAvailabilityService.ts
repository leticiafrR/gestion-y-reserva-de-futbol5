import { BASE_API_URL, getAuthToken } from "@/config/app-query-client";
import { useQuery } from "@tanstack/react-query";

// Types based on the API schema
export interface TimeSlotDTO {
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  openTime: number; // Hour (0-23)
  closeTime: number; // Hour (1-24)
}

export interface TimeSlotResponseDTO extends TimeSlotDTO {
  id: number;
  fieldId: number;
}

// --- Blocked Slots (Horarios Bloqueados) ---
export interface BlockedSlotDTO {
  id?: number;
  fieldId: number;
  date: string; // YYYY-MM-DD
  hour: number; // 0-23
}

export class FieldAvailabilityService {
  /**
   * Get the availability schedule for a specific field
   * @param fieldId The ID of the field
   * @returns Promise with the field availability schedule
   */
  async getFieldAvailability(fieldId: number): Promise<TimeSlotResponseDTO[]> {
    try {
      const accessToken = getAuthToken();
      const response = await fetch(`${BASE_API_URL}/timeslots/field/${fieldId}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch field availability with status ${response.status}: ${await response.text()}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching field availability:', error);
      throw error;
    }
  }

  /**
   * Set the availability schedule for a specific field
   * @param fieldId The ID of the field
   * @param availability The new availability schedule
   * @returns Promise that resolves when the availability is set
   */
  async setFieldAvailability(
    fieldId: number,
    availability: TimeSlotDTO[]
  ): Promise<void> {
    try {
      const accessToken = getAuthToken();
      const response = await fetch(`${BASE_API_URL}/timeslots/field/${fieldId}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(availability),
      });

      if (!response.ok) {
        throw new Error(`Failed to set field availability with status ${response.status}: ${await response.text()}`);
      }
    } catch (error) {
      console.error('Error setting field availability:', error);
      throw error;
    }
  }

  /**
   * Get availability for a specific day of the week
   * @param fieldId The ID of the field
   * @param dayOfWeek The day of the week to get availability for
   * @returns Promise with the time slot for the specified day
   */
  async getDayAvailability(
    fieldId: number,
    dayOfWeek: TimeSlotDTO['dayOfWeek']
  ): Promise<TimeSlotResponseDTO> {
    try {
      const accessToken = getAuthToken();

      const response = await fetch(`${BASE_API_URL}/timeslots/field/${fieldId}/${dayOfWeek}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch day availability with status ${response.status}: ${await response.text()}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching day availability:', error);
      throw error;
    }
  }

  /**
   * Update availability for a specific day of the week
   * @param fieldId The ID of the field
   * @param dayOfWeek The day of the week to update
   * @param timeSlot The new time slot for the day
   * @returns Promise that resolves when the availability is updated
   */
  async updateDayAvailability(
    fieldId: number,
    dayOfWeek: TimeSlotDTO['dayOfWeek'],
    timeSlot: TimeSlotDTO
  ): Promise<void> {
    try {
      const accessToken = getAuthToken();
      const response = await fetch(`${BASE_API_URL}/timeslots/field/${fieldId}/${dayOfWeek}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(timeSlot),
      });

      if (!response.ok) {
        throw new Error(`Failed to update day availability with status ${response.status}: ${await response.text()}`);
      }
    } catch (error) {
      console.error('Error updating day availability:', error);
      throw error;
    }
  }

  /**
   * Helper function to convert time string (HH:mm) to hour number
   * @param timeString Time in format "HH:mm"
   * @returns Hour number (0-23)
   */
  static timeStringToHour(timeString: string): number {
    const [hours] = timeString.split(':').map(Number);
    return hours;
  }

  /**
   * Helper function to convert hour number to time string (HH:mm)
   * @param hour Hour number (0-23)
   * @returns Time string in format "HH:mm"
   */
  static hourToTimeString(hour: number): string {
    return `${String(hour).padStart(2, '0')}:00`;
  }

  /**
   * Listar horarios bloqueados de una cancha (solo los próximos)
   */
  async getBlockedSlots(fieldId: number): Promise<BlockedSlotDTO[]> {
    try {
      const accessToken = getAuthToken();
      const response = await fetch(`${BASE_API_URL}/blockedslots/fields/${fieldId}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch blocked slots: ${response.status} - ${await response.text()}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching blocked slots:', error);
      throw error;
    }
  }

  /**
   * Listar todos los horarios bloqueados de una cancha (histórico)
   */
  async getAllBlockedSlots(fieldId: number): Promise<BlockedSlotDTO[]> {
    try {
      const accessToken = getAuthToken();
      const response = await fetch(`${BASE_API_URL}/blockedslots/fields/${fieldId}/all`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch all blocked slots: ${response.status} - ${await response.text()}`);
      }
      const blockedSlots = await response.json();
      
      // Transform backend BlockedSlot entities to frontend BlockedSlotDTO format
      return blockedSlots.map((slot: any) => ({
        id: slot.id,
        fieldId: slot.field?.id || fieldId,
        date: slot.date,
        hour: slot.hour
      }));
    } catch (error) {
      console.error('Error fetching all blocked slots:', error);
      throw error;
    }
  }

  /**
   * Bloquear un horario específico para una cancha
   */
  async addBlockedSlot(fieldId: number, date: string, hour: number): Promise<void> {
    try {
      const accessToken = getAuthToken();
      const response = await fetch(`${BASE_API_URL}/blockedslots/fields/${fieldId}?date=${date}&hour=${hour}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to add blocked slot: ${response.status} - ${await response.text()}`);
      }
      // No need to parse response
    } catch (error) {
      console.error('Error adding blocked slot:', error);
      throw error;
    }
  }

  /**
   * Eliminar un horario bloqueado
   */
  async deleteBlockedSlot(fieldId: number, date: string, hour: number): Promise<void> {
    try {
      const accessToken = getAuthToken();
      const response = await fetch(`${BASE_API_URL}/blockedslots/fields/${fieldId}?date=${date}&hour=${hour}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        // body: JSON.stringify({ date, hour }),
      });
      if (!response.ok) {
        throw new Error(`Failed to delete blocked slot: ${response.status} - ${await response.text()}`);
      }
    } catch (error) {
      console.error('Error deleting blocked slot:', error);
      throw error;
    }
  }
}

export const fieldAvailabilityService = new FieldAvailabilityService();

export function useFieldAvailability(fieldId: number | string | undefined) {
  return useQuery({
    queryKey: ["field-availability", fieldId],
    queryFn: () => {
      if (!fieldId) return Promise.resolve([]);
      return fieldAvailabilityService.getFieldAvailability(Number(fieldId));
    },
    enabled: !!fieldId,
  });
}

