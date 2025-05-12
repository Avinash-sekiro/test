/**
 * Session Manager
 * Handles session persistence and inactivity timeout
 */

// Configuration
const SESSION_STORAGE_KEY = 'sessionActive';
const SESSION_TIMESTAMP_KEY = 'sessionTimestamp';
const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds
let inactivityTimer;

/**
 * Initialize the session manager
 * This should be called when the page loads
 */
function initSessionManager() {
  console.log('Initializing session manager');
  
  // Get the current timestamp
  const currentTimestamp = Date.now();
  
  // Get the stored session timestamp (if any)
  const storedTimestamp = localStorage.getItem(SESSION_TIMESTAMP_KEY);
  
  // Check if this is a new session
  const isNewSession = !sessionStorage.getItem(SESSION_STORAGE_KEY);
  
  // Mark this tab/window as initialized
  sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
  
  // Store the current timestamp in localStorage
  localStorage.setItem(SESSION_TIMESTAMP_KEY, currentTimestamp.toString());
  
  // If this is a new session, check if we need to clear authentication
  if (isNewSession) {
    console.log('New browser session detected, checking authentication');
    const shouldPersistAuth = localStorage.getItem('persistAuth') === 'true';
    
    if (!shouldPersistAuth) {
      console.log('Auth persistence disabled, clearing authentication data');
      // Clear authentication data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } else {
      console.log('Auth persistence enabled, keeping authentication data');
    }
  }
  
  // Start the inactivity timer
  resetInactivityTimer();
  
  // Add event listeners for user activity
  document.addEventListener('mousemove', onUserActivity);
  document.addEventListener('keypress', onUserActivity);
  document.addEventListener('click', onUserActivity);
  document.addEventListener('scroll', onUserActivity);
  document.addEventListener('touchstart', onUserActivity);
}

/**
 * Reset the inactivity timer
 */
function resetInactivityTimer() {
  // Clear any existing timer
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }
  
  // Set a new timer
  inactivityTimer = setTimeout(logoutDueToInactivity, INACTIVITY_TIMEOUT);
}

/**
 * Handle user activity events
 */
function onUserActivity() {
  resetInactivityTimer();
}

/**
 * Logout due to inactivity
 */
function logoutDueToInactivity() {
  console.log('User inactive for too long, logging out');
  
  // Show a message to the user
  if (typeof showToast === 'function') {
    showToast('You have been logged out due to inactivity');
  } else {
    alert('You have been logged out due to inactivity');
  }
  
  // Perform logout
  logoutUser();
}

/**
 * Set whether authentication should persist between sessions
 * @param {boolean} shouldPersist - Whether auth should persist
 */
function setPersistAuth(shouldPersist) {
  localStorage.setItem('persistAuth', shouldPersist ? 'true' : 'false');
}

/**
 * Get the current persistence setting
 * @returns {boolean} Whether auth is set to persist
 */
function getPersistAuth() {
  return localStorage.getItem('persistAuth') === 'true';
}

// Export functions
window.sessionManager = {
  init: initSessionManager,
  setPersistAuth,
  getPersistAuth,
  resetInactivityTimer
};
