import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Stack,
  Rating
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GroupIcon from '@mui/icons-material/Group';
import { Event, Venue } from '../types/models';
import { eventService } from '../services/eventService';
import { formatDate, getRelativeTime } from '../utils/dateUtils';
import { mockVenues } from '../services/mockData';

const EventDetailsPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) {
        setError('Event ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const eventData = await eventService.getEventById(eventId);
        setEvent(eventData);
        
        // Get venue details - in a real app we would fetch this from an API
        // For now, use mock data
        const venueData = mockVenues.find(v => v.id === eventData.venueId) || null;
        setVenue(venueData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to load event details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const handleBackToEvents = () => {
    navigate('/events');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !event) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Event not found'}
        </Alert>
        <Button variant="outlined" onClick={handleBackToEvents}>
          Back to Events
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Navigation */}
        <Box sx={{ mb: 4 }}>
          <Button variant="outlined" onClick={handleBackToEvents}>
            ← Back to Events
          </Button>
        </Box>

        {/* Event Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            {event.title}
          </Typography>
          
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Chip 
              label={event.status} 
              color={
                event.status === 'Announced' ? 'primary' : 
                event.status === 'Ongoing' ? 'success' : 
                event.status === 'Completed' ? 'secondary' : 'default'
              }
            />
            {event.averageRating > 0 && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Rating 
                  value={event.averageRating} 
                  precision={0.5} 
                  readOnly 
                  size="small" 
                />
                <Typography variant="body2" color="text.secondary">
                  ({event.ratingCount})
                </Typography>
              </Stack>
            )}
          </Stack>
        </Box>

        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {/* Event Image */}
            <Box sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
              <img 
                src={event.imageUrls[0] || 'https://via.placeholder.com/800x400?text=No+Image'} 
                alt={event.title}
                style={{ 
                  width: '100%', 
                  height: 'auto',
                  maxHeight: '400px',
                  objectFit: 'cover'
                }}
              />
            </Box>

            {/* Event Description */}
            <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h5" gutterBottom>
                About This Event
              </Typography>
              <Typography variant="body1" paragraph>
                {event.description}
              </Typography>
            </Paper>

            {/* Event Performers (if any) */}
            {event.performerDetails && event.performerDetails.length > 0 && (
              <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h5" gutterBottom>
                  Performers
                </Typography>
                <Grid container spacing={2}>
                  {event.performerDetails.map((performer, index) => (
                    <Grid item xs={12} sm={6} key={performer.performerId}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6">
                            {performer.role}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {performer.durationMinutes} minutes
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            )}
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Event Details */}
            <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h5" gutterBottom>
                Event Details
              </Typography>
              
              <Box sx={{ py: 2 }}>
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  <CalendarTodayIcon color="action" />
                  <Box>
                    <Typography variant="subtitle2">
                      Date and Time
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(event.startDate)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {getRelativeTime(event.startDate)}
                    </Typography>
                  </Box>
                </Stack>
                
                {venue && (
                  <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <LocationOnIcon color="action" />
                    <Box>
                      <Typography variant="subtitle2">
                        Location
                      </Typography>
                      <Typography variant="body2">
                        {venue.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {venue.address}, {venue.city}
                      </Typography>
                    </Box>
                  </Stack>
                )}
                
                <Stack direction="row" spacing={2}>
                  <GroupIcon color="action" />
                  <Box>
                    <Typography variant="subtitle2">
                      Capacity
                    </Typography>
                    <Typography variant="body2">
                      {event.ticketsSold} / {event.capacity} attendees
                    </Typography>
                  </Box>
                </Stack>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Button 
                variant="contained" 
                fullWidth 
                size="large"
                sx={{ mt: 2 }}
                disabled={event.status === 'Completed'}
              >
                Get Tickets
              </Button>
            </Paper>
            
            {/* Venue Info */}
            {venue && (
              <Paper elevation={1} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Venue Information
                </Typography>
                
                {venue.imageUrl && (
                  <Box sx={{ mb: 2, borderRadius: 1, overflow: 'hidden' }}>
                    <img 
                      src={venue.imageUrl} 
                      alt={venue.name}
                      style={{ width: '100%', height: 'auto' }}
                    />
                  </Box>
                )}
                
                <Typography variant="body2" paragraph>
                  {venue.description}
                </Typography>
                
                <Typography variant="subtitle2" gutterBottom>
                  Facilities
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {venue.facilities.map((facility, index) => (
                    <Chip 
                      key={index} 
                      label={facility} 
                      size="small" 
                      variant="outlined"
                    />
                  ))}
                </Box>
                
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={() => navigate(`/venues/${venue.id}`)}
                >
                  View Venue Details
                </Button>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default EventDetailsPage;
