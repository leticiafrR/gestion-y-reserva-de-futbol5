import { BASE_API_URL, getAuthToken } from "@/config/app-query-client";

// Types based on the API schema
export interface LocalTime {
  hour: number;
  minute: number;
  second: number;
  nano: number;
}

export interface FieldAvailabilityDTO {
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  startTime: LocalTime;
  endTime: LocalTime;
}

export class FieldAvailabilityService {
  /**
   * Get the availability schedule for a specific field
   * @param fieldId The ID of the field
   * @returns Promise with the field availability schedule
   */
  async getFieldAvailability(fieldId: number): Promise<FieldAvailabilityDTO[]> {
    try {
      const accessToken = getAuthToken();
      const response = await fetch(`${BASE_API_URL}/fields/${fieldId}/availability`, {
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
    availability: FieldAvailabilityDTO[]
  ): Promise<void> {
    try {
      const accessToken = getAuthToken();
      const response = await fetch(`${BASE_API_URL}/fields/${fieldId}/availability`, {
        method: 'POST',
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
   * Helper function to convert time string (HH:mm) to LocalTime object
   * @param timeString Time in format "HH:mm"
   * @returns LocalTime object
   */
  static timeStringToLocalTime(timeString: string): LocalTime {
    const [hours, minutes] = timeString.split(':').map(Number);
    return {
      hour: hours,
      minute: minutes,
      second: 0,
      nano: 0,
    };
  }

  /**
   * Helper function to convert LocalTime object to time string (HH:mm)
   * @param localTime LocalTime object
   * @returns Time string in format "HH:mm"
   */
  static localTimeToTimeString(localTime: LocalTime): string {
    return `${String(localTime.hour).padStart(2, '0')}:${String(localTime.minute).padStart(2, '0')}`;
  }
}

export const fieldAvailabilityService = new FieldAvailabilityService();

/*
// Example usage with hardcoded data for testing:

// Example 1: Get availability
const fieldId = 1;
const availability = await fieldAvailabilityService.getFieldAvailability(fieldId);
console.log('Current availability:', availability);

// Example 2: Set availability with hardcoded data
const newAvailability: FieldAvailabilityDTO[] = [
  {
    dayOfWeek: 'MONDAY',
    startTime: fieldAvailabilityService.timeStringToLocalTime('09:00'),
    endTime: fieldAvailabilityService.timeStringToLocalTime('18:00')
  },
  {
    dayOfWeek: 'TUESDAY',
    startTime: fieldAvailabilityService.timeStringToLocalTime('09:00'),
    endTime: fieldAvailabilityService.timeStringToLocalTime('18:00')
  },
  {
    dayOfWeek: 'WEDNESDAY',
    startTime: fieldAvailabilityService.timeStringToLocalTime('09:00'),
    endTime: fieldAvailabilityService.timeStringToLocalTime('18:00')
  },
  {
    dayOfWeek: 'THURSDAY',
    startTime: fieldAvailabilityService.timeStringToLocalTime('09:00'),
    endTime: fieldAvailabilityService.timeStringToLocalTime('18:00')
  },
  {
    dayOfWeek: 'FRIDAY',
    startTime: fieldAvailabilityService.timeStringToLocalTime('09:00'),
    endTime: fieldAvailabilityService.timeStringToLocalTime('18:00')
  },
  {
    dayOfWeek: 'SATURDAY',
    startTime: fieldAvailabilityService.timeStringToLocalTime('10:00'),
    endTime: fieldAvailabilityService.timeStringToLocalTime('22:00')
  },
  {
    dayOfWeek: 'SUNDAY',
    startTime: fieldAvailabilityService.timeStringToLocalTime('10:00'),
    endTime: fieldAvailabilityService.timeStringToLocalTime('22:00')
  }
];

// Example 3: Set availability with different time slots for the same day
const complexAvailability: FieldAvailabilityDTO[] = [
  {
    dayOfWeek: 'MONDAY',
    startTime: fieldAvailabilityService.timeStringToLocalTime('09:00'),
    endTime: fieldAvailabilityService.timeStringToLocalTime('13:00')
  },
  {
    dayOfWeek: 'MONDAY',
    startTime: fieldAvailabilityService.timeStringToLocalTime('15:00'),
    endTime: fieldAvailabilityService.timeStringToLocalTime('20:00')
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