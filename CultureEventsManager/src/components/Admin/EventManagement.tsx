import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  FormHelperText,
  Tooltip,
  SelectChangeEvent
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { mockEvents, mockCategories, mockVenues } from '../../services/mockData';
import { Event, Category, Venue } from '../../types/models';
import { formatDate, formatShortDate } from '../../utils/dateUtils';

// Event management component for the admin panel
const EventManagement: React.FC = () => {
  const navigate = useNavigate();
  
  // State for events
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for modal
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  // State for form inputs
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    venueId: '',
    startDate: '',
    endDate: '',
    status: 'Announced',
    capacity: 0,
  });
  
  // State for form validation
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  
  // State for search and filter
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  
  // Fetch events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        // In a real app, we'd fetch from the API
        // For now, use mock data
        setEvents(mockEvents);
        setError(null);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);
  
  // Filter events based on search term and filters
  const filteredEvents = events.filter(event => {
    // Search term filter
    const matchesSearchTerm = searchTerm === '' || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = filterCategory === '' || event.categoryId === filterCategory;
    
    // Status filter
    const matchesStatus = filterStatus === '' || event.status === filterStatus;
    
    return matchesSearchTerm && matchesCategory && matchesStatus;
  });
  
  // Handle add new event
  const handleAddEvent = () => {
    setModalMode('create');
    setSelectedEvent(null);
    setFormData({
      title: '',
      description: '',
      categoryId: '',
      venueId: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 3600000).toISOString().split('T')[0],
      status: 'Announced',
      capacity: 100,
    });
    setFormErrors({});
    setOpenModal(true);
  };
  
  // Handle edit event
  const handleEditEvent = (event: Event) => {
    setModalMode('edit');
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      categoryId: event.categoryId,
      venueId: event.venueId,
      startDate: event.startDate.split('T')[0],
      endDate: event.endDate.split('T')[0],
      status: event.status,
      capacity: event.capacity,
    });
    setFormErrors({});
    setOpenModal(true);
  };
  
  // Handle view event details
  const handleViewEvent = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };
  
  // Handle delete event
  const handleDeleteClick = (event: Event) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };
  
  // Confirm delete event
  const handleConfirmDelete = () => {
    if (eventToDelete) {
      // In a real app, we'd call the API to delete the event
      setEvents(events.filter(e => e.id !== eventToDelete.id));
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };
  
  // Cancel delete
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setEventToDelete(null);
  };
  
  // Handle dialog close
  const handleCloseModal = () => {
    setOpenModal(false);
  };
  
  // Handle form input change for text fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({
        ...formData,
        [name]: value,
      });
      
      // Clear error for this field
      if (formErrors[name]) {
        setFormErrors({
          ...formErrors,
          [name]: '',
        });
      }
    }
  };
  
  // Handle form input change for select fields
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({
        ...formData,
        [name]: value,
      });
      
      // Clear error for this field
      if (formErrors[name]) {
        setFormErrors({
          ...formErrors,
          [name]: '',
        });
      }
    }
  };
  
  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!formData.categoryId) {
      errors.categoryId = 'Category is required';
    }
    
    if (!formData.venueId) {
      errors.venueId = 'Venue is required';
    }
    
    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    }
    
    if (!formData.endDate) {
      errors.endDate = 'End date is required';
    } else if (formData.startDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      errors.endDate = 'End date must be after start date';
    }
    
    if (formData.capacity <= 0) {
      errors.capacity = 'Capacity must be greater than 0';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submit
  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    
    if (modalMode === 'create') {
      // In a real app, we'd call the API to create the event
      const newEvent: Event = {
        id: `event-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        organizerId: 'current-user-id', // In a real app, this would be the current user's ID
        categoryId: formData.categoryId,
        venueId: formData.venueId,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        imageUrls: [],
        status: formData.status as 'Announced' | 'Ongoing' | 'Completed' | 'Canceled',
        capacity: formData.capacity,
        ticketsSold: 0,
        averageRating: 0,
        ratingCount: 0,
        performerIds: [],
        performerDetails: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: false,
      };
      
      setEvents([...events, newEvent]);
    } else {
      // In a real app, we'd call the API to update the event
      if (selectedEvent) {
        const updatedEvent: Event = {
          ...selectedEvent,
          title: formData.title,
          description: formData.description,
          categoryId: formData.categoryId,
          venueId: formData.venueId,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          status: formData.status as 'Announced' | 'Ongoing' | 'Completed' | 'Canceled',
          capacity: formData.capacity,
          updatedAt: new Date().toISOString(),
        };
        
        setEvents(events.map(e => e.id === updatedEvent.id ? updatedEvent : e));
      }
    }
    
    setOpenModal(false);
  };
  
  // Get category name by ID
  const getCategoryName = (categoryId: string): string => {
    const category = mockCategories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };
  
  // Get venue name by ID
  const getVenueName = (venueId: string): string => {
    const venue = mockVenues.find(v => v.id === venueId);
    return venue ? venue.name : 'Unknown Venue';
  };

  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Event Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddEvent}
        >
          Add New Event
        </Button>
      </Box>
      
      {/* Search and Filter */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Search Events"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                endAdornment: <SearchIcon color="action" />
              }}
              placeholder="Search by title or description"
              size="small"
            />
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                labelId="category-filter-label"
                value={filterCategory}
                onChange={(e: SelectChangeEvent) => setFilterCategory(e.target.value)}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                {mockCategories.map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={filterStatus}
                onChange={(e: SelectChangeEvent) => setFilterStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="Announced">Announced</MenuItem>
                <MenuItem value="Ongoing">Ongoing</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Canceled">Canceled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => {
                setSearchTerm('');
                setFilterCategory('');
                setFilterStatus('');
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Events Table */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="events table">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Venue</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEvents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No events found
                </TableCell>
              </TableRow>
            ) : (
              filteredEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>{event.title}</TableCell>
                  <TableCell>{getCategoryName(event.categoryId)}</TableCell>
                  <TableCell>{getVenueName(event.venueId)}</TableCell>
                  <TableCell>{formatShortDate(event.startDate)}</TableCell>
                  <TableCell>
                    <Chip
                      label={event.status}
                      color={
                        event.status === 'Announced' ? 'primary' :
                        event.status === 'Ongoing' ? 'success' :
                        event.status === 'Completed' ? 'secondary' :
                        'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View">
                      <IconButton
                        size="small"
                        onClick={() => handleViewEvent(event.id)}
                        color="info"
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleEditEvent(event)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(event)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Create/Edit Event Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth>
        <DialogTitle>
          {modalMode === 'create' ? 'Create New Event' : 'Edit Event'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                error={!!formErrors.title}
                helperText={formErrors.title}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={4}
                error={!!formErrors.description}
                helperText={formErrors.description}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.categoryId} required>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleSelectChange}
                  label="Category"
                >
                  {mockCategories.map(category => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.categoryId && (
                  <FormHelperText>{formErrors.categoryId}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.venueId} required>
                <InputLabel id="venue-label">Venue</InputLabel>
                <Select
                  labelId="venue-label"
                  name="venueId"
                  value={formData.venueId}
                  onChange={handleSelectChange}
                  label="Venue"
                >
                  {mockVenues.map(venue => (
                    <MenuItem key={venue.id} value={venue.id}>
                      {venue.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.venueId && (
                  <FormHelperText>{formErrors.venueId}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                error={!!formErrors.startDate}
                helperText={formErrors.startDate}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                error={!!formErrors.endDate}
                helperText={formErrors.endDate}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  value={formData.status}
                  onChange={handleSelectChange}
                  label="Status"
                >
                  <MenuItem value="Announced">Announced</MenuItem>
                  <MenuItem value="Ongoing">Ongoing</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Canceled">Canceled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Capacity"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleInputChange}
                error={!!formErrors.capacity}
                helperText={formErrors.capacity}
                required
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {modalMode === 'create' ? 'Create' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the event "{eventToDelete?.title}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventManagement;
