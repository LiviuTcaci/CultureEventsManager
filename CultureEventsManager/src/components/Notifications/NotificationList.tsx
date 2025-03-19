import React from 'react';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Avatar,
  Typography,
  Box,
  Divider,
  CircularProgress,
  Tooltip,
  Alert,
  Chip
} from '@mui/material';
import {
  Event as EventIcon,
  LocalActivity as TicketIcon,
  Comment as CommentIcon,
  Star as StarIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  Circle as CircleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { Notification } from '../../services/notificationService';
import { formatDate } from '../../utils/dateUtils';

interface NotificationListProps {
  onNotificationClick?: () => void;
}

const NotificationList: React.FC<NotificationListProps> = ({ onNotificationClick }) => {
  const { 
    notifications, 
    loading, 
    error, 
    markAsRead, 
    deleteNotification 
  } = useNotifications();
  
  const navigate = useNavigate();
  
  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <EventIcon />;
      case 'ticket':
        return <TicketIcon />;
      case 'comment':
        return <CommentIcon />;
      case 'rating':
        return <StarIcon />;
      case 'system':
      default:
        return <InfoIcon />;
    }
  };
  
  // Get avatar color based on notification type
  const getAvatarColor = (type: string) => {
    switch (type) {
      case 'event':
        return '#1976d2'; // blue
      case 'ticket':
        return '#2e7d32'; // green
      case 'comment':
        return '#9c27b0'; // purple
      case 'rating':
        return '#ed6c02'; // orange
      case 'system':
      default:
        return '#757575'; // grey
    }
  };
  
  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Navigate to linked page if available
    if (notification.link) {
      navigate(notification.link);
    }
    
    // Close notification dropdown if callback provided
    if (onNotificationClick) {
      onNotificationClick();
    }
  };
  
  // Handle delete notification
  const handleDelete = async (event: React.MouseEvent, notification: Notification) => {
    event.stopPropagation(); // Prevent triggering the parent click handler
    await deleteNotification(notification.id);
  };
  
  // Loading state
  if (loading && notifications.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }
  
  // Empty state
  if (notifications.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No notifications to display
        </Typography>
      </Box>
    );
  }
  
  return (
    <List sx={{ 
      width: '100%', 
      bgcolor: 'background.paper',
      p: 0,
      flex: '1 1 auto',
      overflow: 'auto'
    }}>
      {notifications.map((notification, index) => (
        <React.Fragment key={notification.id}>
          <ListItem
            alignItems="flex-start"
            sx={{ 
              cursor: 'pointer',
              py: 1.5,
              bgcolor: notification.read ? 'transparent' : 'action.hover'
            }}
            onClick={() => handleNotificationClick(notification)}
            secondaryAction={
              <Tooltip title="Delete">
                <IconButton 
                  edge="end" 
                  aria-label="delete"
                  onClick={(e) => handleDelete(e, notification)}
                  size="small"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            }
          >
            <ListItemAvatar>
              <Avatar 
                sx={{ 
                  bgcolor: getAvatarColor(notification.type),
                  position: 'relative'
                }}
              >
                {getNotificationIcon(notification.type)}
                {!notification.read && (
                  <CircleIcon 
                    sx={{ 
                      position: 'absolute', 
                      top: -2, 
                      right: -2, 
                      fontSize: 12, 
                      color: 'error.main' 
                    }} 
                  />
                )}
              </Avatar>
            </ListItemAvatar>
            
            <ListItemText
              primary={
                <Box sx={{ pr: 4 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}
                  >
                    {notification.title}
                  </Typography>
                </Box>
              }
              secondary={
                <>
                  <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{ 
                      display: 'block', 
                      mt: 0.5, 
                      mb: 1,
                      fontSize: '0.875rem',
                      pr: 2
                    }}
                  >
                    {notification.message}
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {formatDate(notification.createdAt)}
                    </Typography>
                    
                    <Chip 
                      label={notification.type} 
                      size="small"
                      sx={{ 
                        height: 20, 
                        fontSize: '0.7rem',
                        bgcolor: getAvatarColor(notification.type),
                        color: 'white'
                      }}
                    />
                  </Box>
                </>
              }
            />
          </ListItem>
          
          {index < notifications.length - 1 && (
            <Divider variant="inset" component="li" />
          )}
        </React.Fragment>
      ))}
    </List>
  );
};

export default NotificationList;
