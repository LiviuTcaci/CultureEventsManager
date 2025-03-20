import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  InputAdornment, 
  IconButton, 
  Divider, 
  Paper,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EventList from '../components/Events/EventList';
import { mockCategories, mockVenues } from '../services/mockData';
import { Category, Venue } from '../types/models';

const EventsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [submittedQuery, setSubmittedQuery] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [uniqueCities, setUniqueCities] = useState<string[]>([]);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // Combined filters state
  const [filters, setFilters] = useState<{
    categoryId?: string;
    city?: string;
    startDate?: string;
    endDate?: string;
  }>({});

  useEffect(() => {
    // Load categories and venues
    setCategories(mockCategories);
    setVenues(mockVenues);
    
    // Extract unique cities from venues
    const cities = [...new Set(mockVenues.map(venue => venue.city))];
    setUniqueCities(cities);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedQuery(searchQuery);
  };
  
  const handleFilterApply = () => {
    const newFilters: {
      categoryId?: string;
      city?: string;
      startDate?: string;
      endDate?: string;
    } = {};
    
    if (selectedCategory) newFilters.categoryId = selectedCategory;
    if (selectedCity) newFilters.city = selectedCity;
    if (startDate) newFilters.startDate = startDate;
    if (endDate) newFilters.endDate = endDate;
    
    setFilters(newFilters);
  };
  
  const handleClearFilters = () => {
    setSelectedCategory('');
    setSelectedCity('');
    setStartDate('');
    setEndDate('');
    setFilters({});
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
        
        {/* Advanced Filters Section */}
        <Accordion sx={{ my: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="advanced-filters-content"
            id="advanced-filters-header"
          >
            <Typography sx={{ display: 'flex', alignItems: 'center' }}>
              <FilterListIcon sx={{ mr: 1 }} /> Advanced Filters
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="category-select-label">Category</InputLabel>
                  <Select
                    labelId="category-select-label"
                    id="category-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as string)}
                    label="Category"
                  >
                    <MenuItem value="">
                      <em>All Categories</em>
                    </MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="location-select-label">Location</InputLabel>
                  <Select
                    labelId="location-select-label"
                    id="location-select"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value as string)}
                    label="Location"
                  >
                    <MenuItem value="">
                      <em>All Locations</em>
                    </MenuItem>
                    {uniqueCities.map((city) => (
                      <MenuItem key={city} value={city}>
                        {city}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  id="start-date"
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  id="end-date"
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  inputProps={{
                    min: startDate // Prevent selecting end date before start date
                  }}
                  disabled={!startDate} // Disable end date selection until start date is selected
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleFilterApply}
              >
                Apply Filters
              </Button>
            </Box>
          </AccordionDetails>
        </Accordion>

        <Divider sx={{ my: 3 }} />

        {/* Applied Filters Summary */}
        {(Object.keys(filters).length > 0 || submittedQuery) && (
          <Box sx={{ mb: 3 }}>
            {submittedQuery && (
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Search results for: <strong>{submittedQuery}</strong>
              </Typography>
            )}
            
            {Object.keys(filters).length > 0 && (
              <Typography variant="subtitle1">
                Filters applied: {' '}
                {filters.categoryId && <strong>{categories.find(c => c.id === filters.categoryId)?.name}</strong>}
                {filters.city && <strong>{filters.city}</strong>}
                {filters.startDate && <strong> from {new Date(filters.startDate).toLocaleDateString()}</strong>}
                {filters.endDate && <strong> to {new Date(filters.endDate).toLocaleDateString()}</strong>}
              </Typography>
            )}
          </Box>
        )}

        <EventList 
          searchQuery={submittedQuery}
          categoryId={filters.categoryId}
          location={filters.city}
          startDate={filters.startDate}
          endDate={filters.endDate}
        />
      </Box>
    </Container>
  );
};

export default EventsPage;
