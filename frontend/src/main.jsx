import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import { GuestProvider } from './context/GuestContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <GuestProvider>
        <App />
      </GuestProvider>
    </ThemeProvider>
  </React.StrictMode>,
);