/*******************************************************************************
 * File: src/index.js
 * Purpose: Entry point for the React application.
 *******************************************************************************/
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Optional: Global baseline styles
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);