import { User, Event } from '../types/models';
import { apiService } from './api';
import { mockEvents, mockUsers } from './mockData';

const BASE_URL = '/users';

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const profileService = {
  // Get current user's profile
  getUserProfile: async (userId: string): Promise<User> => {
    try {
      // Try to fetch from API
      return await apiService.get<User>(`${BASE_URL}/${userId}`);
    } catch (error) {
      console.log(`Falling back to mock data for user profile: ${userId}`);
      await delay(300);
      
      // Find user in mock data
      const user = mockUsers.find(u => u.id === userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      return user;
    }
  },
  
  // Update user profile
  updateUserProfile: async (userId: string, userData: Partial<User>): Promise<User> => {
    try {
      // Try to update via API
      return await apiService.put<User>(`${BASE_URL}/${userId}`, userData);
    } catch (error) {
      console.log(`Mocking update profile for user: ${userId}`);
      await delay(300);
      
      // In a real app, this would update the user in the database
      // For now, we'll just return the updated user object
      return {
        ...mockUsers.find(u => u.id === userId)!,
        ...userData,
        updatedAt: new Date().toISOString()
      };
    }
  },
  
  // Get user's saved events
  getSavedEvents: async (userId: string): Promise<Event[]> => {
    try {
      // Try to fetch from API
      return await apiService.get<Event[]>(`${BASE_URL}/${userId}/saved-events`);
    } catch (error) {
      console.log(`Falling back to mock data for saved events: ${userId}`);
      await delay(400);
      
      // Find user's saved event IDs
      const user = mockUsers.find(u => u.id === userId);
      if (!user || !user.savedEventIds || user.savedEventIds.length === 0) {
        return [];
      }
      
      // Return events that match the saved IDs
      return mockEvents.filter(event => user.savedEventIds.includes(event.id));
    }
  },
  
  // Get user's attended events
  getAttendedEvents: async (userId: string): Promise<Event[]> => {
    try {
      // Try to fetch from API
      return await apiService.get<Event[]>(`${BASE_URL}/${userId}/attended-events`);
    } catch (error) {
      console.log(`Falling back to mock data for attended events: ${userId}`);
      await delay(400);
      
      // Find user's attended event IDs
      const user = mockUsers.find(u => u.id === userId);
      if (!user || !user.attendedEventIds || user.attendedEventIds.length === 0) {
        return [];
      }
      
      // Return events that match the attended IDs
      return mockEvents.filter(event => user.attendedEventIds.includes(event.id));
    }
  },
  
  // Add event to saved events
  addSavedEvent: async (userId: string, eventId: string): Promise<void> => {
    try {
      // Try to update via API
      await apiService.post<void>(`${BASE_URL}/${userId}/saved-events/${eventId}`, {});
    } catch (error) {
      console.log(`Mocking add saved event: ${eventId} for user: ${userId}`);
      await delay(300);
      
      // In a real app, this would update the database
      // For this mock implementation, we don't actually update our static mock data
    }
  },
  
  // Remove event from saved events
  removeSavedEvent: async (userId: string, eventId: string): Promise<void> => {
    try {
      // Try to update via API
      await apiService.delete<void>(`${BASE_URL}/${userId}/saved-events/${eventId}`);
    } catch (error) {
      console.log(`Mocking remove saved event: ${eventId} for user: ${userId}`);
      await delay(300);
      
      // In a real app, this would update the database
      // For this mock implementation, we don't actually update our static mock data
    }
  },
  
  // Add event to attended events
  addAttendedEvent: async (userId: string, eventId: string): Promise<void> => {
    try {
      // Try to update via API
      await apiService.post<void>(`${BASE_URL}/${userId}/attended-events/${eventId}`, {});
    } catch (error) {
      console.log(`Mocking add attended event: ${eventId} for user: ${userId}`);
      await delay(300);
      
      // In a real app, this would update the database
      // For this mock implementation, we don't actually update our static mock data
    }
  },
  
  // Remove event from attended events
  removeAttendedEvent: async (userId: string, eventId: string): Promise<void> => {
    try {
      // Try to update via API
      await apiService.delete<void>(`${BASE_URL}/${userId}/attended-events/${eventId}`);
    } catch (error) {
      console.log(`Mocking remove attended event: ${eventId} for user: ${userId}`);
      await delay(300);
      
      // In a real app, this would update the database
      // For this mock implementation, we don't actually update our static mock data
    }
  }
};
