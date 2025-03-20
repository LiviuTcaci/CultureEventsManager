import React from 'react';
import { Card, CardContent, CardMedia, Typography, Button, CardActions, Chip, Box, Stack } from '@mui/material';
import { Event } from '../../types/models';
import { formatDate } from '../../utils/dateUtils';

interface EventCardProps {
  event: Event;
  onViewDetails: (eventId: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onViewDetails }) => {
  // Defensive check for event object
  if (!event) {
    return (
      <Card sx={{ maxWidth: 50, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h5" component="div">  
            Error: Event data missing
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Default image if none provided
  const imageUrl = event.imageUrls && Array.isArray(event.imageUrls) && event.imageUrls.length > 0
    ? event.imageUrls[0]
    : 'https://via.placeholder.com/300x200?text=No+Image';

  return (
    <Card sx={{ maxWidth: 345, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="140"
        image={imageUrl}
        alt={event.title}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="div">
          {event.title}
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {event.startDate ? formatDate(event.startDate) : 'Date not specified'}
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {event.description ? 
            (event.description.length > 120 
              ? `${event.description.substring(0, 120)}...` 
              : event.description)
            : 'No description available'}
        </Typography>
        
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          {event.status && (
            <Chip 
              label={event.status} 
              color={
                event.status === 'Announced' ? 'primary' : 
                event.status === 'Ongoing' ? 'success' : 
                event.status === 'Completed' ? 'secondary' : 'default'
              }
              size="small"
            />
          )}
          {event.averageRating && event.averageRating > 0 && (
            <Chip 
              label={`${event.averageRating.toFixed(1)}★`} 
              color="warning" 
              size="small"
            />
          )}
        </Stack>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={() => onViewDetails(event.id)}>
          View Details
        </Button>
      </CardActions>
    </Card>
  );
};

export default EventCard;
