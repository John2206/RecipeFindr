import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const overlayRef = useRef(null);
  const menuIconRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Effect to handle clicks outside the menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMenuOpen &&
        overlayRef.current &&
        !overlayRef.current.contains(event.target) &&
        menuIconRef.current &&
        !menuIconRef.current.contains(event.target)
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
    const handleEscapeKey = (event) => {
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
        <Link to="/about" onClick={closeMenu}>About</Link>
        <Link to="/contact" onClick={closeMenu}>Contact</Link>
        <Link to="/login" onClick={closeMenu}>Login</Link>
      </div>
    </>
  );
}

export default Navbar;
