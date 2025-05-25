import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-t from-[#151515] to-[#1a1a1a] text-gray-400 pt-12 pb-5 mt-20 border-t border-white/5 shadow-[0_-5px_15px_rgba(0,0,0,0.3)]">
      <div className="footer-content flex justify-around flex-wrap max-w-5xl mx-auto mb-10 px-5 gap-10">
        <div className="footer-section flex-1 min-w-[200px] mb-6">
          <h3 className="text-gray-100 text-xl mb-3 font-semibold">RecipeFindr</h3>
          <p className="text-gray-400 text-base mb-2 leading-relaxed">Your ultimate recipe discovery platform</p>
        </div>
        <div className="footer-section flex-1 min-w-[200px] mb-6">
          <h3 className="text-gray-100 text-xl mb-3 font-semibold">Quick Links</h3>
          <ul className="list-none p-0">
            <li className="mb-2"><Link to="/" className="text-gray-300 hover:text-primary transition">Home</Link></li>
            <li className="mb-2"><Link to="/recipes" className="text-gray-300 hover:text-primary transition">Recipes</Link></li>
            <li className="mb-2"><Link to="/about" className="text-gray-300 hover:text-primary transition">About</Link></li>
            <li className="mb-2"><Link to="/contact" className="text-gray-300 hover:text-primary transition">Contact</Link></li>
          </ul>
        </div>
        <div className="footer-section flex-1 min-w-[200px] mb-6">
          <h3 className="text-gray-100 text-xl mb-3 font-semibold">Connect With Us</h3>
          <div className="flex gap-4 mt-2">
            <a href="#facebook" className="text-gray-300 hover:text-primary transition">Facebook</a>
            <a href="#twitter" className="text-gray-300 hover:text-primary transition">Twitter</a>
            <a href="#instagram" className="text-gray-300 hover:text-primary transition">Instagram</a>
          </div>
        </div>
      </div>
      <div className="text-center mt-8 pt-5 border-t border-[#333]">
        <p className="text-sm text-gray-500">&copy; 2025 RecipeFindr. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
