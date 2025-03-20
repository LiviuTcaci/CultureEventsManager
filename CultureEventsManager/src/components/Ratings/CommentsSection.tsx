import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
  IconButton,
  Menu,
  MenuItem,
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
  MoreVert as MoreVertIcon,
  Reply as ReplyIcon,
  ThumbUp as ThumbUpIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { commentService } from '../../services/ratingService';
import { Comment } from '../../types/models';
import { formatDate } from '../../utils/dateUtils';

interface CommentsSectionProps {
  eventId: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ eventId }) => {
  const { user, isAuthenticated } = useAuth();
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  
  // Track which comments the current user has already liked
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  
  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const commentsData = await commentService.getEventComments(eventId);
        
        // Organize into hierarchical structure (top-level comments first, followed by replies)
        const topLevelComments = commentsData.filter(c => !c.parentId);
        const replyComments = commentsData.filter(c => c.parentId);
        
        setComments([...topLevelComments, ...replyComments]);
        setError(null);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('Failed to load comments. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchComments();
  }, [eventId]);
  
  // Handle comment menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, comment: Comment) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedComment(comment);
  };
  
  // Handle comment menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedComment(null);
  };
  
  // Handle edit comment
  const handleEditComment = () => {
    if (!selectedComment) return;
    
    setEditingComment(selectedComment);
    setCommentText(selectedComment.content);
    handleMenuClose();
  };
  
  // Handle delete comment
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };
  
  // Confirm delete comment
  const handleConfirmDelete = async () => {
    if (!selectedComment) return;
    
    try {
      await commentService.deleteComment(selectedComment.id);
      
      // Remove from local state
      setComments(comments.filter(c => c.id !== selectedComment.id));
      
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment. Please try again later.');
    }
  };
  
  // Cancel delete
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
  };
  
  // Handle reply
  const handleReply = (comment: Comment) => {
    setReplyTo(comment);
    setCommentText('');
  };
  
  // Cancel reply or edit
  const handleCancelReplyOrEdit = () => {
    setReplyTo(null);
    setEditingComment(null);
    setCommentText('');
  };
  
  // Submit comment
  const handleSubmitComment = async () => {
    if (!isAuthenticated || !user || !commentText.trim()) return;
    
    try {
      setIsSubmitting(true);
      
      if (editingComment) {
        // Update existing comment
        const updatedComment = await commentService.updateComment(editingComment.id, commentText);
        
        // Update local state
        setComments(comments.map(c => c.id === updatedComment.id ? updatedComment : c));
        setEditingComment(null);
      } else {
        // Add new comment
        const newComment = await commentService.addComment({
          userId: user.id,
          eventId,
          content: commentText,
          parentId: replyTo?.id
        });
        
        // Add to local state
        setComments([...comments, newComment]);
        setReplyTo(null);
      }
      
      setCommentText('');
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError('Failed to submit comment. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle like
  const handleLike = async (comment: Comment) => {
    if (!isAuthenticated || !user) return;
    
    // Verificăm dacă utilizatorul a dat deja like la acest comentariu
    if (likedComments.has(comment.id)) {
      return; // Nu permitem like-uri multiple de la același utilizator
    }
    
    // In a real app, this would call an API to toggle the like
    // For now, just toggle the like in the UI
    const updatedComment = {
      ...comment,
      likes: comment.likes + 1
    };
    
    // Adăugăm comentariul la lista de comentarii apreciate
    const newLikedComments = new Set(likedComments);
    newLikedComments.add(comment.id);
    setLikedComments(newLikedComments);
    
    // Update local state
    setComments(comments.map(c => c.id === comment.id ? updatedComment : c));
  };
  
  // Get replies for a comment
  const getReplies = (commentId: string) => {
    return comments.filter(c => c.parentId === commentId);
  };
  
  // Render comment
  const renderComment = (comment: Comment, isReply = false) => {
    const replies = getReplies(comment.id);
    const isCurrentUserComment = user && comment.userId === user.id;
    
    return (
      <React.Fragment key={comment.id}>
        <ListItem
          alignItems="flex-start"
          sx={{ 
            p: 2, 
            pl: isReply ? 6 : 2, // Indent replies
            mb: 1,
            bgcolor: 'background.paper',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <ListItemAvatar>
            <Avatar>
              <PersonIcon />
            </Avatar>
          </ListItemAvatar>
          
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography
                  component="span"
                  variant="subtitle1"
                  sx={{ fontWeight: 'bold' }}
                >
                  {isCurrentUserComment ? 'You' : `User ${comment.userId.substring(0, 8)}`}
                </Typography>
                
                {isCurrentUserComment && (
                  <IconButton
                    size="small"
                    aria-label="comment options"
                    onClick={(e) => handleMenuOpen(e, comment)}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                )}
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
                  {comment.content}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                  >
                    {formatDate(comment.createdAt)}
                    {comment.createdAt !== comment.updatedAt && ' (edited)'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Tooltip title="Like">
                      <IconButton
                        size="small"
                        onClick={() => handleLike(comment)}
                        disabled={!isAuthenticated || likedComments.has(comment.id)}
                      >
                        {likedComments.has(comment.id) ? (
                          <ThumbUpIcon fontSize="small" color="primary" />
                        ) : (
                          <ThumbUpOutlinedIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                    
                    {comment.likes > 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                        {comment.likes}
                      </Typography>
                    )}
                    
                    <Tooltip title="Reply">
                      <IconButton
                        size="small"
                        onClick={() => handleReply(comment)}
                        disabled={!isAuthenticated}
                      >
                        <ReplyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </>
            }
          />
        </ListItem>
        
        {/* Render replies */}
        {replies.length > 0 && (
          <List dense disablePadding>
            {replies.map(reply => renderComment(reply, true))}
          </List>
        )}
        
        {/* Reply form */}
        {replyTo && replyTo.id === comment.id && (
          <Box sx={{ pl: isReply ? 8 : 4, pr: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Replying to {isCurrentUserComment ? 'yourself' : `User ${comment.userId.substring(0, 8)}`}
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={2}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write your reply..."
              size="small"
              sx={{ mb: 1 }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button size="small" onClick={handleCancelReplyOrEdit}>
                Cancel
              </Button>
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={handleSubmitComment}
                disabled={isSubmitting || !commentText.trim()}
              >
                {isSubmitting ? 'Submitting...' : 'Reply'}
              </Button>
            </Box>
          </Box>
        )}
      </React.Fragment>
    );
  };
  
  return (
    <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Discussion
      </Typography>
      
      {/* New comment form */}
      {isAuthenticated && !replyTo && !editingComment && (
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Ask a question or share your thoughts about this event..."
            label="New Comment"
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmitComment}
              disabled={isSubmitting || !commentText.trim()}
            >
              {isSubmitting ? 'Submitting...' : 'Post Comment'}
            </Button>
          </Box>
        </Box>
      )}
      
      {/* Edit comment form */}
      {editingComment && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Edit Comment
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={handleCancelReplyOrEdit}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmitComment}
              disabled={isSubmitting || !commentText.trim()}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Box>
      )}
      
      {/* Not logged in message */}
      {!isAuthenticated && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Please <Button href="/login" color="inherit" size="small">login</Button> to join the discussion.
        </Alert>
      )}
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Divider sx={{ my: 2 }} />
      
      {/* Comments list */}
      <Typography variant="h6" gutterBottom>
        {loading ? 'Loading comments...' : `${comments.length} Comments`}
      </Typography>
      
      {loading ? (
        // Loading skeletons
        Array.from(new Array(3)).map((_, index) => (
          <Box key={index} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', mb: 1 }}>
              <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
              <Box sx={{ width: '100%' }}>
                <Skeleton width="40%" height={24} />
              </Box>
            </Box>
            <Skeleton variant="rounded" height={60} sx={{ ml: 7 }} />
          </Box>
        ))
      ) : comments.length === 0 ? (
        <Alert severity="info">
          No comments yet. Be the first to start a discussion!
        </Alert>
      ) : (
        <List>
          {comments
            .filter(comment => !comment.parentId) // Only render top-level comments here
            .map(comment => renderComment(comment))}
        </List>
      )}
      
      {/* Comment Options Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditComment}>Edit</MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>Delete</MenuItem>
      </Menu>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this comment? This action cannot be undone.
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

export default CommentsSection;
