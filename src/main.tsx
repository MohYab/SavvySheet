import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@styles/index.css';
import App from './App';

const container = document.getElementById('root');
if (!container) {
  console.error('Root element "root" not found. The application cannot start.');
  throw new Error('Root element "root" not found. Please check your HTML.');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
