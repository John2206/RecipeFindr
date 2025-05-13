import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <>
      <section className="hero">
        <h1>Welcome to RecipeFindr</h1>
        <p>Discover and create your favorite recipes with the ingredients you already have!</p>
        <Link to="/recipes" className="btn cta-btn">Find Recipes</Link>
      </section>

      <section className="features">
        <div className="features-container">
          <h2>What We Offer</h2>
          <div className="feature-items">
            <div className="feature">
              <h3>Find Recipes</h3>
              <p>Discover delicious recipes based on ingredients you already have at home.</p>
              <Link to="/recipes" className="btn-primary">Get Cooking</Link>
            </div>
            <div className="feature">
              <h3>AI-Powered</h3>
              <p>Our AI helps you find the perfect recipe for your available ingredients.</p>
              <Link to="/recipes" className="btn-primary">Try It Now</Link>
            </div>
            <div className="feature">
              <h3>Scan Ingredients</h3>
              <p>Use your camera to scan ingredients and get recipe suggestions.</p>
              <Link to="/camera" className="btn-primary">Scan Now</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default HomePage;
