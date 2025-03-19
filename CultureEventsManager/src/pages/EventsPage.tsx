import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  InputAdornment, 
  IconButton, 
  Divider, 
  Paper 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EventList from '../components/Events/EventList';

const EventsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [submittedQuery, setSubmittedQuery] = useState<string>('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedQuery(searchQuery);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Discover Cultural Events
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Explore upcoming concerts, exhibitions, theater performances, and more.
        </Typography>

        <Paper component="form" onSubmit={handleSearch} sx={{ p: 1, my: 3, display: 'flex', alignItems: 'center' }}>
          <TextField
            fullWidth
            placeholder="Search events..."
            variant="standard"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              disableUnderline: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton type="submit" aria-label="search">
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Paper>

        <Divider sx={{ my: 3 }} />

        {submittedQuery && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1">
              Search results for: <strong>{submittedQuery}</strong>
            </Typography>
          </Box>
        )}

        <EventList searchQuery={submittedQuery} />
      </Box>
    </Container>
  );
};

export default EventsPage;
