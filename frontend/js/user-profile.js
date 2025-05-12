// User Profile Utility Functions

/**
 * Fetches the user's profile data from the server
 * @returns {Promise<Object>} User profile data
 */
async function fetchUserProfile() {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    // For mock authentication, use stored data
    if (token === 'mock-token') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        
        // Store audio URL in global variable if available
        if (userData.audio_url) {
          window.userAudioUrl = userData.audio_url;
          console.log('Stored audio URL from mock auth:', userData.audio_url);
        }
        
        return userData;
      }
      throw new Error('No user data found');
    }
    
    // For real authentication, fetch from server
    let data;
    try {
      // Use relative URL to avoid CORS issues
      console.log('Attempting to fetch user profile from API...');
      const response = await fetch('/api/v1/user-profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        console.warn(`User profile API returned ${response.status}, using stored data instead`);
        // Don't throw, just fall back to stored data
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : {};
      }
      
      // If we get here, the response was successful
      console.log('Successfully fetched user profile from API');
      data = await response.json();
    } catch (apiError) {
      console.warn('Error accessing user profile API, using stored data:', apiError);
      // Don't rethrow, just fall back to stored data
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : {};
    }
    
    // Store audio URL in global variable if available
    if (data.profile && data.profile.audio_url) {
      window.userAudioUrl = data.profile.audio_url;
      console.log('Stored audio URL from API:', data.profile.audio_url);
    }
    
    // Update the stored user data with the latest profile
    localStorage.setItem('user', JSON.stringify(data.profile));
    
    return data.profile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    
    // Fall back to stored user data if available
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      
      // Store audio URL in global variable if available
      if (userData.audio_url) {
        window.userAudioUrl = userData.audio_url;
        console.log('Stored audio URL from localStorage fallback:', userData.audio_url);
      }
      
      return userData;
    }
    
    throw error;
  }
}

/**
 * Gets the user's display name
 * @returns {string} User's display name or empty string
 */
function getUserDisplayName() {
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      return user.display_name || '';
    }
    return '';
  } catch (error) {
    console.error('Error getting display name:', error);
    return '';
  }
}

/**
 * Gets the user's n8n webhook link
 * @returns {string} User's n8n link or empty string
 */
function getUserN8nLink() {
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      return user.n8n_link || '';
    }
    return '';
  } catch (error) {
    console.error('Error getting n8n link:', error);
    return '';
  }
}

/**
 * Gets the user's audio URL
 * @returns {string} User's audio URL or empty string
 */
function getUserAudioUrl() {
  try {
    // First check if we have it in the global variable
    if (window.userAudioUrl) {
      return window.userAudioUrl;
    }
    
    // Otherwise check localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const audioUrl = user.audio_url || '';
      
      // Store in global variable for future use
      if (audioUrl) {
        window.userAudioUrl = audioUrl;
      }
      
      return audioUrl;
    }
    return '';
  } catch (error) {
    console.error('Error getting audio URL:', error);
    return '';
  }
}

/**
 * Gets the user's role
 * @returns {string} User's role or empty string
 */
function getUserRole() {
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      return user.role || '';
    }
    return '';
  } catch (error) {
    console.error('Error getting user role:', error);
    return '';
  }
}

/**
 * Checks if a user is currently logged in
 * @returns {boolean} True if user is logged in, false otherwise
 */
function isUserLoggedIn() {
  try {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      return false;
    }
    
    // For additional validation, check if the stored user has a role
    try {
      const user = JSON.parse(storedUser);
      return !!user.role; // Convert to boolean - true if role exists and is not empty
    } catch (parseError) {
      console.error('Error parsing stored user:', parseError);
      return false;
    }
  } catch (error) {
    console.error('Error checking login status:', error);
    return false;
  }
}

/**
 * Redirects to login page if user is not logged in
 * @param {string} [redirectPath] - Optional path to redirect to after login
 * @returns {boolean} True if user is logged in, false if redirected
 */
function requireLogin(redirectPath) {
  if (!isUserLoggedIn()) {
    // User is not logged in, redirect to login page
    const currentPath = window.location.pathname;
    const redirectUrl = redirectPath || currentPath;
    
    // Store the redirect URL in sessionStorage
    sessionStorage.setItem('redirectAfterLogin', redirectUrl);
    
    // Redirect to login page
    window.location.href = '../index.html';
    return false;
  }
  
  // User is logged in
  return true;
}

// Export functions
window.userProfile = {
  fetchUserProfile,
  getUserDisplayName,
  getUserN8nLink,
  getUserAudioUrl,
  getUserRole,
  isUserLoggedIn,
  requireLogin
};
