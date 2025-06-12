import { BASE_API_URL, getAuthToken } from '@/config/app-query-client';

export interface FieldSummary {
  totalFields: number;
  totalBookingsToday: number;
  occupancyPercentage: number;
}

export const getFieldSummary = async (date: Date, days: number = 1): Promise<FieldSummary> => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;
  const token = getAuthToken();

  const response = await fetch(`${BASE_API_URL}/fields/owner/summary?date=${formattedDate}&days=${days}`, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch field summary: ${response.status} - ${errorText}`);
  }
  return response.json();
}; 