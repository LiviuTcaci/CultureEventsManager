import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import { Container, Box, CssBaseline } from '@mui/material';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100dvh',
      bgcolor: 'background.default'
    }}>
      <CssBaseline />
      <Navbar />
      <Box 
        component="main" 
        sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
        }}
      >
        {children}
      </Box>
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          bgcolor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container>
          <Box textAlign="center">
            <p>© {new Date().getFullYear()} Cultural Events Management Platform</p>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
