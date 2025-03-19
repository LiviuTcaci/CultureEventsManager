import { Rating, Comment } from '../types/models';
import { apiService } from './api';

const BASE_URL = '/ratings';

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Additional interface for comments with reply tracking
// This is for our UI management, not part of the API model
interface CommentWithReplies extends Comment {
  replies: string[];
}

// Mock data for ratings and comments
const mockRatings: Rating[] = [
  {
    id: '1',
    userId: '1',
    eventId: '1',
    value: 4.5,
    comment: 'Great event, really enjoyed the orchestra performance!',
    createdAt: '2025-03-18T14:22:00Z',
    updatedAt: '2025-03-18T14:22:00Z',
    isDeleted: false
  },
  {
    id: '2',
    userId: '2',
    eventId: '1',
    value: 5,
    comment: 'One of the best symphony performances I have ever attended!',
    createdAt: '2025-03-15T18:30:00Z',
    updatedAt: '2025-03-15T18:30:00Z',
    isDeleted: false
  },
  {
    id: '3',
    userId: '1',
    eventId: '2',
    value: 4,
    comment: 'The modern take on Romeo and Juliet was quite interesting.',
    createdAt: '2025-03-10T20:15:00Z',
    updatedAt: '2025-03-10T20:15:00Z',
    isDeleted: false
  },
  {
    id: '4',
    userId: '3',
    eventId: '2',
    value: 3.5,
    comment: 'Good performance but I prefer the traditional interpretation.',
    createdAt: '2025-03-12T22:45:00Z',
    updatedAt: '2025-03-12T22:45:00Z',
    isDeleted: false
  }
];

// In-memory mock comments with reply tracking
const mockComments: CommentWithReplies[] = [
  {
    id: '1',
    userId: '1',
    eventId: '1',
    content: 'Is there a dress code for this event?',
    createdAt: '2025-03-01T10:15:00Z',
    updatedAt: '2025-03-01T10:15:00Z',
    isDeleted: false,
    parentId: undefined,
    status: 'Active',
    likes: 0,
    replies: ['2']
  },
  {
    id: '2',
    userId: '2',
    eventId: '1',
    content: 'Smart casual is recommended, but not strictly enforced.',
    createdAt: '2025-03-01T11:30:00Z',
    updatedAt: '2025-03-01T11:30:00Z',
    isDeleted: false,
    parentId: '1',
    status: 'Active',
    likes: 0,
    replies: []
  },
  {
    id: '3',
    userId: '3',
    eventId: '1',
    content: 'Will there be an intermission?',
    createdAt: '2025-03-02T14:20:00Z',
    updatedAt: '2025-03-02T14:20:00Z',
    isDeleted: false,
    parentId: undefined,
    status: 'Active',
    likes: 0,
    replies: ['4']
  },
  {
    id: '4',
    userId: '2',
    eventId: '1',
    content: 'Yes, there will be a 20-minute intermission.',
    createdAt: '2025-03-02T15:05:00Z',
    updatedAt: '2025-03-02T15:05:00Z',
    isDeleted: false,
    parentId: '3',
    status: 'Active',
    likes: 0,
    replies: []
  },
  {
    id: '5',
    userId: '1',
    eventId: '2',
    content: 'How long is the play?',
    createdAt: '2025-03-05T09:45:00Z',
    updatedAt: '2025-03-05T09:45:00Z',
    isDeleted: false,
    parentId: undefined,
    status: 'Active',
    likes: 0,
    replies: []
  }
];

export const ratingService = {
  // Get all ratings for an event
  getEventRatings: async (eventId: string): Promise<Rating[]> => {
    try {
      return await apiService.get<Rating[]>(`${BASE_URL}/event/${eventId}`);
    } catch (error) {
      console.log(`Falling back to mock ratings for event: ${eventId}`);
      await delay(400);
      return mockRatings.filter(r => r.eventId === eventId && !r.isDeleted);
    }
  },
  
  // Get user's rating for an event
  getUserRating: async (userId: string, eventId: string): Promise<Rating | null> => {
    try {
      return await apiService.get<Rating>(`${BASE_URL}/user/${userId}/event/${eventId}`);
    } catch (error) {
      console.log(`Falling back to mock rating for user: ${userId}, event: ${eventId}`);
      await delay(300);
      const rating = mockRatings.find(r => r.userId === userId && r.eventId === eventId && !r.isDeleted);
      return rating || null;
    }
  },
  
  // Add or update rating
  submitRating: async (rating: Omit<Rating, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>): Promise<Rating> => {
    try {
      return await apiService.post<Rating>(BASE_URL, rating);
    } catch (error) {
      console.log('Mocking submit rating');
      await delay(500);
      
      // Check if user already rated this event
      const existingRating = mockRatings.find(r => 
        r.userId === rating.userId && 
        r.eventId === rating.eventId && 
        !r.isDeleted
      );
      
      if (existingRating) {
        // Mock update
        const updatedRating = {
          ...existingRating,
          value: rating.value,
          comment: rating.comment,
          updatedAt: new Date().toISOString()
        };
        
        // In a real app, we would update the database
        return updatedRating;
      } else {
        // Mock create
        const newRating: Rating = {
          id: `rating-${Date.now()}`,
          userId: rating.userId,
          eventId: rating.eventId,
          value: rating.value,
          comment: rating.comment,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDeleted: false
        };
        
        // In a real app, we would add to the database
        return newRating;
      }
    }
  },
  
  // Delete rating
  deleteRating: async (ratingId: string): Promise<void> => {
    try {
      await apiService.delete<void>(`${BASE_URL}/${ratingId}`);
    } catch (error) {
      console.log(`Mocking delete rating: ${ratingId}`);
      await delay(300);
      // In a real app, we would soft delete in the database
    }
  }
};

export const commentService = {
  // Get all comments for an event
  getEventComments: async (eventId: string): Promise<Comment[]> => {
    try {
      return await apiService.get<Comment[]>(`/events/${eventId}/comments`);
    } catch (error) {
      console.log(`Falling back to mock comments for event: ${eventId}`);
      await delay(400);
      
      // Get comments for this event
      const eventComments = mockComments.filter(c => 
        c.eventId === eventId && 
        !c.isDeleted
      );
      
      // Convert CommentWithReplies to standard Comment
      const commentsForApi: Comment[] = eventComments.map(c => ({
        id: c.id,
        userId: c.userId,
        eventId: c.eventId,
        content: c.content,
        parentId: c.parentId,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        isDeleted: c.isDeleted,
        status: c.status,
        likes: c.likes
      }));
      
      return commentsForApi;
    }
  },
  
  // Add comment
  addComment: async (comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted' | 'likes' | 'status'>): Promise<Comment> => {
    try {
      return await apiService.post<Comment>(`/events/${comment.eventId}/comments`, comment);
    } catch (error) {
      console.log('Mocking add comment');
      await delay(500);
      
      // Mock create comment
      const newComment: Comment = {
        id: `comment-${Date.now()}`,
        userId: comment.userId,
        eventId: comment.eventId,
        content: comment.content,
        parentId: comment.parentId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: false,
        status: 'Active',
        likes: 0
      };
      
      // If this is a reply, update our in-memory parent's replies array (for UI tracking)
      if (comment.parentId) {
        const parentComment = mockComments.find(c => c.id === comment.parentId);
        if (parentComment) {
          parentComment.replies.push(newComment.id);
        }
      }
      
      // In a real app, we would add to the database
      return newComment;
    }
  },
  
  // Update comment
  updateComment: async (commentId: string, content: string): Promise<Comment> => {
    try {
      return await apiService.put<Comment>(`/comments/${commentId}`, { content });
    } catch (error) {
      console.log(`Mocking update comment: ${commentId}`);
      await delay(300);
      
      const comment = mockComments.find(c => c.id === commentId);
      if (!comment) {
        throw new Error('Comment not found');
      }
      
      // Create a new comment object without the replies field
      const { replies, ...commentWithoutReplies } = comment;
      
      // Mock update
      const updatedComment: Comment = {
        ...commentWithoutReplies,
        content,
        updatedAt: new Date().toISOString()
      };
      
      // In a real app, we would update the database
      return updatedComment;
    }
  },
  
  // Delete comment
  deleteComment: async (commentId: string): Promise<void> => {
    try {
      await apiService.delete<void>(`/comments/${commentId}`);
    } catch (error) {
      console.log(`Mocking delete comment: ${commentId}`);
      await delay(300);
      // In a real app, we would soft delete in the database
    }
  }
};
