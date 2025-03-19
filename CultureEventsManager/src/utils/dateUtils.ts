/**
 * Formats a date string to a more readable format
 * @param dateString ISO date string
 * @returns Formatted date string (e.g. "March 25, 2025 at 18:00")
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Formats a date string to a shortened format
 * @param dateString ISO date string
 * @returns Shortened date string (e.g. "Mar 25, 2025")
 */
export const formatShortDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Gets the relative time from now (e.g. "5 days ago", "in 2 hours")
 * @param dateString ISO date string
 * @returns Relative time string
 */
export const getRelativeTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    const now = new Date();
    const diffInMs = date.getTime() - now.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      // Today
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      
      if (diffInHours === 0) {
        // Less than an hour
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        
        if (diffInMinutes === 0) {
          return 'Just now';
        } else if (diffInMinutes > 0) {
          return `In ${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''}`;
        } else {
          return `${Math.abs(diffInMinutes)} minute${Math.abs(diffInMinutes) !== 1 ? 's' : ''} ago`;
        }
      } else if (diffInHours > 0) {
        return `In ${diffInHours} hour${diffInHours !== 1 ? 's' : ''}`;
      } else {
        return `${Math.abs(diffInHours)} hour${Math.abs(diffInHours) !== 1 ? 's' : ''} ago`;
      }
    } else if (diffInDays > 0) {
      return `In ${diffInDays} day${diffInDays !== 1 ? 's' : ''}`;
    } else {
      return `${Math.abs(diffInDays)} day${Math.abs(diffInDays) !== 1 ? 's' : ''} ago`;
    }
  } catch (error) {
    console.error('Error calculating relative time:', error);
    return 'Unknown';
  }
};
