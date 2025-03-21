import React, { useState, useEffect } from 'react';
import { Grid, Typography, Box, CircularProgress, Alert, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EventCard from './EventCard';
import { Event } from '../../types/models';
import { eventService } from '../../services/eventService';
import { mockVenues } from '../../services/mockData';

interface EventListProps {
  categoryId?: string;
  searchQuery?: string;
  limit?: number;
  location?: string;
  startDate?: string;
  endDate?: string;
}

const EventList: React.FC<EventListProps> = ({ 
  categoryId, 
  searchQuery, 
  limit,
  location,
  startDate,
  endDate 
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        let fetchedEvents: Event[];
        
        // If we have advanced filter criteria
        if (categoryId || location || startDate || endDate) {
          // Prepare filter object
          const filters: {
            categoryId?: string;
            venueId?: string;
            startDate?: string;
            endDate?: string;
            status?: string;
          } = {};
          
          if (categoryId) filters.categoryId = categoryId;
          if (startDate) filters.startDate = startDate;
          if (endDate) filters.endDate = endDate;
          
          fetchedEvents = await eventService.filterEvents(filters);
          
          // If we have a location filter, we need to filter the results locally
          // since the API doesn't directly support filtering by city
          if (location) {
            fetchedEvents = fetchedEvents.filter(event => {
              // Find the venue by ID to check its city
              const venue = mockVenues.find(v => v.id === event.venueId);
              return venue?.city === location;
            });
          }
        }
        // If we have a search query
        else if (searchQuery && searchQuery.trim() !== '') {
          fetchedEvents = await eventService.searchEvents(searchQuery);
        } 
        // Default: fetch all events
        else {
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
  }, [categoryId, searchQuery, limit, location, startDate, endDate]);

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
    <Box sx={{ width: '100%', px: 2 }}>
      <Grid container spacing={3} justifyContent="center">
        {events.map((event) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={event.id}>
            <EventCard event={event} onViewDetails={handleViewDetails} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default EventList;
