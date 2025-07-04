import { StrictMode } from 'react';

import ReactDOM from 'react-dom/client';

import './src/styles.css';
import App from './App';

// Essential fix: Force enable pointer events globally to prevent click issues
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    * { pointer-events: auto !important; }
    button, [role="button"] { cursor: pointer !important; pointer-events: auto !important; }
  `;
  document.head.appendChild(style);
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
