import { useState, useEffect } from 'react';
import { Grid, Card, CardContent, CardMedia, Typography, Box, CircularProgress, Button } from '@mui/material';
import { getVenues } from '../services/venueService';
import { Venue } from '../types/models';

const VenuesPage = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const data = await getVenues();
        setVenues(data);
      } catch (err) {
        setError('Failed to load venues');
        console.error('Error fetching venues:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (venues.length === 0) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography variant="h6" sx={{ mb: 2 }}>No venues available at the moment</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Please check back later for updates on our venue listings.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: { xs: 2, sm: 3, md: 4 } }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 2, mb: 4 }}>
        Venues
      </Typography>
      <Grid container spacing={4}>
        {venues.map((venue) => (
          <Grid item xs={12} sm={6} md={4} key={venue.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={venue.imageUrl || 'https://via.placeholder.com/500x300?text=Venue'}
                alt={venue.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {venue.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {venue.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {venue.address}, {venue.city}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {venue.country}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Capacity: {venue.capacity} people
                  </Typography>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Button size="small" variant="outlined">View Details</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default VenuesPage;
