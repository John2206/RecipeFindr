import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

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
        className="fixed top-5 right-6 text-2xl font-bold text-gray-100 cursor-pointer transition-transform duration-300 z-[1001] p-2 bg-transparent rounded-none w-auto h-auto shadow-none text-center hover:scale-110 hover:text-primary"
        onClick={toggleMenu}
        dangerouslySetInnerHTML={{ __html: '&#x22EE;' }}
      />
      <div id="dimmed" className={`fixed inset-0 bg-black bg-opacity-40 z-[1000] transition-opacity duration-300 ${isMenuOpen ? 'block opacity-100' : 'hidden opacity-0'}`}></div>
      <div ref={overlayRef} id="overlay" className={`fixed top-0 right-0 h-full w-64 bg-gray-900 z-[1001] shadow-lg flex flex-col items-start pt-20 px-8 gap-6 transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <Link to="/" className="text-lg text-gray-100 hover:text-primary transition" onClick={closeMenu}>Home</Link>
        <Link to="/recipes" className="text-lg text-gray-100 hover:text-primary transition" onClick={closeMenu}>Recipes</Link>
        <Link to="/about" className="text-lg text-gray-100 hover:text-primary transition" onClick={closeMenu}>About</Link>
        <Link to="/contact" className="text-lg text-gray-100 hover:text-primary transition" onClick={closeMenu}>Contact</Link>
        <Link to="/login" className="text-lg text-gray-100 hover:text-primary transition" onClick={closeMenu}>Login</Link>
      </div>
    </>
  );
}

export default Navbar;
