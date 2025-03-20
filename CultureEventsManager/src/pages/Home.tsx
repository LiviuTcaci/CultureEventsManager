import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleStartOrganizing = () => {
    if (isAuthenticated) {
      if (user?.role === 'Organizer' || user?.role === 'Admin') {
        if (user?.role === 'Admin') {
          navigate('/admin');
        } else {
          // Pentru moment, arătăm un mesaj că funcționalitatea de creare a evenimentelor este în dezvoltare
          alert('Funcționalitatea de creare a evenimentelor va fi disponibilă în curând!');
        }
      } else {
        // Pentru utilizatori obișnuiți, afișăm un mesaj sau redirecționăm către o pagină de informații
        alert('Pentru a crea evenimente, trebuie să aveți cont de organizator. Contactați administratorul pentru mai multe detalii.');
      }
    } else {
      navigate('/register');
    }
  };
  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 3,
          mb: 6,
          borderRadius: 1,
          minHeight: '25vh',
          maxWidth: '80%',
          mx: 'auto',
          mt: 4
        }}
      >
        <Container maxWidth="md">
          <Typography
            component="h1"
            variant="h3"
            align="center"
            gutterBottom
          >
            Cultural Events Platform
          </Typography>
          <Typography
            variant="h5"
            align="center"
            paragraph
          >
            Discover and participate in the most exciting cultural events in your area.
            From concerts and exhibitions to festivals and performances.
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              color="secondary"
              component={RouterLink}
              to="/events"
              size="large"
            >
              Browse Events
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              component={RouterLink}
              to="/register"
              size="large"
            >
              Join Now
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  Find Events
                </Typography>
                <Typography>
                  Browse through a wide variety of cultural events happening in your city.
                  Filter by category, date, or location to find exactly what you're looking for.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" component={RouterLink} to="/events">
                  Browse Events
                </Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  Organize Events
                </Typography>
                <Typography>
                  Are you an event organizer? Create and manage your events easily.
                  Reach a wider audience and handle ticket sales efficiently.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={handleStartOrganizing}>
                  Start Organizing
                </Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  Discover Venues
                </Typography>
                <Typography>
                  Explore amazing venues perfect for cultural events.
                  From intimate galleries to grand concert halls.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" component={RouterLink} to="/venues">
                  View Venues
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;
