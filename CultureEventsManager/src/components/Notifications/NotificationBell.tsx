import React, { useState } from 'react';
import {
  Badge,
  IconButton,
  Popover,
  Box,
  Typography,
  Button,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  DoneAll as DoneAllIcon
} from '@mui/icons-material';
import { useNotifications } from '../../context/NotificationContext';
import NotificationList from './NotificationList';

interface NotificationBellProps {
  color?: 'inherit' | 'primary' | 'secondary' | 'default';
}

const NotificationBell: React.FC<NotificationBellProps> = ({ color = 'inherit' }) => {
  const { unreadCount, markAllAsRead } = useNotifications();
  
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  
  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };
  
  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;
  
  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          aria-describedby={id}
          onClick={handleOpen}
          color={color}
          size="large"
        >
          <Badge 
            badgeContent={unreadCount} 
            color="error"
            overlap="circular"
            max={99}
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          elevation: 4,
          sx: { 
            width: { xs: '100%', sm: 400 },
            maxWidth: { xs: '100%', sm: 400 },
            maxHeight: 500,
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          position: 'sticky',
          top: 0,
          zIndex: 1
        }}>
          <Typography variant="h6">
            Notifications
          </Typography>
          
          {unreadCount > 0 && (
            <Tooltip title="Mark all as read">
              <Button
                startIcon={<DoneAllIcon />}
                onClick={handleMarkAllAsRead}
                size="small"
              >
                Mark all read
              </Button>
            </Tooltip>
          )}
        </Box>
        
        <NotificationList onNotificationClick={handleClose} />
      </Popover>
    </>
  );
};

export default NotificationBell;
