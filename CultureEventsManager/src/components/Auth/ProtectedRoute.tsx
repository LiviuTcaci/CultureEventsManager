import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

// Define props for the ProtectedRoute component
interface ProtectedRouteProps {
  requiredRole?: 'User' | 'Organizer' | 'Admin';
}

/**
 * A component that protects routes requiring authentication
 * It will redirect to the login page if the user is not authenticated
 * If a required role is specified, it will check if the user has that role
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // If authentication is still loading, show a loading indicator
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100dvh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a specific role is required, check if the user has that role
  if (requiredRole && user?.role !== requiredRole) {
    // If the role requirement is Admin, only admin can access
    if (requiredRole === 'Admin' && user?.role !== 'Admin') {
      return <Navigate to="/" replace />;
    }

    // If the role requirement is Organizer, both organizer and admin can access
    if (requiredRole === 'Organizer' && user?.role !== 'Organizer' && user?.role !== 'Admin') {
      return <Navigate to="/" replace />;
    }
  }

  // User is authenticated and has the required role, render the protected route
  return <Outlet />;
};

export default ProtectedRoute;
