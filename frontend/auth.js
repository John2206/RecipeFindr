// Authentication API endpoints
const API_BASE_URL = 'http://localhost:5000/api';
const AUTH_ENDPOINTS = {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    me: `${API_BASE_URL}/auth/me`
};

// Store authentication token and user data
let authToken = localStorage.getItem('authToken');
let userData = JSON.parse(localStorage.getItem('userData') || 'null');

// Check token expiration
function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
    } catch (e) {
        return true;
    }
}

// Login function
async function login(username, password) {
    try {
        const response = await fetch(AUTH_ENDPOINTS.login, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        const data = await response.json();
        authToken = data.token;
        userData = data.user;
        
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        return data;
    } catch (error) {
        throw new Error(error.message || 'Failed to login');
    }
}

// Register function
async function register(username, email, password) {
    try {
        const response = await fetch(AUTH_ENDPOINTS.register, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error(error.message || 'Failed to register');
    }
}

// Check if user is authenticated
function isAuthenticated() {
    if (!authToken || isTokenExpired(authToken)) {
        logout();
        return false;
    }
    return true;
}

// Get current user data
function getCurrentUser() {
    if (!isAuthenticated()) {
        return null;
    }
    return userData;
}

// Logout function
function logout() {
    authToken = null;
    userData = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.href = 'login.html';
}

// Get authentication headers for API requests
function getAuthHeaders() {
    if (!isAuthenticated()) {
        throw new Error('Not authenticated');
    }
    return {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
    };
}

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    const protectedPages = ['recipes.html', 'displayRecipes.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage) && !isAuthenticated()) {
        window.location.href = 'login.html';
    }
});

// Export functions
window.login = login;
window.register = register;
window.isAuthenticated = isAuthenticated;
window.getCurrentUser = getCurrentUser;
window.logout = logout;
window.getAuthHeaders = getAuthHeaders; 