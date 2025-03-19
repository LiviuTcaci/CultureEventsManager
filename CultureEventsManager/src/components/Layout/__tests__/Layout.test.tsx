import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from '../Layout';

describe('Layout Component', () => {
  it('renders children and navigation', () => {
    const testContent = 'Test Content';
    
    render(
      <BrowserRouter>
        <Layout>
          <div>{testContent}</div>
        </Layout>
      </BrowserRouter>
    );

    // Verify navigation elements
    expect(screen.getByText('Cultural Events')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
    expect(screen.getByText('Venues')).toBeInTheDocument();
    
    // Verify children content
    expect(screen.getByText(testContent)).toBeInTheDocument();
    
    // Verify footer
    expect(screen.getByText(/© 2025 Cultural Events Management Platform/)).toBeInTheDocument();
  });
});
