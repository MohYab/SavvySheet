import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'styles/index.css';
import App from './App';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found. Make sure index.html has a <div id="root"></div>');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
