// API configuration
// Dynamically determine the API URL based on the current environment
(function() {
  // Determine if we're running in production or development
  const isProduction = window.location.hostname !== 'localhost' && 
                       window.location.hostname !== '127.0.0.1';
  
  // Set the API URL based on environment
  if (isProduction) {
    // In production, use the same origin
    window.API_URL = window.location.origin;
  } else {
    // In development, use localhost:3000
    window.API_URL = 'http://localhost:3000';
  }
  
  console.log('API URL configured:', window.API_URL);
  console.log('Environment:', isProduction ? 'Production' : 'Development');
})();

// Check if user is authenticated
async function checkAuth() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return null;
  }
  
  try {
    const response = await fetch(`${window.API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      return null;
    }
    
    return token;
  } catch (error) {
    console.error('Auth check error:', error);
    return null;
  }
}
