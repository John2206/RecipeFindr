/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  // add other env variables here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

import React, { createContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.tsx'; 
import Footer from './components/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import AboutPage from './pages/AboutPage.tsx';
import CameraPage from './pages/CameraPage.tsx';
import ContactPage from './pages/ContactPage.jsx';
import LoginPage from './pages/LoginPage.tsx'; // Use TypeScript version
import RegisterPage from './pages/RegisterPage.tsx'; // Add RegisterPage import with extension
import RecipesPage from './pages/RecipesPage.jsx';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import './index.css';

// Define the API context interface
interface APIContextType {
  baseUrl: string;
}

export const APIContext = createContext<APIContextType>({ baseUrl: 'http://localhost:5002' });

const App: React.FC = () => {
  return (
    <AuthProvider>
      <APIContext.Provider value={{ baseUrl: 'http://localhost:5002' }}>
        <Navbar />
        <main style={{ paddingTop: '60px', minHeight: 'calc(100vh - 120px)' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/camera" element={<CameraPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} /> {/* Add register route */}
            <Route path="/recipes" element={<RecipesPage />} /> {/* Make RecipesPage public */}
          </Routes>
        </main>
        <Footer />
      </APIContext.Provider>
    </AuthProvider>
  );
}

export default App;