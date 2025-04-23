import React, { useState, useEffect, useRef } from 'react';
// We'll likely need to import Link from react-router-dom later for navigation
// import { Link } from 'react-router-dom';
import './Navbar.css'; // We'll create this CSS file next

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
      // Cleanup the event listener on component unmount
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]); // Re-run effect if isMenuOpen changes

  // Effect to handle Escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      // Cleanup the event listener on component unmount
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []); // Only run once on mount

  return (
    <>
      <span
        ref={menuIconRef}
        className="menu-icon"
        onClick={toggleMenu}
        dangerouslySetInnerHTML={{ __html: '&#x22EE;' }} // Render the vertical ellipsis HTML entity
      />
      <div id="dimmed" className={`dimmed ${isMenuOpen ? 'show' : ''}`}></div>
      <div ref={overlayRef} id="overlay" className={`overlay ${isMenuOpen ? 'show' : ''}`}>
        {/* Replace '#' with actual paths or use Link component later */}
        <a href="#" onClick={closeMenu}>Home</a>
        <a href="#" onClick={closeMenu}>Recipes</a>
        <a href="#" onClick={closeMenu}>About</a>
        <a href="#" onClick={closeMenu}>Contact</a>
        <a href="#" onClick={closeMenu}>Login</a>
      </div>
    </>
  );
}

export default Navbar;
