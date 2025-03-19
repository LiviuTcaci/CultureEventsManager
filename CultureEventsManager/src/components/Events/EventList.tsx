import React, { useState, useEffect } from 'react';
import { Grid, Typography, Box, CircularProgress, Alert, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EventCard from './EventCard';
import { Event } from '../../types/models';
import { eventService } from '../../services/eventService';

interface EventListProps {
  categoryId?: string;
  searchQuery?: string;
  limit?: number;
}

const EventList: React.FC<EventListProps> = ({ categoryId, searchQuery, limit }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        let fetchedEvents: Event[];
        
        if (searchQuery && searchQuery.trim() !== '') {
          fetchedEvents = await eventService.searchEvents(searchQuery);
        } else if (categoryId) {
          fetchedEvents = await eventService.getEventsByCategory(categoryId);
        } else {
          fetchedEvents = await eventService.getAllEvents();
        }
        
        // Apply limit if specified
        const limitedEvents = limit ? fetchedEvents.slice(0, limit) : fetchedEvents;
        
        setEvents(limitedEvents);
        setError(null);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [categoryId, searchQuery, limit]);

  const handleViewDetails = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (events.length === 0) {
    return (
      <Box sx={{ padding: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No events found
        </Typography>
      </Box>
    );
  }

  return (
    <Container>
      <Grid container spacing={3}>
        {events.map((event) => (
          <Grid item xs={12} sm={6} md={4} key={event.id}>
            <EventCard event={event} onViewDetails={handleViewDetails} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default EventList;
