import React, { createContext } from 'react';
import { Routes, Route } from 'react-router-dom'; // Import Routes and Route
import Navbar from './components/Navbar'; // Import the Navbar component
import Footer from './components/Footer'; // Import the Footer component
import HomePage from './pages/HomePage'; // Import HomePage
import AboutPage from './pages/AboutPage'; // Import AboutPage
import CameraPage from './pages/CameraPage'; // Import CameraPage
import ContactPage from './pages/ContactPage'; // Import ContactPage
import LoginPage from './pages/LoginPage'; // Import LoginPage
import RecipesPage from './pages/RecipesPage'; // Import RecipesPage
// We will import other page components here
import './App.css'; // Keep App specific styles if any, or remove if not needed
import './index.css'; // Import global styles

export const APIContext = createContext({ baseUrl: 'http://localhost:5002' });

function App() {
  return (
    <APIContext.Provider value={{ baseUrl: 'http://localhost:5000' }}>
      <Navbar /> {/* Render the Navbar component */}
      <main style={{ paddingTop: '60px', minHeight: 'calc(100vh - 120px)' }}> {/* Add padding and minHeight for layout */}
        <Routes> {/* Define the routes */}
          <Route path="/" element={<HomePage />} /> {/* Route for the home page */}
          <Route path="/about" element={<AboutPage />} /> {/* Add route for AboutPage */}
          <Route path="/camera" element={<CameraPage />} /> {/* Add route for CameraPage */}
          <Route path="/contact" element={<ContactPage />} /> {/* Add route for ContactPage */}
          <Route path="/login" element={<LoginPage />} /> {/* Add route for LoginPage */}
          <Route path="/recipes" element={<RecipesPage />} /> {/* Add route for RecipesPage */}
          {/* Other routes will be added here */}
        </Routes>
      </main>
      <Footer /> {/* Render the Footer component */}
    </APIContext.Provider>
  );
}

export default App;
