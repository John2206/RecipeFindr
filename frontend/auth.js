// Authentication Service
const API_URL = "http://localhost:5002"; // NEW: Use correct backend port
const API_BASE = `${API_URL}/api`;
const AUTH_ENDPOINTS = {
    login: `${API_BASE}/auth/login`,
    register: `${API_BASE}/auth/register`
};

// Set up auth service as a module with closure
const AuthService = (function() {
    // Private variables
    let authToken = localStorage.getItem('authToken') || null;
    let userData = JSON.parse(localStorage.getItem('userData') || 'null');
    
    // Check if the token is valid and not expired
    function isTokenValid(token) {
        if (!token) return false;
        
        try {
            // Basic check if the token has at least 3 parts
            const parts = token.split('.');
            if (parts.length !== 3) return false;
            
            // The JWT payload is encoded in base64, decode and check expiration
            const payload = JSON.parse(atob(parts[1]));
            const expiryTime = payload.exp * 1000; // Convert to milliseconds
            return Date.now() < expiryTime;
        } catch (error) {
            console.error('Error validating token:', error);
            return false;
        }
    }
    
    // Login function - simplified to use only username
    async function login(username, password) {
        try {
            const response = await fetch(AUTH_ENDPOINTS.login, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                // Only using username now
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `Login failed with status: ${response.status}`);
            }
            
            authToken = data.token;
            userData = data.user;
            
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('userData', JSON.stringify(userData));
            
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }
    
    // Register function - simplified without email
    async function register(username, password) {
        try {
            const response = await fetch(AUTH_ENDPOINTS.register, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `Registration failed with status: ${response.status}`);
            }
            
            authToken = data.token;
            userData = data.user;
            
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('userData', JSON.stringify(userData));
            
            return data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }
    
    // Check if user is authenticated
    function isAuthenticated() {
        return isTokenValid(authToken);
    }
    
    // Get current user data
    function getCurrentUser() {
        return userData;
    }
    
    // Function to clear auth data without redirecting
    function clearAuthData() {
        authToken = null;
        userData = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
    }
    
    // Logout function
    function logout() {
        clearAuthData();
        // Redirect to home or login page
        window.location.href = 'index.html';
    }
    
    // Get authentication headers for API requests
    function getAuthHeaders() {
        if (!isAuthenticated()) {
            return {}; // Return empty object if not authenticated
        }
        
        return {
            'Authorization': `Bearer ${authToken}`
        };
    }
    
    // Check authentication on page load
    document.addEventListener('DOMContentLoaded', () => {
        const protectedPages = ['camera.html']; // Removed displayRecipe.html and recipes.html from protected pages
        const currentPage = window.location.pathname.split('/').pop();
        
        // If on a protected page and not authenticated, redirect to login
        if (protectedPages.includes(currentPage) && !isAuthenticated()) {
            console.log(`Access denied to ${currentPage}, redirecting to login.`);
            window.location.href = 'login.html';
        }
        // If on login/register page and already authenticated, redirect to a default page
        else if (['login.html', 'register.html'].includes(currentPage) && isAuthenticated()) {
            console.log('Already authenticated, redirecting to home.');
            window.location.href = 'index.html';
        }
    });
    
    // Public API
    return {
        login,
        register,
        logout,
        isAuthenticated,
        getCurrentUser,
        getAuthHeaders
    };
})();

// Set up login form handler
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            try {
                await AuthService.login(username, password);
                // Redirect after successful login
                window.location.href = 'index.html';
            } catch (error) {
                alert(`Login failed: ${error.message}`);
            }
        });
    }
    
    // Set up register form handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                alert('Passwords do not match.');
                return;
            }
            
            try {
                await AuthService.register(username, password);
                // Redirect after successful registration
                window.location.href = 'index.html';
            } catch (error) {
                alert(`Registration failed: ${error.message}`);
            }
        });
    }
});