import React, { createContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.tsx'; 
import Footer from './components/Footer';
import HomePage from './pages/HomePage.tsx';
import AboutPage from './pages/AboutPage.tsx';
import CameraPage from './pages/CameraPage.tsx';
import ContactPage from './pages/ContactPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import RecipesPage from './pages/RecipesPage.tsx';
import { AuthProvider } from './context/AuthContext';
import { appConfig } from './config/app';
import './App.css';
import './index.css';

// Define the API context interface
interface APIContextType {
  baseUrl: string;
}

export const APIContext = createContext<APIContextType>({ baseUrl: appConfig.apiBaseUrl });

const App: React.FC = () => {
  return (
    <AuthProvider>
      <APIContext.Provider value={{ baseUrl: appConfig.apiBaseUrl }}>
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