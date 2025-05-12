// Authentication functions

// Global variable to store routes
let appRoutes = null;

// Fetch routes from API
async function fetchRoutes() {
  try {
    console.log('Fetching routes from API:', `${window.API_URL}/api/v1/routes`);
    const response = await fetch(`${window.API_URL}/api/v1/routes`);
    
    if (response.ok) {
      const routes = await response.json();
      console.log('Routes fetched successfully:', routes);
      
      // Store routes in localStorage for offline use
      localStorage.setItem('routes', JSON.stringify(routes));
      
      return routes;
    } else {
      console.warn('Failed to fetch routes from API, status:', response.status);
      throw new Error(`Failed to fetch routes: ${response.status}`);
    }
  } catch (error) {
    console.error('Error fetching routes:', error);
    
    // Try to get routes from localStorage
    const storedRoutes = localStorage.getItem('routes');
    if (storedRoutes) {
      console.log('Using stored routes from localStorage');
      return JSON.parse(storedRoutes);
    }
    
    // Fallback to default routes
    console.log('Using default routes');
    return {
      admin: 'pages/admin-dashboard.html',
      schools: 'pages/class-activities.html',
      assistant: 'pages/frontdesk-assistant.html',
      developer: 'pages/activity_type1.html'
    };
  }
}

// Register a new user
async function registerUser(email, password, role) {
  try {
    const response = await fetch(`${window.API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, role }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }
    
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

// Login user
async function loginUser(email, password) {
  try {
    // For demo purposes, allow login with hardcoded credentials first
    if (email === 'admin@example.com' && password === 'password') {
      console.log('Logging in as admin with mock credentials');
      const mockUser = { id: '1', email: email, role: 'admin', display_name: 'Admin User', n8n_link: '', audio_url: '' };
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      // Set default persistence to false (clear auth when tab is closed)
      localStorage.setItem('persistAuth', 'false');
      // Set flag that user just logged in to prevent immediate logout
      sessionStorage.setItem('justLoggedIn', 'true');
      sessionStorage.setItem('sessionActive', 'true');
      sessionStorage.setItem('authChecked', 'true');
      redirectToRoleDashboard('admin');
      return { user: mockUser, token: 'mock-token' };
    } else if (email === 'school@example.com' && password === 'password') {
      console.log('Logging in as school with mock credentials');
      const mockUser = { id: '2', email: email, role: 'schools', display_name: 'Demo School', n8n_link: '', audio_url: 'https://n8n.prayogeek.in/webhook/demo-audio' };
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      // Set default persistence to false (clear auth when tab is closed)
      localStorage.setItem('persistAuth', 'false');
      // Set flag that user just logged in to prevent immediate logout
      sessionStorage.setItem('justLoggedIn', 'true');
      sessionStorage.setItem('sessionActive', 'true');
      sessionStorage.setItem('authChecked', 'true');
      redirectToRoleDashboard('schools');
      return { user: mockUser, token: 'mock-token' };
    } else if (email === 'assistant@example.com' && password === 'password') {
      console.log('Logging in as assistant with mock credentials');
      const mockUser = { id: '3', email: email, role: 'assistant', display_name: 'Demo Assistant', n8n_link: 'https://n8n.prayogeek.in/webhook/demo-assistant', audio_url: '' };
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      // Set default persistence to false (clear auth when tab is closed)
      localStorage.setItem('persistAuth', 'false');
      // Set flag that user just logged in to prevent immediate logout
      sessionStorage.setItem('justLoggedIn', 'true');
      sessionStorage.setItem('sessionActive', 'true');
      sessionStorage.setItem('authChecked', 'true');
      redirectToRoleDashboard('assistant');
      return { user: mockUser, token: 'mock-token' };
    } else if (email === 'developer@example.com' && password === 'password') {
      console.log('Logging in as developer with mock credentials');
      const mockUser = { id: '4', email: email, role: 'developer', display_name: 'Developer', n8n_link: '', audio_url: '' };
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      // Set default persistence to false (clear auth when tab is closed)
      localStorage.setItem('persistAuth', 'false');
      // Set flag that user just logged in to prevent immediate logout
      sessionStorage.setItem('justLoggedIn', 'true');
      sessionStorage.setItem('sessionActive', 'true');
      sessionStorage.setItem('authChecked', 'true');
      redirectToRoleDashboard('developer');
      return { user: mockUser, token: 'mock-token' };
    }
    
    // If not using mock credentials, try to authenticate with the server
    try {
      const response = await fetch(`${window.API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store user data and token in localStorage
        // Make sure all user role data is included
        const userData = {
          id: data.user.id,
          email: data.user.email,
          role: data.user.role,
          display_name: data.user.display_name || '',
          n8n_link: data.user.n8n_link || '',
          audio_url: data.user.audio_url || ''
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', data.session.access_token);
        // Set default persistence to false (clear auth when tab is closed)
        localStorage.setItem('persistAuth', 'false');
        // Set flag that user just logged in to prevent immediate logout
        sessionStorage.setItem('justLoggedIn', 'true');
        sessionStorage.setItem('sessionActive', 'true');
        sessionStorage.setItem('authChecked', 'true');
        
        // Redirect to appropriate dashboard
        redirectToRoleDashboard(userData.role);
        
        return data;
      }
    } catch (serverError) {
      console.warn('Server authentication failed:', serverError);
    }
    
    // If we get here, both mock and server auth failed
    throw new Error('Invalid email or password');
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Logout user
async function logoutUser() {
  try {
    const token = localStorage.getItem('token');
    
    // For mock authentication, just clear localStorage
    if (token === 'mock-token') {
      console.log('Logging out mock user');
    } else {
      // For real authentication, try to call logout API
      try {
        console.log('Attempting to call logout API');
        const response = await fetch(`${window.API_URL}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          console.warn(`Logout API returned ${response.status}`);
        } else {
          console.log('Logout API call successful');
        }
      } catch (apiError) {
        console.warn('Error calling logout API:', apiError);
      }
    }
    
    // Save the persistAuth setting before clearing localStorage
    const persistAuth = localStorage.getItem('persistAuth');
    
    // Clear localStorage auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Restore the persistAuth setting if it existed
    if (persistAuth) {
      localStorage.setItem('persistAuth', persistAuth);
    }
    
    // Clear cookies
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    
    // Redirect to login page
    window.location.href = '/index.html';
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if there's an error, try to clear auth data
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (e) {
      console.error('Failed to clear localStorage:', e);
    }
    
    return { success: false, error: error.message };
  }
}

// Get current user
async function getCurrentUser() {
  try {
    // Check if we have user data in localStorage
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!storedUser || !token) {
      return null;
    }
    
    // For mock authentication, just return the stored user
    if (token === 'mock-token') {
      return JSON.parse(storedUser);
    }
    
    // For real authentication, verify with the server
    try {
      const response = await fetch(`${window.API_URL}/api/v1/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      
      // IMPORTANT: Only clear localStorage if we get a specific 401 Unauthorized
      // This prevents accidental logouts due to network issues or other errors
      if (response.status === 401) {
        console.warn('Server returned 401 Unauthorized, clearing user session');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        return null;
      }
      
      // For any other non-OK response, fall back to stored user data
      if (!response.ok) {
        console.warn(`Server returned ${response.status}, using stored user data`);
        return JSON.parse(storedUser);
      }
      
      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('API returned non-JSON response:', contentType);
        // Continue with stored user data instead of failing
        return JSON.parse(storedUser);
      }
      
      const data = await response.json();
      
      // Update stored user data with latest from server
      const userData = {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        display_name: data.user.display_name || '',
        n8n_link: data.user.n8n_link || '',
        audio_url: data.user.audio_url || ''
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (apiError) {
      // Just log the error but don't affect authentication flow
      console.error('API call error:', apiError);
      // Continue with the stored user data
      return JSON.parse(storedUser);
    }
  } catch (error) {
    console.error('Get current user error:', error);
    
    // If there's an error (like network issue), use stored user data
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    return null;
  }
}

// Check if user is authenticated and redirect based on role
async function checkAuthAndRedirect() {
  try {
    // First, try to get user from localStorage directly
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    // Debug logs
    console.log('Checking auth - Token exists:', !!token);
    console.log('Checking auth - Stored user exists:', !!storedUser);
    
    // If we have stored user data, use it immediately
    if (storedUser && token) {
      const user = JSON.parse(storedUser);
      console.log('User from localStorage:', user);
      
      // Get routes (will use fallback if API fails)
      const routes = await fetchRoutes();
      
      // Check current path to determine appropriate action
      const currentPath = window.location.pathname;
      
      // If on index page, redirect to appropriate dashboard
      if (currentPath.endsWith('index.html') || currentPath === '/') {
        redirectToRoleDashboard(user.role);
        return;
      }
      
      // If on admin dashboard page, check if user has admin role
      if (currentPath.includes(routes.admin) && user.role !== 'admin') {
        console.log('User is not admin, redirecting to appropriate dashboard');
        redirectToRoleDashboard(user.role);
        return;
      }
      
      // If on school dashboard page, check if user has schools role
      if (currentPath.includes(routes.schools) && user.role !== 'schools') {
        console.log('User is not school, redirecting to appropriate dashboard');
        redirectToRoleDashboard(user.role);
        return;
      }
      
      // If on frontdesk assistant page, check if user has assistant role
      if (currentPath.includes(routes.assistant) && user.role !== 'assistant') {
        console.log('User is not assistant, redirecting to appropriate dashboard');
        redirectToRoleDashboard(user.role);
        return;
      }
      
      // For demo users, show dashboard on any page
      if (user.role === 'demo') {
        showDashboard('demo');
        return;
      }
      
      // If we're on a dashboard page and user has correct role, do nothing
      if ((currentPath.includes(routes.admin) && user.role === 'admin') ||
          (currentPath.includes(routes.schools) && user.role === 'schools') ||
          (currentPath.includes(routes.assistant) && user.role === 'assistant')) {
        console.log('User is on correct dashboard');
        return;
      }
      
      return;
    }
    
    // If no stored user or token, user is not authenticated
    console.log('User is not authenticated');
    
    // Get routes for path checking
    const routes = await fetchRoutes();
    
    // If on dashboard pages, redirect to login page
    if (window.location.pathname.includes('pages') || 
        window.location.pathname.includes(routes.admin) || 
        window.location.pathname.includes(routes.schools) || 
        window.location.pathname.includes(routes.assistant)) {
      window.location.href = '/index.html';
    } else {
      showAuthContainer();
    }
  } catch (error) {
    console.error('Auth check error:', error);
    // If error occurs, show auth container
    if (window.location.pathname.includes('pages')) {
      window.location.href = '/index.html';
    } else {
      showAuthContainer();
    }
  }
}

// Redirect to the appropriate dashboard based on user role
async function redirectToRoleDashboard(role) {
  try {
    // Check if there's a redirect URL stored in sessionStorage
    const redirectAfterLogin = sessionStorage.getItem('redirectAfterLogin');
    
    // If there is a redirect URL, use it and clear the storage
    if (redirectAfterLogin) {
      console.log('Redirecting to stored URL after login:', redirectAfterLogin);
      sessionStorage.removeItem('redirectAfterLogin');
      window.location.href = redirectAfterLogin;
      return;
    }
    
    // Otherwise proceed with normal role-based redirection
    // Fetch routes if we don't have them yet
    if (!appRoutes) {
      appRoutes = await fetchRoutes();
    }
    
    const routes = appRoutes;
    console.log('Redirecting to dashboard for role:', role);
    console.log('Available routes:', routes);
    
    let targetRoute = '';
    
    switch (role) {
      case 'admin':
        targetRoute = routes.admin;
        break;
      case 'schools':
        // Redirect schools to the class activities page
        targetRoute = 'pages/class-activities.html';
        break;
      case 'assistant':
        targetRoute = routes.assistant;
        break;
      case 'developer':
        // Redirect developers to the webhook tester page
        targetRoute = 'pages/webhook-tester.html';
        break;
      case 'demo':
        // For demo, just show the dashboard without redirecting
        showDashboard('demo');
        return;
      default:
        console.error('Unknown role:', role);
        return;
    }
    
    // Make sure the route starts with a slash if it doesn't already
    if (!targetRoute.startsWith('/')) {
      targetRoute = '/' + targetRoute;
    }
    
    console.log('Redirecting to:', targetRoute);
    
    // Check if we're already on this route
    if (window.location.pathname === targetRoute) {
      console.log('Already on target route, no redirect needed');
      return;
    }
    
    // Redirect to the target route
    window.location.href = targetRoute;
  } catch (error) {
    console.error('Redirect error:', error);
    // Fallback to default routes if there's an error
    switch (role) {
      case 'admin':
        window.location.href = '/pages/admin-dashboard.html';
        break;
      case 'schools':
        window.location.href = '/pages/class-activities.html';
        break;
      case 'assistant':
        window.location.href = '/pages/frontdesk-assistant.html';
        break;
      case 'developer':
        window.location.href = '/pages/webhook-tester.html';
        break;
    }
  }
}

// Show auth container
function showAuthContainer() {
  // Only show auth container if we're on the index page
  if (document.getElementById('authContainer')) {
    document.getElementById('authContainer').style.display = 'block';
    
    // Hide dashboard container if it exists
    const dashboardContainer = document.getElementById('dashboardContainer');
    if (dashboardContainer) {
      dashboardContainer.style.display = 'none';
    }
  }
}

// Show dashboard based on user role
function showDashboard(role) {
  // Only show dashboard if we're on the index page and not redirecting
  if (document.getElementById('dashboardContainer')) {
    const user = JSON.parse(localStorage.getItem('user'));
    console.log('User from localStorage:', user); // Debug: Log the user object from localStorage
    
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('dashboardContainer').style.display = 'block';
    
    // Update user info in dashboard
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('userRole').textContent = `Role: ${user.role}`;
    
    // Display the school name if available
    if (user.display_name) {
      console.log('Display name found:', user.display_name); // Debug: Log when display_name is found
      document.getElementById('userDisplayName').textContent = `School: ${user.display_name}`;
      document.getElementById('userDisplayName').style.display = 'inline-block';
    } else {
      console.log('No display name found in user object'); // Debug: Log when display_name is not found
      document.getElementById('userDisplayName').style.display = 'none';
    }
    
    // Hide all role dashboards
    document.querySelectorAll('.role-dashboard').forEach(dashboard => {
      dashboard.style.display = 'none';
    });
    
    // Show dashboard based on role
    switch (role) {
      case 'admin':
        document.getElementById('adminDashboard').style.display = 'block';
        break;
      case 'schools':
        document.getElementById('schoolsDashboard').style.display = 'block';
        break;
      case 'demo':
        document.getElementById('demoDashboard').style.display = 'block';
        break;
      default:
        // If role is not recognized, show auth container
        showAuthContainer();
    }
  }
}
