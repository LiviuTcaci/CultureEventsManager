// Base model interface
export interface BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

// User related interfaces
export interface User extends BaseModel {
  username: string;
  email: string;
  fullName: string;
  profilePicture?: string;
  role: 'User' | 'Organizer' | 'Admin';
  savedEventIds: string[];
  attendedEventIds: string[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Event related interfaces
export interface Event extends BaseModel {
  title: string;
  description: string;
  organizerId: string;
  categoryId: string;
  venueId: string;
  startDate: string;
  endDate: string;
  imageUrls: string[];
  status: 'Announced' | 'Ongoing' | 'Completed' | 'Canceled';
  capacity: number;
  ticketsSold: number;
  averageRating: number;
  ratingCount: number;
  performerIds: string[];
  performerDetails: PerformerDetail[];
}

export interface PerformerDetail {
  performerId: string;
  order: number;
  role: string;
  durationMinutes: number;
}

// Venue related interfaces
export interface Venue extends BaseModel {
  name: string;
  address: string;
  city: string;
  country: string;
  capacity: number;
  location: GeoLocation;
  imageUrl?: string;
  description?: string;
  facilities: string[];
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

// Category related interfaces
export interface Category extends BaseModel {
  name: string;
  description?: string;
  icon?: string;
  parentId?: string;
}

// Comment related interfaces
export interface Comment extends BaseModel {
  userId: string;
  eventId: string;
  content: string;
  parentId?: string;
  status: 'Active' | 'Hidden' | 'Removed';
  likes: number;
}

// Rating related interfaces
export interface Rating extends BaseModel {
  userId: string;
  eventId: string;
  value: number; // 1-5
  comment?: string;
}

// Ticket related interfaces
export interface Ticket extends BaseModel {
  eventId: string;
  userId: string;
  type: 'Standard' | 'VIP' | 'Premium';
  price: number;
  purchaseDate: string;
  status: 'Active' | 'Used' | 'Canceled' | 'Refunded';
  seatNumber?: string;
  barcode: string;
}

// Performer related interfaces
export interface Performer extends BaseModel {
  name: string;
  type: string; // Individual, Band, Group, Orchestra
  description?: string;
  imageUrl?: string;
  contactEmail?: string;
  website?: string;
  socialMedia: Record<string, string>;
}
