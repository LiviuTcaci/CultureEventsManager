import { Venue } from '../types/models';

import { apiService } from './api';
import { mockVenues } from './mockData';

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getVenues = async (): Promise<Venue[]> => {
  try {
    return await apiService.get<Venue[]>('/venues');
  } catch (error) {
    console.log('Falling back to mock data for venues');
    await delay(500);
    return mockVenues;
  }
};

export const getVenueById = async (id: string): Promise<Venue> => {
  try {
    return await apiService.get<Venue>(`/venues/${id}`);
  } catch (error) {
    console.log(`Falling back to mock data for venue id: ${id}`);
    await delay(300);
    const venue = mockVenues.find(v => v.id === id);
    if (!venue) {
      throw new Error('Venue not found');
    }
    return venue;
  }
};

export const createVenue = async (venue: Partial<Venue>): Promise<Venue> => {
  return await apiService.post<Venue>('/venues', venue);
};

export const updateVenue = async (id: string, venue: Partial<Venue>): Promise<Venue> => {
  return await apiService.put<Venue>(`/venues/${id}`, venue);
};

export const deleteVenue = async (id: string): Promise<void> => {
  return await apiService.delete<void>(`/venues/${id}`);
};
