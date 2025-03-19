import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Rating as MuiRating,
  Button,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { ratingService } from '../../services/ratingService';
import { Rating } from '../../types/models';
import { formatDate } from '../../utils/dateUtils';

interface RatingsSectionProps {
  eventId: string;
  totalRatings: number;
  averageRating: number;
  onRatingSubmitted?: () => void;
}

const RatingsSection: React.FC<RatingsSectionProps> = ({
  eventId,
  totalRatings,
  averageRating,
  onRatingSubmitted
}) => {
  const { user, isAuthenticated } = useAuth();
  
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // User rating state
  const [userRating, setUserRating] = useState<Rating | null>(null);
  const [ratingValue, setRatingValue] = useState<number | null>(0);
  const [ratingComment, setRatingComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ratingToDelete, setRatingToDelete] = useState<Rating | null>(null);

  // Fetch ratings
  useEffect(() => {
    const fetchRatings = async () => {
      try {
        setLoading(true);
        const ratingsData = await ratingService.getEventRatings(eventId);
        setRatings(ratingsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching ratings:', err);
        setError('Failed to load ratings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRatings();
  }, [eventId]);
  
  // Check if user has already rated this event
  useEffect(() => {
    const checkUserRating = async () => {
      if (!isAuthenticated || !user) return;
      
      try {
        const userRatingData = await ratingService.getUserRating(user.id, eventId);
        setUserRating(userRatingData);
        
        if (userRatingData) {
          setRatingValue(userRatingData.value);
          setRatingComment(userRatingData.comment || '');
        }
      } catch (err) {
        console.error('Error checking user rating:', err);
      }
    };
    
    checkUserRating();
  }, [eventId, isAuthenticated, user]);
  
  // Handle rating submission
  const handleSubmitRating = async () => {
    if (!isAuthenticated || !user || ratingValue === null) return;
    
    try {
      setIsSubmitting(true);
      
      await ratingService.submitRating({
        userId: user.id,
        eventId,
        value: ratingValue,
        comment: ratingComment
      });
      
      // Refresh ratings
      const ratingsData = await ratingService.getEventRatings(eventId);
      setRatings(ratingsData);
      
      // Update user rating
      const userRatingData = await ratingService.getUserRating(user.id, eventId);
      setUserRating(userRatingData);
      
      // Reset form
      setShowRatingForm(false);
      setEditMode(false);
      
      // Notify parent
      if (onRatingSubmitted) {
        onRatingSubmitted();
      }
    } catch (err) {
      console.error('Error submitting rating:', err);
      setError('Failed to submit rating. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle edit rating
  const handleEditRating = () => {
    if (userRating) {
      setRatingValue(userRating.value);
      setRatingComment(userRating.comment || '');
      setEditMode(true);
      setShowRatingForm(true);
    }
  };
  
  // Handle delete rating
  const handleDeleteClick = (rating: Rating) => {
    setRatingToDelete(rating);
    setDeleteDialogOpen(true);
  };
  
  // Confirm delete rating
  const handleConfirmDelete = async () => {
    if (!ratingToDelete) return;
    
    try {
      await ratingService.deleteRating(ratingToDelete.id);
      
      // Remove from local state
      setRatings(ratings.filter(r => r.id !== ratingToDelete.id));
      
      // Reset user rating if it was the current user's rating
      if (user && ratingToDelete.userId === user.id) {
        setUserRating(null);
        setRatingValue(0);
        setRatingComment('');
      }
      
      setDeleteDialogOpen(false);
      setRatingToDelete(null);
      
      // Notify parent
      if (onRatingSubmitted) {
        onRatingSubmitted();
      }
    } catch (err) {
      console.error('Error deleting rating:', err);
      setError('Failed to delete rating. Please try again later.');
    }
  };
  
  // Cancel delete
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setRatingToDelete(null);
  };
  
  return (
    <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Ratings & Reviews
      </Typography>
      
      {/* Summary */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ mr: 2 }}>
          <Typography variant="h2" color="primary" fontWeight="bold">
            {averageRating.toFixed(1)}
          </Typography>
          <MuiRating
            value={averageRating}
            precision={0.5}
            readOnly
            size="medium"
          />
          <Typography variant="body2" color="text.secondary">
            {totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'}
          </Typography>
        </Box>
        
        <Box sx={{ flex: 1 }} />
        
        {isAuthenticated && (
          <Box>
            {userRating ? (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<EditIcon />}
                onClick={handleEditRating}
              >
                Edit Your Rating
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowRatingForm(true)}
              >
                Write a Review
              </Button>
            )}
          </Box>
        )}
      </Box>
      
      <Divider sx={{ my: 3 }} />
      
      {/* Rating form */}
      {showRatingForm && isAuthenticated && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            {editMode ? 'Edit Your Review' : 'Write a Review'}
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography component="legend" gutterBottom>
              Your Rating
            </Typography>
            <MuiRating
              name="user-rating"
              value={ratingValue}
              precision={0.5}
              onChange={(_, newValue) => {
                setRatingValue(newValue);
              }}
              size="large"
            />
          </Box>
          
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your Review (Optional)"
            value={ratingComment}
            onChange={(e) => setRatingComment(e.target.value)}
            placeholder="Share your experience with this event..."
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => {
                setShowRatingForm(false);
                setEditMode(false);
                if (userRating) {
                  setRatingValue(userRating.value);
                  setRatingComment(userRating.comment || '');
                } else {
                  setRatingValue(0);
                  setRatingComment('');
                }
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmitRating}
              disabled={isSubmitting || ratingValue === 0 || ratingValue === null}
            >
              {isSubmitting ? 'Submitting...' : editMode ? 'Update Review' : 'Submit Review'}
            </Button>
          </Box>
        </Box>
      )}
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Reviews list */}
      <Typography variant="h6" gutterBottom>
        Reviews
      </Typography>
      
      {loading ? (
        // Loading skeletons
        Array.from(new Array(3)).map((_, index) => (
          <Box key={index} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', mb: 1 }}>
              <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
              <Box sx={{ width: '100%' }}>
                <Skeleton width="60%" height={24} />
                <Skeleton width="40%" height={20} />
              </Box>
            </Box>
            <Skeleton variant="rounded" height={80} />
          </Box>
        ))
      ) : ratings.length === 0 ? (
        <Alert severity="info">
          No reviews yet. Be the first to review this event!
        </Alert>
      ) : (
        <List>
          {ratings.map((rating) => (
            <ListItem
              key={rating.id}
              alignItems="flex-start"
              sx={{ 
                p: 2, 
                mb: 2, 
                bgcolor: 'background.paper',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider'
              }}
              secondaryAction={
                user && rating.userId === user.id ? (
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Edit review">
                      <IconButton 
                        edge="end" 
                        aria-label="edit"
                        onClick={handleEditRating}
                        size="small"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete review">
                      <IconButton 
                        edge="end" 
                        aria-label="delete"
                        onClick={() => handleDeleteClick(rating)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                ) : null
              }
            >
              <ListItemAvatar>
                <Avatar>
                  <PersonIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Typography
                      component="span"
                      variant="subtitle1"
                      sx={{ fontWeight: 'bold', mr: 1 }}
                    >
                      {rating.userId === user?.id ? 'Your Review' : `User ${rating.userId.substring(0, 8)}`}
                    </Typography>
                    <MuiRating
                      value={rating.value}
                      precision={0.5}
                      readOnly
                      size="small"
                    />
                  </Box>
                }
                secondary={
                  <>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                      sx={{ display: 'block', my: 1 }}
                    >
                      {rating.comment || <em>No comment provided</em>}
                    </Typography>
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.secondary"
                    >
                      {formatDate(rating.createdAt)}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete your review? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default RatingsSection;
