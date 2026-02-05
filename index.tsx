import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Service Worker registratie voor iPad installatie
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Registreer de sw.js die in de public folder staat
    navigator.serviceWorker.register('/sw.js').then(reg => {
      console.log('SW registered successfully');
    }).catch(err => {
      console.log('SW registration failed: ', err);
    });
  });
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);