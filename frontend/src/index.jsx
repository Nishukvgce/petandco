import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/tailwind.css';
import './styles/index.css';

// Global hook used by ErrorBoundary to report caught errors.
// ErrorBoundary calls `window.__COMPONENT_ERROR__` when it captures an error.
window.__COMPONENT_ERROR__ = (error, errorInfo) => {
  // eslint-disable-next-line no-console
  console.error('Component error caught by ErrorBoundary:', error, errorInfo);
  
  // Only show alerts in development mode
  if (import.meta.env?.MODE === 'development') {
    try {
      // eslint-disable-next-line no-alert
      alert('A component error occurred — check the console for details.');
    } catch (e) {
      // Ignore alert errors
    }
  }
};

const container = document.getElementById('root');
if (!container) {
  console.error('Failed to find root element');
} else {
  const root = createRoot(container);
  root.render(<App />);
}