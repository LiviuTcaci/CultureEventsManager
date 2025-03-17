import { User } from '../types/models';
import { apiService } from './api';

const BASE_URL = '/users';

export const userService = {
  // Get all users
  getAllUsers: () => {
    return apiService.get<User[]>(BASE_URL);
  },

  // Get user by ID
  getUserById: (id: string) => {
    return apiService.get<User>(`${BASE_URL}/${id}`);
  },

  // Create new user
  createUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>) => {
    return apiService.post<User>(BASE_URL, user);
  },

  // Update user
  updateUser: (id: string, user: Partial<User>) => {
    return apiService.put<User>(`${BASE_URL}/${id}`, user);
  },

  // Delete user
  deleteUser: (id: string) => {
    return apiService.delete<void>(`${BASE_URL}/${id}`);
  },

  // Get current user profile
  getCurrentUser: () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      return JSON.parse(storedUser) as User;
    }
    return null;
  },

  // Save current user to localStorage
  saveCurrentUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Clear current user
  clearCurrentUser: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
};
