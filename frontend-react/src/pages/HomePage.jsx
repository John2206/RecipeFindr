import React from 'react';
// We might need Link from react-router-dom later
// import { Link } from 'react-router-dom';

function HomePage() {
  return (
    // No need for <main> here as App.jsx will likely provide it
    <>
      <section className="hero"> {/* class becomes className */}
        <h1>Welcome to RecipeFindr</h1>
        <p>Discover and create your favorite recipes with the ingredients you already have!</p>
        {/* Use relative path for now, will become <Link> later */}
        <a href="/recipes" className="btn cta-btn">Browse Recipes</a>
      </section>

      <section className="features">
        <div className="features-container">
          <h2>What We Offer</h2>
          <div className="feature-items">
            <div className="feature">
              <h3>Personalized Recipes</h3>
              <p>Find recipes based on ingredients you already have in your kitchen.</p>
            </div>
            <div className="feature">
              <h3>Meal Planning</h3>
              <p>Create meal plans for the week with our easy-to-use tools.</p>
            </div>
            <div className="feature">
              <h3>Recipe Sharing</h3>
              <p>Share your own recipes with the community.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default HomePage;
