/**
 * Auth Check Utility
 * 
 * A lightweight script that can be included in any page to check if a user is logged in.
 * This script should be included before any other scripts that depend on authentication.
 */

(function() {
  // Run immediately when the script loads
  function checkAuth() {
    try {
      // Check for token and user in localStorage
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      // Check if this is a new browser session (tab was closed and reopened)
      const isNewSession = !sessionStorage.getItem('authChecked');
      const persistAuth = localStorage.getItem('persistAuth') === 'true';
      
      // Mark that auth has been checked in this session
      sessionStorage.setItem('authChecked', 'true');
      
      // Check if this is a direct login (coming from login page)
      const isDirectLogin = document.referrer.includes('index.html') || sessionStorage.getItem('justLoggedIn') === 'true';
      
      // If this is a new session and auth should not persist, clear auth data
      // BUT skip this check if user just logged in
      if (isNewSession && !persistAuth && !isDirectLogin) {
        console.log('Auth check: New session detected and persistence disabled, clearing auth');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        redirectToLogin();
        return false;
      }
      
      if (!token || !storedUser) {
        console.log('Auth check: No valid session found, redirecting to login');
        redirectToLogin();
        return false;
      }
      
      // Validate user object
      try {
        const user = JSON.parse(storedUser);
        if (!user.role) {
          console.log('Auth check: Invalid user data, redirecting to login');
          redirectToLogin();
          return false;
        }
      } catch (parseError) {
        console.error('Auth check: Error parsing user data', parseError);
        redirectToLogin();
        return false;
      }
      
      // User is authenticated
      console.log('Auth check: User is authenticated');
      return true;
    } catch (error) {
      console.error('Auth check: Error checking authentication', error);
      redirectToLogin();
      return false;
    }
  }
  
  // Helper function to redirect to login page
  function redirectToLogin() {
    // Store current path for redirect after login
    const currentPath = window.location.pathname;
    sessionStorage.setItem('redirectAfterLogin', currentPath);
    
    // Get the relative path to the index.html file
    const pathToRoot = currentPath.split('/').filter(Boolean).map(() => '..').join('/') || '.';
    window.location.href = `${pathToRoot}/index.html`;
  }
  
  // Expose the checkAuth function globally
  window.authCheck = {
    isAuthenticated: checkAuth,
    redirectToLogin: redirectToLogin
  };
  
  // Run the check automatically unless disabled
  const noAutoCheck = document.currentScript?.getAttribute('data-no-auto-check') === 'true';
  if (!noAutoCheck) {
    // Slight delay to ensure the DOM is ready
    setTimeout(checkAuth, 0);
  }
})();
