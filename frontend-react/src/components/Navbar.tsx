import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Use AuthContext instead of direct auth service
import './Navbar.css';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const menuIconRef = useRef<HTMLSpanElement>(null);
  const navigate = useNavigate();
  
  // Use AuthContext hook instead of direct auth service calls
  const { isAuthenticated, currentUser, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
    closeMenu();
  };

  // Effect to handle clicks outside the menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        isMenuOpen &&
        overlayRef.current &&
        !overlayRef.current.contains(event.target as Node) &&
        menuIconRef.current &&
        !menuIconRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Effect to handle Escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  return (
    <>
      <span
        ref={menuIconRef}
        className="menu-icon"
        onClick={toggleMenu}
        dangerouslySetInnerHTML={{ __html: '&#x22EE;' }}
      />
      <div id="dimmed" className={`dimmed ${isMenuOpen ? 'show' : ''}`}></div>
      <div ref={overlayRef} id="overlay" className={`overlay ${isMenuOpen ? 'show' : ''}`}>
        <Link to="/" onClick={closeMenu}>Home</Link>
        <Link to="/recipes" onClick={closeMenu}>Recipes</Link>
        {isAuthenticated && <Link to="/camera" onClick={closeMenu}>Camera</Link>}
        <Link to="/about" onClick={closeMenu}>About</Link>
        <Link to="/contact" onClick={closeMenu}>Contact</Link>
        
        {isAuthenticated ? (
          <>
            <span className="username">Hello, {(currentUser as { username?: string })?.username || 'User'}</span>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={closeMenu}>Login</Link>
            <Link to="/register" onClick={closeMenu}>Register</Link>
          </>
        )}
      </div>
    </>
  );
};

export default Navbar;