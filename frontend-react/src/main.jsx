import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter

// Import global styles from the original CSS file
import '../../frontend/style.css'; // Adjust path as needed

import './index.css' // Keep Vite's default index.css if it has useful resets
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> { /* Wrap App with BrowserRouter */ }
      <App />
    </BrowserRouter>
  </StrictMode>,
)
