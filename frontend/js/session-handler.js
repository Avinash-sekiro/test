/**
 * Session Handler
 * Handles session persistence and cleanup after login
 */

(function() {
  // Run when page loads
  document.addEventListener('DOMContentLoaded', function() {
    // Handle the justLoggedIn flag - keep it for the first navigation after login
    if (sessionStorage.getItem('justLoggedIn') === 'true') {
      console.log('Session: Just logged in, keeping session active');
      
      // We've already used the justLoggedIn flag for initial auth check,
      // now store a different flag to maintain session for this browser session
      sessionStorage.setItem('sessionActive', 'true');
      
      // Remove the justLoggedIn flag to prevent indefinite login persistence
      sessionStorage.removeItem('justLoggedIn');
    }

    // Set up event listeners to maintain session when user interacts
    function updateSessionActivity() {
      // Refresh the session active flag when user interacts with the page
      sessionStorage.setItem('sessionActive', 'true');
      sessionStorage.setItem('lastActivity', Date.now().toString());
    }

    // Add event listeners for user activity
    ['click', 'touchstart', 'mousemove', 'keypress'].forEach(function(eventType) {
      document.addEventListener(eventType, updateSessionActivity, { passive: true });
    });

    // Initialize the session activity
    updateSessionActivity();
  });
})(); 