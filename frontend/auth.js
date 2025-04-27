// Wrap everything in an IIFE to avoid polluting the global scope
const AuthService = (() => {
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
    // Note: atob is deprecated in some environments. Consider using a JWT library if possible.
    function isTokenExpired(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            // Check if expiration time exists and is in the past
            return payload.exp && payload.exp * 1000 < Date.now();
        } catch (e) {
            console.error("Failed to parse token:", e);
            return true; // Treat parsing errors as expired/invalid
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

            const data = await response.json(); // Try to parse JSON regardless of status

            if (!response.ok) {
                // Use the error message from the server response if available
                throw new Error(data.message || `Login failed with status: ${response.status}`);
            }

            authToken = data.token;
            userData = data.user;

            localStorage.setItem('authToken', authToken);
            localStorage.setItem('userData', JSON.stringify(userData));

            return data; // Return the full response data (token, user)
        } catch (error) {
            console.error("Login error:", error);
            // Re-throw the error to be handled by the caller
            throw error; // Propagate the specific error message
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

            const data = await response.json(); // Try to parse JSON regardless of status

            if (!response.ok) {
                 // Use the error message from the server response if available
                throw new Error(data.message || `Registration failed with status: ${response.status}`);
            }

            return data; // Return the server response (e.g., success message)
        } catch (error) {
            console.error("Registration error:", error);
             // Re-throw the error to be handled by the caller
            throw error; // Propagate the specific error message
        }
    }

    // Check if user is authenticated
    function isAuthenticated() {
        if (!authToken || isTokenExpired(authToken)) {
            // Only clear local state if token is actually expired or invalid
            if (authToken && isTokenExpired(authToken)) {
                console.log("Token expired, logging out.");
                logout(); // Call logout which handles clearing storage and redirection
            } else if (!authToken) {
                 // If there's no token at all, ensure local state is clear
                 // but don't necessarily redirect immediately unless intended.
                 // The page load check handles redirection for protected pages.
                 clearAuthData();
            }
            return false;
        }
        // Refresh user data from localStorage in case it was updated in another tab
        userData = JSON.parse(localStorage.getItem('userData') || 'null');
        return true;
    }

    // Get current user data
    function getCurrentUser() {
        if (!isAuthenticated()) {
            return null;
        }
        // Ensure userData is up-to-date
        if (!userData) {
             userData = JSON.parse(localStorage.getItem('userData') || 'null');
        }
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
        // Redirect to login page after clearing data
        window.location.href = 'login.html';
    }

    // Get authentication headers for API requests
    function getAuthHeaders() {
        if (!isAuthenticated()) {
             // Redirect or handle unauthenticated state appropriately
             // Throwing an error might be suitable for internal API calls
             // but consider user experience for UI interactions.
            console.warn("Attempted to get auth headers when not authenticated.");
            // Optional: redirect to login immediately
            // window.location.href = 'login.html';
            throw new Error('User not authenticated');
        }
        return {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        };
    }

    // Check authentication on page load
    document.addEventListener('DOMContentLoaded', () => {
        const protectedPages = ['displayRecipes.html', 'camera.html']; // Removed recipes.html from protected pages
        const currentPage = window.location.pathname.split('/').pop();

        // If on a protected page and not authenticated, redirect to login
        if (protectedPages.includes(currentPage) && !isAuthenticated()) {
             console.log(`Access denied to ${currentPage}, redirecting to login.`);
            window.location.href = 'login.html';
        }
        // If on login/register page and already authenticated, redirect to a default page (e.g., index or recipes)
        else if (['login.html', 'register.html'].includes(currentPage) && isAuthenticated()) {
             console.log(`Already authenticated, redirecting from ${currentPage}.`);
             window.location.href = 'index.html'; // Or 'recipes.html'
        }
    });

    // Expose public functions
    return {
        login,
        register,
        isAuthenticated,
        getCurrentUser,
        logout,
        getAuthHeaders
    };
})();

// Example of how to use the service elsewhere (if needed, though typically called via event listeners in HTML)
// AuthService.login('user', 'pass').then(...).catch(...);
// No need to export to window anymore if scripts using this are loaded after it
// and can directly access AuthService
/*
window.login = login;
window.register = register;
window.isAuthenticated = isAuthenticated;
window.getCurrentUser = getCurrentUser;
window.logout = logout;
window.getAuthHeaders = getAuthHeaders;
*/