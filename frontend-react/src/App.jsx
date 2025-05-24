import React, { createContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import CameraPage from './pages/CameraPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RecipesPage from './pages/RecipesPage';
import './index.css';

export const APIContext = createContext({ baseUrl: 'http://localhost:5002' });

function App() {
  return (
    <APIContext.Provider value={{ baseUrl: 'http://localhost:5000' }}>
      <Navbar />
      <main className="pt-16 min-h-[calc(100vh-120px)]">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/camera" element={<CameraPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/recipes" element={<RecipesPage />} />
        </Routes>
      </main>
      <Footer />
    </APIContext.Provider>
  );
}

export default App;
