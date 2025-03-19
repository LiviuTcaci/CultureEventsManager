import { Event } from '../types/models';
import { apiService } from './api';

const EVENTS_ENDPOINT = '/events';

export const eventService = {
  // Get all events
  getAllEvents: (): Promise<Event[]> => {
    return apiService.get<Event[]>(EVENTS_ENDPOINT);
  },

  // Get event by ID
  getEventById: (id: string): Promise<Event> => {
    return apiService.get<Event>(`${EVENTS_ENDPOINT}/${id}`);
  },

  // Get events by category
  getEventsByCategory: (categoryId: string): Promise<Event[]> => {
    return apiService.get<Event[]>(`${EVENTS_ENDPOINT}/category/${categoryId}`);
  },

  // Create new event
  createEvent: (event: Partial<Event>): Promise<Event> => {
    return apiService.post<Event>(EVENTS_ENDPOINT, event);
  },

  // Update event
  updateEvent: (id: string, event: Partial<Event>): Promise<Event> => {
    return apiService.put<Event>(`${EVENTS_ENDPOINT}/${id}`, event);
  },

  // Delete event
  deleteEvent: (id: string): Promise<void> => {
    return apiService.delete<void>(`${EVENTS_ENDPOINT}/${id}`);
  },

  // Search events by title or description
  searchEvents: (query: string): Promise<Event[]> => {
    return apiService.get<Event[]>(`${EVENTS_ENDPOINT}/search?q=${encodeURIComponent(query)}`);
  },

  // Filter events by various criteria
  filterEvents: (filters: {
    categoryId?: string;
    venueId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  }): Promise<Event[]> => {
    // Convert filters to query string
    const queryParams = Object.entries(filters)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');

    return apiService.get<Event[]>(`${EVENTS_ENDPOINT}/filter?${queryParams}`);
  },
};
