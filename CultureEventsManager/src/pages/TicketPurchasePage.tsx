import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { 
  Event as EventIcon,
  LocalActivity as TicketIcon,
  Payment as PaymentIcon,
  CheckCircleOutline as ConfirmIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { eventService } from '../services/eventService';
import { ticketService, TicketPricing, PurchaseTicketRequest } from '../services/ticketService';
import { formatDate, formatCurrency } from '../utils/dateUtils';
import { Event } from '../types/models';

// Step components
const steps = ['Select Tickets', 'Payment Details', 'Confirmation'];

const TicketPurchasePage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // State for the event
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for the stepper
  const [activeStep, setActiveStep] = useState(0);
  
  // State for ticket selection
  const [ticketPricing, setTicketPricing] = useState<TicketPricing | null>(null);
  const [ticketType, setTicketType] = useState<'Standard' | 'Premium' | 'VIP'>('Standard');
  const [quantity, setQuantity] = useState(1);
  const [availableTickets, setAvailableTickets] = useState<Record<string, number>>({
    standard: 0,
    premium: 0,
    vip: 0
  });
  
  // State for payment
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  
  // State for purchase
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [purchasedTickets, setPurchasedTickets] = useState<any[]>([]);
  
  // State for redirect dialog
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  
  // Fetch event details and ticket pricing
  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) {
        setError('Event ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch event details
        const eventData = await eventService.getEventById(eventId);
        setEvent(eventData);
        
        // Fetch ticket pricing
        const pricing = await ticketService.getTicketPricing(eventId);
        setTicketPricing(pricing);
        
        // Fetch ticket availability
        const standardAvailable = await ticketService.checkAvailability(eventId, 'standard');
        const premiumAvailable = await ticketService.checkAvailability(eventId, 'premium');
        const vipAvailable = await ticketService.checkAvailability(eventId, 'vip');
        
        setAvailableTickets({
          standard: standardAvailable,
          premium: premiumAvailable,
          vip: vipAvailable
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to load event details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      setShowLoginDialog(true);
    }
  }, [eventId, isAuthenticated]);
  
  // Handle next step
  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Complete purchase
      handleCompletePurchase();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };
  
  // Handle back step
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  // Handle login redirect
  const handleLoginRedirect = () => {
    navigate(`/login?redirect=/events/${eventId}/tickets`);
  };
  
  // Handle ticket type change
  const handleTicketTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTicketType(event.target.value as 'Standard' | 'Premium' | 'VIP');
  };
  
  // Handle quantity change
  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (value > 0 && value <= 10) {
      setQuantity(value);
    }
  };
  
  // Handle payment method change
  const handlePaymentMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentMethod(event.target.value);
  };
  
  // Calculate total price
  const calculateTotal = () => {
    if (!ticketPricing) return 0;
    
    let price = 0;
    switch (ticketType) {
      case 'Standard':
        price = ticketPricing.standard;
        break;
      case 'Premium':
        price = ticketPricing.premium;
        break;
      case 'VIP':
        price = ticketPricing.vip;
        break;
    }
    
    return price * quantity;
  };
  
  // Handle purchase completion
  const handleCompletePurchase = async () => {
    if (!isAuthenticated || !user || !eventId) {
      setShowLoginDialog(true);
      return;
    }
    
    try {
      setIsPurchasing(true);
      
      const purchaseRequest: PurchaseTicketRequest = {
        userId: user.id,
        eventId,
        type: ticketType,
        quantity
      };
      
      // Purchase tickets
      const tickets = await ticketService.purchaseTickets(purchaseRequest);
      setPurchasedTickets(tickets);
      setPurchaseComplete(true);
      
    } catch (err) {
      console.error('Error purchasing tickets:', err);
      setError('Failed to complete purchase. Please try again later.');
    } finally {
      setIsPurchasing(false);
    }
  };
  
  // Render ticket selection step
  const renderTicketSelection = () => {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Select Ticket Type and Quantity
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Ticket Type</FormLabel>
              <RadioGroup
                aria-label="ticket-type"
                name="ticket-type"
                value={ticketType}
                onChange={handleTicketTypeChange}
              >
                <Paper sx={{ mb: 2, p: 2, border: '1px solid', borderColor: ticketType === 'Standard' ? 'primary.main' : 'divider' }}>
                  <FormControlLabel
                    value="Standard"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="subtitle1">Standard Ticket</Typography>
                        <Typography variant="body2" color="text.secondary">
                          General admission, no assigned seating
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h6" color="primary">
                            {ticketPricing ? formatCurrency(ticketPricing.standard) : 'Loading...'}
                          </Typography>
                          <Chip 
                            label={`${availableTickets.standard} available`} 
                            color={availableTickets.standard > 20 ? 'success' : availableTickets.standard > 0 ? 'warning' : 'error'}
                            size="small"
                          />
                        </Box>
                      </Box>
                    }
                    disabled={availableTickets.standard === 0}
                  />
                </Paper>
                
                <Paper sx={{ mb: 2, p: 2, border: '1px solid', borderColor: ticketType === 'Premium' ? 'primary.main' : 'divider' }}>
                  <FormControlLabel
                    value="Premium"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="subtitle1">Premium Ticket</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Reserved seating, access to refreshment area
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h6" color="primary">
                            {ticketPricing ? formatCurrency(ticketPricing.premium) : 'Loading...'}
                          </Typography>
                          <Chip 
                            label={`${availableTickets.premium} available`} 
                            color={availableTickets.premium > 10 ? 'success' : availableTickets.premium > 0 ? 'warning' : 'error'}
                            size="small"
                          />
                        </Box>
                      </Box>
                    }
                    disabled={availableTickets.premium === 0}
                  />
                </Paper>
                
                <Paper sx={{ mb: 2, p: 2, border: '1px solid', borderColor: ticketType === 'VIP' ? 'primary.main' : 'divider' }}>
                  <FormControlLabel
                    value="VIP"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="subtitle1">VIP Ticket</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Best seats, complimentary food & drinks, artist meet & greet
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h6" color="primary">
                            {ticketPricing ? formatCurrency(ticketPricing.vip) : 'Loading...'}
                          </Typography>
                          <Chip 
                            label={`${availableTickets.vip} available`} 
                            color={availableTickets.vip > 5 ? 'success' : availableTickets.vip > 0 ? 'warning' : 'error'}
                            size="small"
                          />
                        </Box>
                      </Box>
                    }
                    disabled={availableTickets.vip === 0}
                  />
                </Paper>
              </RadioGroup>
            </FormControl>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Quantity
              </Typography>
              <TextField
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                inputProps={{ min: 1, max: 10 }}
                helperText="Maximum 10 tickets per purchase"
                sx={{ width: 100 }}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              
              {event && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Event
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {event.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(event.startDate)}
                  </Typography>
                </Box>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">
                  {ticketType} Ticket
                </Typography>
                <Typography variant="body1">
                  {ticketPricing ? formatCurrency(
                    ticketType === 'Standard' ? ticketPricing.standard :
                    ticketType === 'Premium' ? ticketPricing.premium :
                    ticketPricing.vip
                  ) : 'Loading...'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">
                  Quantity
                </Typography>
                <Typography variant="body1">
                  {quantity}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Total
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  {formatCurrency(calculateTotal())}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };
  
  // Render payment details step
  const renderPaymentDetails = () => {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Payment Details
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Payment Method</FormLabel>
              <RadioGroup
                aria-label="payment-method"
                name="payment-method"
                value={paymentMethod}
                onChange={handlePaymentMethodChange}
              >
                <Paper sx={{ mb: 2, p: 2, border: '1px solid', borderColor: paymentMethod === 'credit-card' ? 'primary.main' : 'divider' }}>
                  <FormControlLabel
                    value="credit-card"
                    control={<Radio />}
                    label="Credit / Debit Card"
                  />
                </Paper>
                
                <Paper sx={{ mb: 2, p: 2, border: '1px solid', borderColor: paymentMethod === 'paypal' ? 'primary.main' : 'divider' }}>
                  <FormControlLabel
                    value="paypal"
                    control={<Radio />}
                    label="PayPal"
                  />
                </Paper>
                
                <Paper sx={{ mb: 2, p: 2, border: '1px solid', borderColor: paymentMethod === 'google-pay' ? 'primary.main' : 'divider' }}>
                  <FormControlLabel
                    value="google-pay"
                    control={<Radio />}
                    label="Google Pay"
                  />
                </Paper>
              </RadioGroup>
            </FormControl>
            
            {paymentMethod === 'credit-card' && (
              <Box sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Card Number"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      inputProps={{ maxLength: 19 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Cardholder Name"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="John Doe"
                    />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Expiry Date"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      placeholder="MM/YY"
                      inputProps={{ maxLength: 5 }}
                    />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="CVV"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      type="password"
                      inputProps={{ maxLength: 3 }}
                    />
                  </Grid>
                </Grid>
                
                <Alert severity="info" sx={{ mt: 2 }}>
                  This is a demo application. No actual payment will be processed.
                </Alert>
              </Box>
            )}
            
            {paymentMethod === 'paypal' && (
              <Box sx={{ mt: 3 }}>
                <Alert severity="info">
                  You'll be redirected to PayPal to complete your payment. (Demo only, no actual redirect)
                </Alert>
              </Box>
            )}
            
            {paymentMethod === 'google-pay' && (
              <Box sx={{ mt: 3 }}>
                <Alert severity="info">
                  You'll be prompted to select a payment method from your Google Pay account. (Demo only)
                </Alert>
              </Box>
            )}
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              
              {event && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Event
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {event.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(event.startDate)}
                  </Typography>
                </Box>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">
                  {ticketType} Ticket × {quantity}
                </Typography>
                <Typography variant="body1">
                  {formatCurrency(calculateTotal())}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Total
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  {formatCurrency(calculateTotal())}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };
  
  // Render confirmation step
  const renderConfirmation = () => {
    if (!purchaseComplete) {
      return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" gutterBottom>
            Please review your order and click "Complete Purchase" to confirm.
          </Typography>
          
          <Box sx={{ my: 4 }}>
            {isPurchasing ? (
              <CircularProgress />
            ) : (
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleCompletePurchase}
                disabled={isPurchasing}
              >
                Complete Purchase
              </Button>
            )}
          </Box>
        </Box>
      );
    }
    
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <ConfirmIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
        
        <Typography variant="h5" gutterBottom>
          Purchase Successful!
        </Typography>
        
        <Typography variant="body1" paragraph>
          Your tickets have been purchased successfully. You can view and download your tickets from your profile.
        </Typography>
        
        <Grid container spacing={3} justifyContent="center" sx={{ mt: 2 }}>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/profile')}
            >
              View My Tickets
            </Button>
          </Grid>
          
          <Grid item>
            <Button
              variant="outlined"
              onClick={() => navigate(`/events/${eventId}`)}
            >
              Return to Event
            </Button>
          </Grid>
        </Grid>
      </Box>
    );
  };
  
  // Render step content
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderTicketSelection();
      case 1:
        return renderPaymentDetails();
      case 2:
        return renderConfirmation();
      default:
        return 'Unknown step';
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Error state
  if (error || !event) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Event not found'}
        </Alert>
        <Button variant="outlined" onClick={() => navigate(`/events/${eventId}`)}>
          Back to Event
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Purchase Tickets
          </Typography>
          
          <Typography variant="h5" color="primary" gutterBottom>
            {event.title}
          </Typography>
          
          <Typography variant="body1" color="text.secondary">
            {formatDate(event.startDate)}
          </Typography>
        </Box>
        
        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {/* Step content */}
        <Paper sx={{ p: { xs: 2, md: 4 } }}>
          {getStepContent(activeStep)}
          
          {/* Navigation buttons */}
          {!purchaseComplete && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                variant="outlined"
                onClick={activeStep === 0 ? () => navigate(`/events/${eventId}`) : handleBack}
                disabled={isPurchasing}
              >
                {activeStep === 0 ? 'Back to Event' : 'Back'}
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                endIcon={<ArrowForwardIcon />}
                onClick={handleNext}
                disabled={isPurchasing || 
                  (activeStep === 0 && (
                    (ticketType === 'Standard' && availableTickets.standard === 0) ||
                    (ticketType === 'Premium' && availableTickets.premium === 0) ||
                    (ticketType === 'VIP' && availableTickets.vip === 0)
                  ))
                }
              >
                {activeStep === steps.length - 1 ? 'Complete Purchase' : 'Continue'}
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
      
      {/* Login Dialog */}
      <Dialog
        open={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
      >
        <DialogTitle>Login Required</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You need to be logged in to purchase tickets. Would you like to log in now?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => navigate(`/events/${eventId}`)}>Cancel</Button>
          <Button onClick={handleLoginRedirect} variant="contained" color="primary">
            Log In
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TicketPurchasePage;
