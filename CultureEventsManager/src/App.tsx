import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import Layout from './components/Layout/Layout';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages
import Home from './pages/Home';
import EventsPage from './pages/EventsPage';
import EventDetailsPage from './pages/EventDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPanel from './pages/AdminPanel';
import ProfilePage from './pages/ProfilePage';
import TicketPurchasePage from './pages/TicketPurchasePage';
import VenuesPage from './pages/VenuesPage';
import './App.css';
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <NotificationProvider>
            <Layout>
              <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:eventId" element={<EventDetailsPage />} />
              <Route path="/events/:eventId/tickets" element={<TicketPurchasePage />} />
              <Route path="/venues" element={<VenuesPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected routes - require authentication */}
              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
              
              {/* Admin routes - require admin role */}
              <Route element={<ProtectedRoute requiredRole="Admin" />}>
                <Route path="/admin" element={<AdminPanel />} />
              </Route>
              
              {/* Fallback route for any other paths to redirect to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
