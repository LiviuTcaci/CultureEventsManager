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
  Rating as MuiRating,
  Snackbar
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GroupIcon from '@mui/icons-material/Group';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { Event, Venue } from '../types/models';
import { eventService } from '../services/eventService';
import { formatDate, getRelativeTime } from '../utils/dateUtils';
import { mockVenues } from '../services/mockData';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/profileService';
import RatingsSection from '../components/Ratings/RatingsSection';
import CommentsSection from '../components/Ratings/CommentsSection';

const EventDetailsPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  // Fetch event details
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
  
  // Check if event is saved in user's profile
  useEffect(() => {
    const checkIfSaved = () => {
      if (isAuthenticated && user && eventId) {
        const isEventSaved = user.savedEventIds.includes(eventId);
        setIsSaved(isEventSaved);
      }
    };
    
    checkIfSaved();
  }, [isAuthenticated, user, eventId]);

  const handleBackToEvents = () => {
    navigate('/events');
  };
  
  // Toggle save/unsave event
  const handleToggleSaveEvent = async () => {
    if (!isAuthenticated || !user || !eventId) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }
    
    try {
      if (isSaved) {
        // Remove from saved events
        await profileService.removeSavedEvent(user.id, eventId);
        setIsSaved(false);
        setSnackbarMessage('Event removed from saved events');
      } else {
        // Add to saved events
        await profileService.addSavedEvent(user.id, eventId);
        setIsSaved(true);
        setSnackbarMessage('Event saved to your profile');
      }
      
      // Show notification
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error toggling save event:', err);
      setSnackbarMessage('Failed to update saved events');
      setSnackbarOpen(true);
    }
  };
  
  // Handle closing the snackbar
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
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
      {/* Notification Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
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
                <MuiRating 
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
              
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  size="large"
                  disabled={event.status === 'Completed'}
                  onClick={() => navigate(`/events/${eventId}/tickets`)}
                >
                  Get Tickets
                </Button>
                
                {isAuthenticated && (
                  <Button
                    variant={isSaved ? "outlined" : "text"}
                    color="primary"
                    fullWidth
                    startIcon={isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                    onClick={handleToggleSaveEvent}
                  >
                    {isSaved ? 'Saved to Profile' : 'Save Event'}
                  </Button>
                )}
              </Stack>
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
        
        {/* Ratings & Comments Sections */}
        <Box sx={{ mt: 4 }}>
          {/* Ratings Section */}
          <RatingsSection 
            eventId={event.id}
            totalRatings={event.ratingCount}
            averageRating={event.averageRating}
            onRatingSubmitted={() => {
              // Refresh event data when a rating is submitted
              eventService.getEventById(event.id).then(updatedEvent => {
                setEvent(updatedEvent);
              });
            }}
          />
          
          {/* Comments Section */}
          <CommentsSection eventId={event.id} />
        </Box>
      </Box>
    </Container>
  );
};

export default EventDetailsPage;
