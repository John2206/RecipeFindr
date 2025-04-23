import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    // TODO: Implement actual login API call
    console.log('Logging in with:', { email, password });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Example: Check credentials (replace with actual API response handling)
      if (email === "user@example.com" && password === "password") {
        console.log('Login successful');
        // TODO: Handle successful login (e.g., store token, redirect)
        // Example redirect (requires useNavigate hook from react-router-dom)
        // navigate('/recipes'); 
      } else {
        setError('Invalid email or password.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container"> {/* class becomes className */}
      <h1>Login</h1>
      <form id="loginForm" onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email">Email:</label> {/* htmlFor instead of for */}
          <input 
            type="email" 
            id="email" 
            name="email" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input 
            type="password" 
            id="password" 
            name="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>
        {error && <p className="error-message">{error}</p>} {/* Display error message */}
        <button type="submit" className="btn submit-btn" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="auth-link">
        Don't have an account? <Link to="/register">Register here</Link> {/* Use Link component */}
      </p>
    </div>
  );
}

export default LoginPage;
