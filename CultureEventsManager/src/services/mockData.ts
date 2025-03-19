import { User, Event, Venue, Category } from '../types/models';

// Mock users for testing authentication
export const mockUsers: User[] = [
  {
    id: '1',
    username: 'johndoe',
    email: 'john@example.com',
    fullName: 'John Doe',
    profilePicture: 'https://via.placeholder.com/150',
    role: 'User',
    createdAt: '2024-01-01T12:00:00Z',
    updatedAt: '2024-01-01T12:00:00Z',
    isDeleted: false,
    savedEventIds: ['1', '3'],
    attendedEventIds: ['2']
  },
  {
    id: '2',
    username: 'janedoe',
    email: 'jane@example.com',
    fullName: 'Jane Doe',
    profilePicture: 'https://via.placeholder.com/150',
    role: 'Organizer',
    createdAt: '2024-01-02T10:00:00Z',
    updatedAt: '2024-01-02T10:00:00Z',
    isDeleted: false,
    savedEventIds: [],
    attendedEventIds: []
  },
  {
    id: '3',
    username: 'admin',
    email: 'admin@example.com',
    fullName: 'Admin User',
    profilePicture: 'https://via.placeholder.com/150',
    role: 'Admin',
    createdAt: '2024-01-03T09:00:00Z',
    updatedAt: '2024-01-03T09:00:00Z',
    isDeleted: false,
    savedEventIds: [],
    attendedEventIds: []
  }
];

// Mock categories for events
export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Music',
    description: 'Music events including concerts, festivals, and live performances',
    icon: 'music_note',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isDeleted: false
  },
  {
    id: '2',
    name: 'Theater',
    description: 'Theatrical performances including plays, musicals, and opera',
    icon: 'theater_comedy',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isDeleted: false
  },
  {
    id: '3',
    name: 'Art',
    description: 'Art exhibitions, gallery openings, and installations',
    icon: 'palette',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isDeleted: false
  },
  {
    id: '4',
    name: 'Dance',
    description: 'Dance performances including ballet, contemporary, and traditional',
    icon: 'directions_run',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isDeleted: false
  }
];

// Mock venues for events
export const mockVenues: Venue[] = [
  {
    id: '1',
    name: 'City Concert Hall',
    address: '123 Main St',
    city: 'New York',
    country: 'USA',
    capacity: 2000,
    location: {
      latitude: 40.7128,
      longitude: -74.0060
    },
    imageUrl: 'https://via.placeholder.com/500x300?text=Concert+Hall',
    description: 'A premier venue for classical and contemporary music performances',
    facilities: ['Parking', 'Refreshments', 'Wheelchair Access'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isDeleted: false
  },
  {
    id: '2',
    name: 'Metropolitan Theater',
    address: '456 Broadway',
    city: 'New York',
    country: 'USA',
    capacity: 1500,
    location: {
      latitude: 40.7589,
      longitude: -73.9851
    },
    imageUrl: 'https://via.placeholder.com/500x300?text=Theater',
    description: 'Historic theater hosting plays, musicals, and special performances',
    facilities: ['Parking', 'Bar', 'Coat Check', 'Wheelchair Access'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isDeleted: false
  },
  {
    id: '3',
    name: 'Modern Art Gallery',
    address: '789 5th Ave',
    city: 'New York',
    country: 'USA',
    capacity: 500,
    location: {
      latitude: 40.7631,
      longitude: -73.9712
    },
    imageUrl: 'https://via.placeholder.com/500x300?text=Art+Gallery',
    description: 'Contemporary art gallery featuring rotating exhibitions',
    facilities: ['Gift Shop', 'Café', 'Wheelchair Access'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isDeleted: false
  }
];

// Mock events data
export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Symphony Orchestra Concert',
    description: 'Experience the magic of classical music with the city\'s premier symphony orchestra performing Mozart, Beethoven, and Tchaikovsky.',
    organizerId: '2',
    categoryId: '1',
    venueId: '1',
    startDate: '2025-04-15T19:00:00Z',
    endDate: '2025-04-15T22:00:00Z',
    imageUrls: ['https://via.placeholder.com/800x400?text=Symphony+Concert'],
    status: 'Announced',
    capacity: 1800,
    ticketsSold: 1200,
    averageRating: 4.7,
    ratingCount: 45,
    performerIds: ['performer1', 'performer2'],
    performerDetails: [
      {
        performerId: 'performer1',
        order: 1,
        role: 'Conductor',
        durationMinutes: 180
      }
    ],
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-10T14:30:00Z',
    isDeleted: false
  },
  {
    id: '2',
    title: 'Romeo and Juliet',
    description: 'A modern interpretation of Shakespeare\'s classic tale of star-crossed lovers.',
    organizerId: '2',
    categoryId: '2',
    venueId: '2',
    startDate: '2025-04-20T20:00:00Z',
    endDate: '2025-04-20T22:30:00Z',
    imageUrls: ['https://via.placeholder.com/800x400?text=Romeo+and+Juliet'],
    status: 'Announced',
    capacity: 1200,
    ticketsSold: 800,
    averageRating: 4.5,
    ratingCount: 28,
    performerIds: ['performer3', 'performer4', 'performer5'],
    performerDetails: [
      {
        performerId: 'performer3',
        order: 1,
        role: 'Romeo',
        durationMinutes: 150
      },
      {
        performerId: 'performer4',
        order: 2,
        role: 'Juliet',
        durationMinutes: 150
      }
    ],
    createdAt: '2024-02-05T11:30:00Z',
    updatedAt: '2024-02-12T09:15:00Z',
    isDeleted: false
  },
  {
    id: '3',
    title: 'Contemporary Art Exhibition',
    description: 'Featuring works from leading contemporary artists exploring themes of identity and technology.',
    organizerId: '2',
    categoryId: '3',
    venueId: '3',
    startDate: '2025-05-01T10:00:00Z',
    endDate: '2025-05-30T18:00:00Z',
    imageUrls: ['https://via.placeholder.com/800x400?text=Art+Exhibition'],
    status: 'Announced',
    capacity: 300,
    ticketsSold: 210,
    averageRating: 4.2,
    ratingCount: 15,
    performerIds: [],
    performerDetails: [],
    createdAt: '2024-02-15T13:45:00Z',
    updatedAt: '2024-02-15T13:45:00Z',
    isDeleted: false
  },
  {
    id: '4',
    title: 'Ballet Gala',
    description: 'An evening of exceptional ballet performances featuring principal dancers from around the world.',
    organizerId: '2',
    categoryId: '4',
    venueId: '2',
    startDate: '2025-05-10T19:30:00Z',
    endDate: '2025-05-10T22:00:00Z',
    imageUrls: ['https://via.placeholder.com/800x400?text=Ballet+Gala'],
    status: 'Announced',
    capacity: 1500,
    ticketsSold: 1100,
    averageRating: 4.9,
    ratingCount: 32,
    performerIds: ['performer6', 'performer7', 'performer8'],
    performerDetails: [
      {
        performerId: 'performer6',
        order: 1,
        role: 'Principal Dancer',
        durationMinutes: 150
      },
      {
        performerId: 'performer7',
        order: 2,
        role: 'Guest Performer',
        durationMinutes: 45
      }
    ],
    createdAt: '2024-02-20T16:00:00Z',
    updatedAt: '2024-02-22T10:20:00Z',
    isDeleted: false
  }
];

// Mock authentication service
export const mockAuth = {
  login: (email: string, password: string) => {
    // Find user with matching email
    const user = mockUsers.find(u => u.email === email);
    
    // Simulate password check (in a real app, you'd use bcrypt or similar)
    if (!user || password !== 'password') { // For demo, any user with password "password"
      throw new Error('Invalid email or password');
    }
    
    // Generate a mock JWT
    const token = `mock-jwt-token-${user.id}-${Date.now()}`;
    
    return { user, token };
  },
  
  register: (userData: any) => {
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === userData.email || u.username === userData.username);
    
    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }
    
    // Create new user
    const newUser: User = {
      id: `user-${Date.now()}`,
      username: userData.username,
      email: userData.email,
      fullName: userData.fullName,
      profilePicture: userData.profilePicture || '',
      role: userData.role || 'User',
      savedEventIds: [],
      attendedEventIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false
    };
    
    // Generate a mock JWT
    const token = `mock-jwt-token-${newUser.id}-${Date.now()}`;
    
    // In a real app, you'd add this user to the database
    // For this mock, we don't actually add it to mockUsers array as it's static
    
    return { user: newUser, token };
  }
};
