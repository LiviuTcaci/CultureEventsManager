import { Ticket } from '../types/models';
import { apiService } from './api';

const BASE_URL = '/tickets';

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data for tickets
const mockTickets: Ticket[] = [
  {
    id: '1',
    userId: '1',
    eventId: '1',
    type: 'Standard',
    price: 25.00,
    purchaseDate: '2025-03-15T10:30:00Z',
    status: 'Active',
    barcode: 'T12345678',
    createdAt: '2025-03-15T10:30:00Z',
    updatedAt: '2025-03-15T10:30:00Z',
    isDeleted: false
  },
  {
    id: '2',
    userId: '1',
    eventId: '2',
    type: 'VIP',
    price: 75.00,
    purchaseDate: '2025-03-10T14:45:00Z',
    status: 'Used',
    barcode: 'T98765432',
    createdAt: '2025-03-10T14:45:00Z',
    updatedAt: '2025-03-17T19:20:00Z',
    isDeleted: false
  },
  {
    id: '3',
    userId: '2',
    eventId: '1',
    type: 'Premium',
    price: 50.00,
    purchaseDate: '2025-03-14T11:15:00Z',
    status: 'Active',
    seatNumber: 'A12',
    barcode: 'T24681357',
    createdAt: '2025-03-14T11:15:00Z',
    updatedAt: '2025-03-14T11:15:00Z',
    isDeleted: false
  },
  {
    id: '4',
    userId: '3',
    eventId: '3',
    type: 'Standard',
    price: 30.00,
    purchaseDate: '2025-03-12T09:00:00Z',
    status: 'Canceled',
    barcode: 'T13579246',
    createdAt: '2025-03-12T09:00:00Z',
    updatedAt: '2025-03-13T16:30:00Z',
    isDeleted: false
  }
];

export interface PurchaseTicketRequest {
  userId: string;
  eventId: string;
  type: 'Standard' | 'VIP' | 'Premium';
  quantity: number;
  seatNumbers?: string[];
}

export interface TicketPricing {
  standard: number;
  premium: number;
  vip: number;
}

export const ticketService = {
  // Get all tickets for a user
  getUserTickets: async (userId: string): Promise<Ticket[]> => {
    try {
      return await apiService.get<Ticket[]>(`${BASE_URL}/user/${userId}`);
    } catch (error) {
      console.log(`Falling back to mock tickets for user: ${userId}`);
      await delay(500);
      return mockTickets.filter(t => t.userId === userId && !t.isDeleted);
    }
  },
  
  // Get all tickets for an event
  getEventTickets: async (eventId: string): Promise<Ticket[]> => {
    try {
      return await apiService.get<Ticket[]>(`${BASE_URL}/event/${eventId}`);
    } catch (error) {
      console.log(`Falling back to mock tickets for event: ${eventId}`);
      await delay(500);
      return mockTickets.filter(t => t.eventId === eventId && !t.isDeleted);
    }
  },
  
  // Get a specific ticket
  getTicket: async (ticketId: string): Promise<Ticket> => {
    try {
      return await apiService.get<Ticket>(`${BASE_URL}/${ticketId}`);
    } catch (error) {
      console.log(`Falling back to mock ticket: ${ticketId}`);
      await delay(300);
      
      const ticket = mockTickets.find(t => t.id === ticketId && !t.isDeleted);
      if (!ticket) {
        throw new Error('Ticket not found');
      }
      
      return ticket;
    }
  },
  
  // Purchase tickets
  purchaseTickets: async (purchaseRequest: PurchaseTicketRequest): Promise<Ticket[]> => {
    try {
      return await apiService.post<Ticket[]>(`${BASE_URL}/purchase`, purchaseRequest);
    } catch (error) {
      console.log('Mocking ticket purchase');
      await delay(1000); // Longer delay to simulate payment processing
      
      // Generate mock tickets
      const ticketPricing: Record<string, number> = {
        'Standard': 25.00,
        'Premium': 50.00,
        'VIP': 75.00
      };
      
      const newTickets: Ticket[] = [];
      for (let i = 0; i < purchaseRequest.quantity; i++) {
        const newTicket: Ticket = {
          id: `ticket-${Date.now()}-${i}`,
          userId: purchaseRequest.userId,
          eventId: purchaseRequest.eventId,
          type: purchaseRequest.type,
          price: ticketPricing[purchaseRequest.type],
          purchaseDate: new Date().toISOString(),
          status: 'Active',
          seatNumber: purchaseRequest.seatNumbers?.[i],
          barcode: `T${Math.floor(Math.random() * 100000000)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDeleted: false
        };
        
        newTickets.push(newTicket);
      }
      
      return newTickets;
    }
  },
  
  // Cancel ticket
  cancelTicket: async (ticketId: string): Promise<Ticket> => {
    try {
      return await apiService.put<Ticket>(`${BASE_URL}/${ticketId}/cancel`, {});
    } catch (error) {
      console.log(`Mocking cancel ticket: ${ticketId}`);
      await delay(500);
      
      const ticket = mockTickets.find(t => t.id === ticketId && !t.isDeleted);
      if (!ticket) {
        throw new Error('Ticket not found');
      }
      
      if (ticket.status === 'Used') {
        throw new Error('Cannot cancel a used ticket');
      }
      
      // Mock update
      const updatedTicket = {
        ...ticket,
        status: 'Canceled' as const,
        updatedAt: new Date().toISOString()
      };
      
      return updatedTicket;
    }
  },
  
  // Get ticket pricing for an event
  getTicketPricing: async (eventId: string): Promise<TicketPricing> => {
    try {
      return await apiService.get<TicketPricing>(`/events/${eventId}/pricing`);
    } catch (error) {
      console.log(`Mocking ticket pricing for event: ${eventId}`);
      await delay(300);
      
      // Mock pricing based on event ID to simulate different events having different prices
      const eventIdNum = parseInt(eventId.replace(/\D/g, '')) || 1;
      
      return {
        standard: 20 + (eventIdNum % 3) * 5,
        premium: 45 + (eventIdNum % 2) * 10,
        vip: 70 + (eventIdNum % 4) * 15
      };
    }
  },
  
  // Check ticket availability
  checkAvailability: async (eventId: string, ticketType: string): Promise<number> => {
    try {
      const response = await apiService.get<{available: number}>(`/events/${eventId}/availability/${ticketType}`);
      return response.available;
    } catch (error) {
      console.log(`Mocking ticket availability for event: ${eventId}, type: ${ticketType}`);
      await delay(300);
      
      // Mock availability - simulate some events being closer to sold out
      const eventIdNum = parseInt(eventId.replace(/\D/g, '')) || 1;
      const baseAvailability = 100 - (eventIdNum * 10) % 80;
      
      switch (ticketType.toLowerCase()) {
        case 'standard':
          return baseAvailability;
        case 'premium':
          return Math.floor(baseAvailability / 2);
        case 'vip':
          return Math.floor(baseAvailability / 4);
        default:
          return 0;
      }
    }
  },
  
  // Get a ticket download URL (in a real app, this might generate a PDF ticket)
  getTicketDownloadUrl: async (ticketId: string): Promise<string> => {
    try {
      const response = await apiService.get<{url: string}>(`${BASE_URL}/${ticketId}/download`);
      return response.url;
    } catch (error) {
      console.log(`Mocking ticket download URL for ticket: ${ticketId}`);
      await delay(500);
      
      // In a real app, this would be a URL to download the ticket
      // For our mock, just return a placeholder
      return `https://example.com/tickets/download/${ticketId}`;
    }
  }
};
