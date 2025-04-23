import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook for navigation

  const handleRegister = async (event) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    // TODO: Implement actual registration API call using fetch or axios
    console.log('Registering with:', { username, email, password });
    try {
      // Simulate API call (replace with actual fetch)
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      console.log('Registration successful');
      // TODO: Handle successful registration (e.g., show message, redirect to login)
      alert('Registration successful! Please log in.'); // Simple alert for now
      navigate('/login'); // Redirect to login page
    } catch (err) {
      // TODO: Improve error handling based on API response
      setError('Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container"> {/* class becomes className */}
      <h1>Create Account</h1>
      <form id="registerForm" onSubmit={handleRegister}>
        <div className="form-group">
          <label htmlFor="username">Username</label> {/* htmlFor instead of for */}
          <input 
            type="text" 
            id="username" 
            name="username" 
            required 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
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
          <label htmlFor="password">Password</label>
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
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input 
            type="password" 
            id="confirmPassword" 
            name="confirmPassword" 
            required 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />
        </div>
        {error && <p className="error-message">{error}</p>} {/* Display error message */}
        {/* Using submit-btn class for consistency, ensure it's styled in style.css */}
        <button type="submit" className="btn submit-btn" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p className="auth-link">
        Already have an account? <Link to="/login">Login</Link> {/* Use Link component */}
      </p>
    </div>
  );
}

export default RegisterPage;
