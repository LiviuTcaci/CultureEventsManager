import { Event } from '../types/models';
import { apiService } from './api';
import { mockEvents } from './mockData';

const EVENTS_ENDPOINT = '/events';

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const eventService = {
  // Get all events
  getAllEvents: async (): Promise<Event[]> => {
    try {
      // Try to fetch from API
      return await apiService.get<Event[]>(EVENTS_ENDPOINT);
    } catch (error) {
      console.log('Falling back to mock data for events');
      // Simulate API delay
      await delay(500);
      return mockEvents;
    }
  },

  // Get event by ID
  getEventById: async (id: string): Promise<Event> => {
    try {
      return await apiService.get<Event>(`${EVENTS_ENDPOINT}/${id}`);
    } catch (error) {
      console.log(`Falling back to mock data for event id: ${id}`);
      await delay(300);
      const event = mockEvents.find(e => e.id === id);
      if (!event) {
        throw new Error('Event not found');
      }
      return event;
    }
  },

  // Get events by category
  getEventsByCategory: async (categoryId: string): Promise<Event[]> => {
    try {
      return await apiService.get<Event[]>(`${EVENTS_ENDPOINT}/category/${categoryId}`);
    } catch (error) {
      console.log(`Falling back to mock data for events in category: ${categoryId}`);
      await delay(400);
      return mockEvents.filter(e => e.categoryId === categoryId);
    }
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
  searchEvents: async (query: string): Promise<Event[]> => {
    try {
      return await apiService.get<Event[]>(`${EVENTS_ENDPOINT}/search?q=${encodeURIComponent(query)}`);
    } catch (error) {
      console.log(`Falling back to mock data for search query: ${query}`);
      await delay(400);
      
      const lowercaseQuery = query.toLowerCase();
      return mockEvents.filter(
        e => e.title.toLowerCase().includes(lowercaseQuery) || 
             e.description.toLowerCase().includes(lowercaseQuery)
      );
    }
  },

  // Filter events by various criteria
  filterEvents: async (filters: {
    categoryId?: string;
    venueId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  }): Promise<Event[]> => {
    try {
      // Convert filters to query string
      const queryParams = Object.entries(filters)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
        .join('&');

      return await apiService.get<Event[]>(`${EVENTS_ENDPOINT}/filter?${queryParams}`);
    } catch (error) {
      console.log(`Falling back to mock data for filters`);
      await delay(500);
      
      // Filter mock events based on criteria
      return mockEvents.filter(event => {
        let matches = true;
        
        if (filters.categoryId && event.categoryId !== filters.categoryId) {
          matches = false;
        }
        
        if (filters.venueId && event.venueId !== filters.venueId) {
          matches = false;
        }
        
        if (filters.status && event.status !== filters.status) {
          matches = false;
        }
        
        if (filters.startDate && new Date(event.startDate) < new Date(filters.startDate)) {
          matches = false;
        }
        
        if (filters.endDate && new Date(event.endDate) > new Date(filters.endDate)) {
          matches = false;
        }
        
        return matches;
      });
    }
  },
};
