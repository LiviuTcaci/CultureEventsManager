import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import EventManagement from '../components/Admin/EventManagement';
import { useAuth } from '../context/AuthContext';

// TabPanel component for the admin tabs
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 1, sm: 3 } }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `admin-tab-${index}`,
    'aria-controls': `admin-tabpanel-${index}`,
  };
}

const AdminPanel: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState(0);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  // Check if user has admin permissions
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    } else if (!isLoading && isAuthenticated && user?.role !== 'Admin') {
      setAccessError('You do not have permission to access the Admin Panel');
      setShowPermissionDialog(true);
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleClosePermissionDialog = () => {
    setShowPermissionDialog(false);
    navigate('/');
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Only render admin panel for authenticated admin users
  if (!isAuthenticated || user?.role !== 'Admin') {
    return (
      <Dialog
        open={showPermissionDialog}
        onClose={handleClosePermissionDialog}
        aria-labelledby="permission-dialog-title"
      >
        <DialogTitle id="permission-dialog-title">
          Access Denied
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {accessError || 'You do not have permission to access this page. Please log in with an admin account.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePermissionDialog} color="primary" autoFocus>
            Go to Home
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Panel
        </Typography>
        
        <Paper sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="admin tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Dashboard" {...a11yProps(0)} />
              <Tab label="Event Management" {...a11yProps(1)} />
              <Tab label="Venue Management" {...a11yProps(2)} />
              <Tab label="User Management" {...a11yProps(3)} />
              <Tab label="Categories" {...a11yProps(4)} />
            </Tabs>
          </Box>
          
          {/* Dashboard Tab */}
          <TabPanel value={activeTab} index={0}>
            <Typography variant="h6" gutterBottom>
              Dashboard Overview
            </Typography>
            
            <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: 'primary.light',
                  color: 'white',
                }}
              >
                <Typography variant="h4" fontWeight="bold">24</Typography>
                <Typography variant="subtitle1">Total Events</Typography>
              </Paper>
              
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: 'success.light',
                  color: 'white',
                }}
              >
                <Typography variant="h4" fontWeight="bold">8</Typography>
                <Typography variant="subtitle1">Upcoming Events</Typography>
              </Paper>
              
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: 'secondary.light',
                  color: 'white',
                }}
              >
                <Typography variant="h4" fontWeight="bold">1,256</Typography>
                <Typography variant="subtitle1">Total Tickets Sold</Typography>
              </Paper>
            </Box>
            
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => setActiveTab(1)} // Go to Event Management tab
                >
                  Create New Event
                </Button>
                
                <Button 
                  variant="outlined"
                  onClick={() => setActiveTab(2)} // Go to Venue Management tab
                >
                  Manage Venues
                </Button>
                
                <Button 
                  variant="outlined" 
                  color="secondary"
                  onClick={() => setActiveTab(4)} // Go to Categories tab
                >
                  Manage Categories
                </Button>
              </Box>
            </Box>
            
            <Box sx={{ mt: 4 }}>
              <Alert severity="info">
                Welcome to the Admin Panel. Here you can manage events, venues, users, and more.
              </Alert>
            </Box>
          </TabPanel>
          
          {/* Event Management Tab */}
          <TabPanel value={activeTab} index={1}>
            <EventManagement />
          </TabPanel>
          
          {/* Venue Management Tab */}
          <TabPanel value={activeTab} index={2}>
            <Typography variant="h6" gutterBottom>
              Venue Management
            </Typography>
            <Alert severity="info" sx={{ mt: 2 }}>
              Venue management functionality will be implemented in a future update.
            </Alert>
          </TabPanel>
          
          {/* User Management Tab */}
          <TabPanel value={activeTab} index={3}>
            <Typography variant="h6" gutterBottom>
              User Management
            </Typography>
            <Alert severity="info" sx={{ mt: 2 }}>
              User management functionality will be implemented in a future update.
            </Alert>
          </TabPanel>
          
          {/* Categories Tab */}
          <TabPanel value={activeTab} index={4}>
            <Typography variant="h6" gutterBottom>
              Categories
            </Typography>
            <Alert severity="info" sx={{ mt: 2 }}>
              Category management functionality will be implemented in a future update.
            </Alert>
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default AdminPanel;
