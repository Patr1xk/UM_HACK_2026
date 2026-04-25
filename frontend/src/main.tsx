import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Simple Error Boundary to help catch and display issues immediately
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  state: { hasError: boolean, error: Error | null } = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#0a0a0a', color: '#ef4444', fontFamily: 'monospace', height: '100vh', overflow: 'auto' }}>
          <h2>Application Crashed</h2>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px', color: '#f87171' }}>
            {this.state.error && this.state.error.toString()}
            <br /><br />
            {this.state.error && this.state.error.stack}
          </details>
        </div>
      );
    }
    return (this as any).props.children; 
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

