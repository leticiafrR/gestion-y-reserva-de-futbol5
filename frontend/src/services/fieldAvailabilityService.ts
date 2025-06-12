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

/*
// Example usage with hardcoded data for testing:

// Example 1: Get availability
const fieldId = 1;
const availability = await fieldAvailabilityService.getFieldAvailability(fieldId);
console.log('Current availability:', availability);

// Example 2: Set availability with hardcoded data
const newAvailability: TimeSlotDTO[] = [
  {
    dayOfWeek: 'MONDAY',
    openTime: fieldAvailabilityService.timeStringToHour('09:00'),
    closeTime: fieldAvailabilityService.timeStringToHour('18:00')
  },
  {
    dayOfWeek: 'TUESDAY',
    openTime: fieldAvailabilityService.timeStringToHour('09:00'),
    closeTime: fieldAvailabilityService.timeStringToHour('18:00')
  },
  {
    dayOfWeek: 'WEDNESDAY',
    openTime: fieldAvailabilityService.timeStringToHour('09:00'),
    closeTime: fieldAvailabilityService.timeStringToHour('18:00')
  },
  {
    dayOfWeek: 'THURSDAY',
    openTime: fieldAvailabilityService.timeStringToHour('09:00'),
    closeTime: fieldAvailabilityService.timeStringToHour('18:00')
  },
  {
    dayOfWeek: 'FRIDAY',
    openTime: fieldAvailabilityService.timeStringToHour('09:00'),
    closeTime: fieldAvailabilityService.timeStringToHour('18:00')
  },
  {
    dayOfWeek: 'SATURDAY',
    openTime: fieldAvailabilityService.timeStringToHour('10:00'),
    closeTime: fieldAvailabilityService.timeStringToHour('22:00')
  },
  {
    dayOfWeek: 'SUNDAY',
    openTime: fieldAvailabilityService.timeStringToHour('10:00'),
    closeTime: fieldAvailabilityService.timeStringToHour('22:00')
  }
];

// Example 3: Set availability with different time slots for the same day
const complexAvailability: TimeSlotDTO[] = [
  {
    dayOfWeek: 'MONDAY',
    openTime: fieldAvailabilityService.timeStringToHour('09:00'),
    closeTime: fieldAvailabilityService.timeStringToHour('13:00')
  },
  {
    dayOfWeek: 'MONDAY',
    openTime: fieldAvailabilityService.timeStringToHour('15:00'),
    closeTime: fieldAvailabilityService.timeStringToHour('20:00')
  }
];

// To test setting availability:
try {
  await fieldAvailabilityService.setFieldAvailability(fieldId, newAvailability);
  console.log('Availability set successfully');
} catch (error) {
  console.error('Failed to set availability:', error);
}
*/ 