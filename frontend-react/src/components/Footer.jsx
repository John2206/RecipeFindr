import React from 'react';
// We might need Link from react-router-dom later for the links
// import { Link } from 'react-router-dom';
import './Footer.css'; // We'll create this CSS file next

function Footer() {
  return (
    <footer>
      <div className="footer-content"> {/* class becomes className */}
        <div className="footer-section">
          <h3>RecipeFindr</h3>
          <p>Your ultimate recipe discovery platform</p>
        </div>
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            {/* Replace href with Link component 'to' prop later */}
            <li><a href="#">Home</a></li>
            <li><a href="#">Recipes</a></li>
            <li><a href="#">About</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Connect With Us</h3>
          <div className="social-links">
            {/* Replace # with actual social media links */}
            <a href="#" className="social-link">Facebook</a>
            <a href="#" className="social-link">Twitter</a>
            <a href="#" className="social-link">Instagram</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 RecipeFindr. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
