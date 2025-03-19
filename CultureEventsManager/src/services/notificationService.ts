import { apiService } from './api';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'event' | 'ticket' | 'system' | 'comment' | 'rating';
  read: boolean;
  createdAt: string;
  link?: string;
  entityId?: string; // ID of the related entity (event, ticket, etc.)
}

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    title: 'Event Reminder',
    message: 'Symphony Orchestra Concert is happening tomorrow at 19:00.',
    type: 'event',
    read: false,
    createdAt: '2025-03-18T14:30:00Z',
    link: '/events/1',
    entityId: '1'
  },
  {
    id: '2',
    userId: '1',
    title: 'Ticket Confirmation',
    message: 'Your ticket for Modern Art Exhibition has been confirmed.',
    type: 'ticket',
    read: true,
    createdAt: '2025-03-17T10:15:00Z',
    link: '/profile',
    entityId: '2'
  },
  {
    id: '3',
    userId: '1',
    title: 'New Comment',
    message: 'Someone replied to your comment on Shakespeare Festival.',
    type: 'comment',
    read: false,
    createdAt: '2025-03-16T18:45:00Z',
    link: '/events/3#comments',
    entityId: '3'
  },
  {
    id: '4',
    userId: '1',
    title: 'Price Drop Alert',
    message: 'Jazz Night ticket prices have been reduced! Limited time offer.',
    type: 'event',
    read: false,
    createdAt: '2025-03-15T09:20:00Z',
    link: '/events/4',
    entityId: '4'
  },
  {
    id: '5',
    userId: '1',
    title: 'Event Update',
    message: 'Venue for Film Festival has been changed. Please check the details.',
    type: 'event',
    read: false,
    createdAt: '2025-03-14T11:30:00Z',
    link: '/events/5',
    entityId: '5'
  },
  {
    id: '6',
    userId: '2',
    title: 'New Rating',
    message: 'Your event Classical Music Night received a new 5-star rating!',
    type: 'rating',
    read: false,
    createdAt: '2025-03-13T16:00:00Z',
    link: '/events/6#ratings',
    entityId: '6'
  },
  {
    id: '7',
    userId: '1',
    title: 'System Notification',
    message: 'Our platform will be undergoing maintenance on March 28th.',
    type: 'system',
    read: true,
    createdAt: '2025-03-12T08:45:00Z'
  }
];

export const notificationService = {
  // Get all notifications for a user
  getUserNotifications: async (userId: string): Promise<Notification[]> => {
    try {
      return await apiService.get<Notification[]>(`/notifications/user/${userId}`);
    } catch (error) {
      console.log(`Falling back to mock notifications for user: ${userId}`);
      await delay(300);
      return mockNotifications.filter(n => n.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  },
  
  // Get unread notification count
  getUnreadCount: async (userId: string): Promise<number> => {
    try {
      const response = await apiService.get<{count: number}>(`/notifications/user/${userId}/unread`);
      return response.count;
    } catch (error) {
      console.log(`Falling back to mock unread count for user: ${userId}`);
      await delay(200);
      return mockNotifications.filter(n => n.userId === userId && !n.read).length;
    }
  },
  
  // Mark a notification as read
  markAsRead: async (notificationId: string): Promise<void> => {
    try {
      await apiService.put<void>(`/notifications/${notificationId}/read`, {});
    } catch (error) {
      console.log(`Mocking mark notification as read: ${notificationId}`);
      await delay(200);
      
      // In a real app, we would update the database
      const notification = mockNotifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
      }
    }
  },
  
  // Mark all notifications as read for a user
  markAllAsRead: async (userId: string): Promise<void> => {
    try {
      await apiService.put<void>(`/notifications/user/${userId}/read-all`, {});
    } catch (error) {
      console.log(`Mocking mark all notifications as read for user: ${userId}`);
      await delay(300);
      
      // In a real app, we would update the database
      mockNotifications.forEach(n => {
        if (n.userId === userId) {
          n.read = true;
        }
      });
    }
  },
  
  // Delete a notification
  deleteNotification: async (notificationId: string): Promise<void> => {
    try {
      await apiService.delete<void>(`/notifications/${notificationId}`);
    } catch (error) {
      console.log(`Mocking delete notification: ${notificationId}`);
      await delay(200);
      
      // In a real app, we would remove from the database
      // Here we're just simulating
    }
  },
  
  // Create a notification (mostly for testing purposes)
  createNotification: async (notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> => {
    try {
      return await apiService.post<Notification>('/notifications', notification);
    } catch (error) {
      console.log('Mocking create notification');
      await delay(300);
      
      // Mock creating a notification
      const newNotification: Notification = {
        ...notification,
        id: `notification-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      
      // In a real app, we would add to the database
      // mockNotifications.push(newNotification);
      
      return newNotification;
    }
  }
};
