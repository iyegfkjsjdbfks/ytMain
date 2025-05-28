import React from 'react';
import ReactDOM from 'react-dom/client';
import './src/styles.css';
import App from './App'; // Correct relative path
import { ThemeProvider } from './contexts/ThemeContext'; // Ensure correct relative path

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  // <React.StrictMode> Removed StrictMode
    <ThemeProvider> {/* Wrap App with ThemeProvider */}
      <App />
    </ThemeProvider>
  // </React.StrictMode>
);