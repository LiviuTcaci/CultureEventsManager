import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Avatar,
  Grid,
  Divider,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Stack
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Edit as EditIcon,
  Bookmark as BookmarkIcon,
  EventAvailable as EventIcon,
  Star as StarIcon,
  Delete as DeleteIcon,
  ConfirmationNumber as TicketIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { Event, User } from '../types/models';
import { formatShortDate } from '../utils/dateUtils';
import { profileService } from '../services/profileService';
import UserTickets from '../components/Tickets/UserTickets';

// TabPanel component for the profile tabs
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `profile-tab-${index}`,
    'aria-controls': `profile-tabpanel-${index}`,
  };
}

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState(0);
  const [savedEvents, setSavedEvents] = useState<Event[]>([]);
  const [attendedEvents, setAttendedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check if user is authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);
  
  // Fetch user's saved and attended events
  useEffect(() => {
    const fetchUserEvents = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Get saved events using profileService
        const savedEventsData = await profileService.getSavedEvents(user.id);
        setSavedEvents(savedEventsData);
        
        // Get attended events using profileService
        const attendedEventsData = await profileService.getAttendedEvents(user.id);
        setAttendedEvents(attendedEventsData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching user events:', err);
        setError('Failed to load user events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserEvents();
  }, [user]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Remove event from saved events
  const handleRemoveSaved = async (eventId: string) => {
    if (!user) return;
    
    try {
      // Remove from UI immediately for better UX
      setSavedEvents(savedEvents.filter(event => event.id !== eventId));
      
      // Call service to update on the server
      await profileService.removeSavedEvent(user.id, eventId);
    } catch (err) {
      console.error('Error removing saved event:', err);
      // If there's an error, we could fetch the events again to reset the UI
      // But for simplicity, we'll just show the change in the UI
    }
  };
  
  // View event details
  const handleViewEvent = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };
  
  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!user) {
    return (
      <Container maxWidth="md">
        <Alert severity="warning" sx={{ mt: 4 }}>
          Please log in to view your profile.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Paper elevation={2} sx={{ mb: 4, overflow: 'hidden' }}>
          {/* Profile Header */}
          <Box
            sx={{
              py: 4,
              px: 3,
              bgcolor: 'primary.main',
              color: 'white',
              position: 'relative',
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: 'secondary.main',
                    border: '4px solid white',
                  }}
                >
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt={user.fullName} />
                  ) : (
                    <PersonIcon sx={{ fontSize: 60 }} />
                  )}
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography variant="h4" gutterBottom fontWeight="bold">
                  {user.fullName}
                </Typography>
                <Typography variant="subtitle1">@{user.username}</Typography>
                
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                  <Chip
                    label={user.role}
                    color={
                      user.role === 'Admin' ? 'error' :
                      user.role === 'Organizer' ? 'warning' : 'default'
                    }
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                    <EmailIcon fontSize="small" sx={{ mr: 0.5 }} />
                    {user.email}
                  </Typography>
                </Box>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  Edit Profile
                </Button>
              </Grid>
            </Grid>
          </Box>
          
          {/* Profile Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="profile tabs"
              variant="fullWidth"
            >
              <Tab
                icon={<BookmarkIcon />}
                iconPosition="start"
                label="Saved Events"
                {...a11yProps(0)}
              />
              <Tab
                icon={<EventIcon />}
                iconPosition="start"
                label="Attended Events"
                {...a11yProps(1)}
              />
              <Tab
                icon={<TicketIcon />}
                iconPosition="start"
                label="My Tickets"
                {...a11yProps(2)}
              />
            </Tabs>
          </Box>
          
          {/* Saved Events Tab */}
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ px: 3 }}>
              <Typography variant="h6" gutterBottom>
                Your Saved Events
              </Typography>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              ) : savedEvents.length === 0 ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  You haven't saved any events yet. Browse events and save them to see them here.
                </Alert>
              ) : (
                <Grid container spacing={3}>
                  {savedEvents.map(event => (
                    <Grid item xs={12} sm={6} md={4} key={event.id}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardMedia
                          component="img"
                          height="140"
                          image={event.imageUrls && event.imageUrls.length > 0
                            ? event.imageUrls[0]
                            : 'https://via.placeholder.com/300x200?text=No+Image'
                          }
                          alt={event.title}
                        />
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" component="div" gutterBottom>
                            {event.title}
                          </Typography>
                          
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {formatShortDate(event.startDate)}
                          </Typography>
                          
                          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                            <Chip
                              label={event.status}
                              color={
                                event.status === 'Announced' ? 'primary' :
                                event.status === 'Ongoing' ? 'success' :
                                event.status === 'Completed' ? 'secondary' : 'default'
                              }
                              size="small"
                            />
                            {event.averageRating > 0 && (
                              <Chip
                                icon={<StarIcon fontSize="small" />}
                                label={event.averageRating.toFixed(1)}
                                size="small"
                                color="warning"
                              />
                            )}
                          </Stack>
                          
                          <Stack direction="row" spacing={1} justifyContent="space-between">
                            <Button size="small" onClick={() => handleViewEvent(event.id)}>View Details</Button>
                            <IconButton
                              size="small"
                              color="default"
                              onClick={() => handleRemoveSaved(event.id)}
                              aria-label="remove from saved"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </TabPanel>
          
          {/* Attended Events Tab */}
          <TabPanel value={activeTab} index={1}>
            <Box sx={{ px: 3 }}>
              <Typography variant="h6" gutterBottom>
                Events You've Attended
              </Typography>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              ) : attendedEvents.length === 0 ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  You haven't attended any events yet. Your attended events will appear here.
                </Alert>
              ) : (
                <List>
                  {attendedEvents.map(event => (
                    <Paper key={event.id} sx={{ mb: 2, overflow: 'hidden' }}>
                      <ListItem
                        secondaryAction={
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleViewEvent(event.id)}
                          >
                            View Details
                          </Button>
                        }
                        sx={{ py: 2 }}
                      >
                        <ListItemAvatar sx={{ mr: 2 }}>
                          <Avatar
                            variant="rounded"
                            sx={{ width: 80, height: 80 }}
                            src={event.imageUrls && event.imageUrls.length > 0
                              ? event.imageUrls[0]
                              : 'https://via.placeholder.com/80x80?text=Event'
                            }
                          />
                        </ListItemAvatar>
                        
                        <ListItemText
                          primary={
                            <Typography variant="h6" component="div">
                              {event.title}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {formatShortDate(event.startDate)}
                              </Typography>
                              
                              <Stack direction="row" spacing={1}>
                                <Chip
                                  label={event.status}
                                  color={
                                    event.status === 'Announced' ? 'primary' :
                                    event.status === 'Ongoing' ? 'success' :
                                    event.status === 'Completed' ? 'secondary' : 'default'
                                  }
                                  size="small"
                                />
                                {event.averageRating > 0 && (
                                  <Chip
                                    icon={<StarIcon fontSize="small" />}
                                    label={event.averageRating.toFixed(1)}
                                    size="small"
                                    color="warning"
                                  />
                                )}
                              </Stack>
                            </>
                          }
                        />
                      </ListItem>
                    </Paper>
                  ))}
                </List>
              )}
            </Box>
          </TabPanel>
          
          {/* My Tickets Tab */}
          <TabPanel value={activeTab} index={2}>
            <Box sx={{ px: 3 }}>
              <Typography variant="h6" gutterBottom>
                Your Tickets
              </Typography>
              <UserTickets 
                onTicketCanceled={() => {
                  // Refresh attended events when a ticket is canceled
                  if (user) {
                    profileService.getAttendedEvents(user.id)
                      .then(events => setAttendedEvents(events))
                      .catch(err => console.error('Error refreshing attended events:', err));
                  }
                }}
              />
            </Box>
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default ProfilePage;
