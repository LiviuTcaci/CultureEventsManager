import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { notificationService, Notification } from '../services/notificationService';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
}

const defaultContext: NotificationContextType = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  fetchNotifications: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  deleteNotification: async () => {}
};

const NotificationContext = createContext<NotificationContextType>(defaultContext);

export const useNotifications = () => useContext(NotificationContext);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  
  // Fetch notifications when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();
      
      // Set up polling for notifications every 30 seconds
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user]);
  
  // Fetch all notifications for current user
  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const userNotifications = await notificationService.getUserNotifications(user.id);
      setNotifications(userNotifications);
      
      // Update unread count
      setUnreadCount(userNotifications.filter(n => !n.read).length);
      
      // Update last fetched time
      setLastFetched(new Date());
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch only unread count (more efficient for polling)
  const fetchUnreadCount = async () => {
    if (!user) return;
    
    try {
      const count = await notificationService.getUnreadCount(user.id);
      setUnreadCount(count);
      
      // If new notifications have arrived, fetch all notifications
      if (count > unreadCount) {
        fetchNotifications();
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };
  
  // Mark a notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Failed to update notification');
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      await notificationService.markAllAsRead(user.id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError('Failed to update notifications');
    }
  };
  
  // Delete a notification
  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      
      // Update local state
      const updatedNotifications = notifications.filter(n => n.id !== notificationId);
      setNotifications(updatedNotifications);
      
      // Update unread count if needed
      const wasUnread = notifications.find(n => n.id === notificationId && !n.read);
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError('Failed to delete notification');
    }
  };
  
  // Create a test notification (for development purposes)
  const createTestNotification = async () => {
    if (!user) return;
    
    try {
      const newNotification = await notificationService.createNotification({
        userId: user.id,
        title: 'Test Notification',
        message: 'This is a test notification created at ' + new Date().toLocaleTimeString(),
        type: 'system',
        read: false
      });
      
      // Update local state
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    } catch (err) {
      console.error('Error creating test notification:', err);
    }
  };
  
  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
