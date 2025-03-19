import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Stack,
  Tooltip
} from '@mui/material';
import {
  DownloadOutlined as DownloadIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  ConfirmationNumber as TicketIcon,
  Close as CancelIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';
import { Ticket, Event } from '../../types/models';
import { useAuth } from '../../context/AuthContext';
import { ticketService } from '../../services/ticketService';
import { eventService } from '../../services/eventService';
import { formatDate, formatCurrency } from '../../utils/dateUtils';

interface UserTicketsProps {
  onTicketCanceled?: () => void;
}

const UserTickets: React.FC<UserTicketsProps> = ({ onTicketCanceled }) => {
  const { user } = useAuth();
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<Record<string, Event>>({});
  const [isDownloading, setIsDownloading] = useState(false);
  
  // State for cancel dialog
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [ticketToCancel, setTicketToCancel] = useState<Ticket | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);
  
  // State for QR code dialog
  const [openQrDialog, setOpenQrDialog] = useState(false);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  
  // Fetch user tickets
  useEffect(() => {
    const fetchTickets = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const userTickets = await ticketService.getUserTickets(user.id);
        setTickets(userTickets);
        
        // Fetch event details for each ticket
        const eventIds = Array.from(new Set(userTickets.map(ticket => ticket.eventId)));
        const eventDetails: Record<string, Event> = {};
        
        await Promise.all(eventIds.map(async (eventId) => {
          try {
            const event = await eventService.getEventById(eventId);
            eventDetails[eventId] = event;
          } catch (err) {
            console.error(`Failed to fetch event ${eventId}:`, err);
          }
        }));
        
        setEvents(eventDetails);
        setError(null);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError('Failed to load your tickets. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTickets();
  }, [user]);
  
  // Handle download ticket
  const handleDownloadTicket = async (ticket: Ticket) => {
    try {
      setIsDownloading(true);
      const downloadUrl = await ticketService.getTicketDownloadUrl(ticket.id);
      
      // In a real application, this would download the ticket
      // For this demo, just show an alert
      alert(`Ticket would be downloaded from: ${downloadUrl}`);
      
      setIsDownloading(false);
    } catch (err) {
      console.error('Error downloading ticket:', err);
      setError('Failed to download ticket. Please try again later.');
      setIsDownloading(false);
    }
  };
  
  // Handle open cancel dialog
  const handleOpenCancelDialog = (ticket: Ticket) => {
    setTicketToCancel(ticket);
    setOpenCancelDialog(true);
  };
  
  // Handle close cancel dialog
  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
    setTicketToCancel(null);
  };
  
  // Handle cancel ticket
  const handleCancelTicket = async () => {
    if (!ticketToCancel) return;
    
    try {
      setIsCanceling(true);
      await ticketService.cancelTicket(ticketToCancel.id);
      
      // Update local state
      setTickets(tickets.map(t => 
        t.id === ticketToCancel.id 
          ? { ...t, status: 'Canceled' as const }
          : t
      ));
      
      // Close dialog
      handleCloseCancelDialog();
      
      // Notify parent
      if (onTicketCanceled) {
        onTicketCanceled();
      }
    } catch (err) {
      console.error('Error canceling ticket:', err);
      setError('Failed to cancel ticket. Please try again later.');
    } finally {
      setIsCanceling(false);
    }
  };
  
  // Handle show QR code
  const handleShowQrCode = (ticket: Ticket) => {
    setActiveTicket(ticket);
    setOpenQrDialog(true);
  };
  
  // Handle close QR dialog
  const handleCloseQrDialog = () => {
    setOpenQrDialog(false);
    setActiveTicket(null);
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Used':
        return 'secondary';
      case 'Canceled':
        return 'error';
      case 'Refunded':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // No tickets state
  if (tickets.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        You don't have any tickets yet. Browse events and purchase tickets to see them here.
      </Alert>
    );
  }
  
  // Group tickets by event
  const ticketsByEvent: Record<string, Ticket[]> = {};
  tickets.forEach(ticket => {
    if (!ticketsByEvent[ticket.eventId]) {
      ticketsByEvent[ticket.eventId] = [];
    }
    ticketsByEvent[ticket.eventId].push(ticket);
  });
  
  return (
    <Box>
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Tickets by event */}
      {Object.entries(ticketsByEvent).map(([eventId, eventTickets]) => (
        <Paper key={eventId} sx={{ mb: 4, p: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" gutterBottom>
              {events[eventId]?.title || 'Event'}
            </Typography>
            
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  {events[eventId] ? formatDate(events[eventId].startDate) : 'Loading date...'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  {events[eventId] ? 'Venue information' : 'Loading venue...'}
                </Typography>
              </Box>
            </Stack>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            {eventTickets.map(ticket => (
              <Grid item xs={12} sm={6} md={4} key={ticket.id}>
                <Card variant="outlined" sx={{ 
                  height: '100%',
                  position: 'relative',
                  opacity: ticket.status === 'Canceled' ? 0.7 : 1,
                }}>
                  {ticket.status === 'Canceled' && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        bgcolor: 'background.paper',
                        opacity: 0.3,
                        zIndex: 1,
                      }}
                    />
                  )}
                  
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="div">
                        {ticket.type} Ticket
                      </Typography>
                      
                      <Chip 
                        label={ticket.status} 
                        color={getStatusColor(ticket.status) as any}
                        size="small"
                      />
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Ticket ID: {ticket.id.substring(0, 8)}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Purchased: {formatDate(ticket.purchaseDate)}
                      </Typography>
                      
                      {ticket.seatNumber && (
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Seat: {ticket.seatNumber}
                        </Typography>
                      )}
                      
                      <Typography variant="body1" color="primary" fontWeight="bold">
                        {formatCurrency(ticket.price)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Tooltip title="Show QR Code">
                        <Button
                          variant="text"
                          color="primary"
                          startIcon={<QrCodeIcon />}
                          onClick={() => handleShowQrCode(ticket)}
                          disabled={ticket.status === 'Canceled'}
                        >
                          View
                        </Button>
                      </Tooltip>
                      
                      <Typography variant="caption" color="text.secondary">
                        #{ticket.barcode}
                      </Typography>
                    </Box>
                  </CardContent>
                  
                  <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                    <Button
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownloadTicket(ticket)}
                      disabled={ticket.status === 'Canceled' || isDownloading}
                    >
                      {isDownloading ? 'Downloading...' : 'Download'}
                    </Button>
                    
                    {ticket.status === 'Active' && (
                      <Button
                        size="small"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={() => handleOpenCancelDialog(ticket)}
                      >
                        Cancel
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      ))}
      
      {/* Cancel Ticket Dialog */}
      <Dialog
        open={openCancelDialog}
        onClose={handleCloseCancelDialog}
      >
        <DialogTitle>Confirm Cancellation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this ticket? This action cannot be undone.
            {ticketToCancel && ticketToCancel.type === 'VIP' && (
              <Box component="span" sx={{ display: 'block', mt: 2, fontWeight: 'bold' }}>
                Note: VIP tickets are non-refundable. You will not receive a refund.
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog} disabled={isCanceling}>
            Keep Ticket
          </Button>
          <Button 
            onClick={handleCancelTicket} 
            color="error" 
            variant="contained"
            disabled={isCanceling}
          >
            {isCanceling ? 'Canceling...' : 'Cancel Ticket'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* QR Code Dialog */}
      <Dialog
        open={openQrDialog}
        onClose={handleCloseQrDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center' }}>
          {activeTicket?.type} Ticket
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pb: 4 }}>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ 
              width: 200, 
              height: 200, 
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mb: 2
            }}>
              {/* Placeholder for QR code image */}
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?data=${activeTicket?.barcode || 'placeholder'}&size=200x200`}
                alt="Ticket QR Code"
                width={180}
                height={180}
              />
            </Box>
            
            <Typography variant="subtitle1" sx={{ textAlign: 'center', mb: 1 }}>
              {activeTicket?.barcode}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              Present this QR code at the event entrance
            </Typography>
          </Box>
          
          <Divider sx={{ width: '100%', my: 2 }} />
          
          <Box sx={{ width: '100%' }}>
            <Typography variant="subtitle2" gutterBottom>
              Event Details
            </Typography>
            
            {activeTicket && events[activeTicket.eventId] && (
              <>
                <Typography variant="body2" gutterBottom>
                  {events[activeTicket.eventId].title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {formatDate(events[activeTicket.eventId].startDate)}
                </Typography>
              </>
            )}
            
            {activeTicket?.seatNumber && (
              <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                Seat: {activeTicket.seatNumber}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseQrDialog}>Close</Button>
          <Button 
            onClick={() => activeTicket && handleDownloadTicket(activeTicket)} 
            startIcon={<DownloadIcon />}
            color="primary"
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserTickets;
