# Authentication Flow Documentation

This document maps the complete authentication flow from login to dashboard display, including function calls and database interactions.

## 1. Login Process

### Frontend Login Form Submission
**File:** `frontend/js/auth.js`

```
User enters credentials → loginUser(email, password) → API call to backend
```

**Function Details:**
```javascript
// Login user function (frontend/js/auth.js)
async function loginUser(email, password) {
  // For demo purposes, hardcoded credentials are checked first
  // Then API call is made for real authentication
  
  const response = await fetch(`${window.API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  // Store user data and token in localStorage
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('token', token);
  
  // Redirect based on role
  redirectToRoleDashboard(user.role);
}
```

### Backend Authentication
**File:** `backend/routes/auth.js`

```
POST /login → Supabase authentication → Fetch user role → Return token and user data
```

**Function Details:**
```javascript
// Login route (backend/routes/auth.js)
router.post('/login', async (req, res) => {
  // Sign in user with Supabase
  const { data: authData } = await supabase.auth.signInWithPassword({
    email, password
  });
  
  // Get user role from database
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role, display_name')
    .eq('user_id', authData.user.id)
    .single();
  
  // Return user data and session token
  res.status(200).json({
    user: {
      id: authData.user.id,
      email: authData.user.email,
      role: roleData.role,
      display_name: roleData.display_name
    },
    session: {
      access_token: authData.session.access_token
    }
  });
});
```

## 2. Role-Based Redirection

**File:** `frontend/js/auth.js`

```
loginUser() → redirectToRoleDashboard(role) → Appropriate dashboard page
```

**Function Details:**
```javascript
// Redirect based on role (frontend/js/auth.js)
async function redirectToRoleDashboard(role) {
  // Fetch application routes
  const routes = await fetchRoutes();
  
  // Redirect to appropriate dashboard
  if (role === 'admin') {
    window.location.href = routes.admin || 'pages/admin-dashboard.html';
  } else if (role === 'schools') {
    window.location.href = routes.schools || 'pages/school-dashboard.html';
  } else if (role === 'assistant') {
    window.location.href = routes.assistant || 'pages/frontdesk-assistant.html';
  } else {
    // Default fallback
    window.location.href = '../index.html';
  }
}
```

## 3. Dashboard Initialization

### Admin Dashboard
**File:** `frontend/pages/admin-dashboard.html`

```html
<!-- Dashboard initialization -->
<script>
  document.addEventListener('DOMContentLoaded', () => {
    // Check authentication and initialize dashboard
    checkAuthAndRedirect();
    loadAdminDashboard();
  });
</script>
```

### Authentication Check
**File:** `frontend/js/auth.js`

```
checkAuthAndRedirect() → getCurrentUser() → Verify token → Check role permissions
```

**Function Details:**
```javascript
// Check authentication (frontend/js/auth.js)
async function checkAuthAndRedirect() {
  const user = await getCurrentUser();
  
  if (!user) {
    // Not authenticated, redirect to login
    window.location.href = '../index.html';
    return;
  }
  
  // Check if user has permission for this page
  const currentPage = window.location.pathname.split('/').pop();
  
  // Verify user has correct role for the page
  if ((currentPage === 'admin-dashboard.html' && user.role !== 'admin') ||
      (currentPage === 'school-dashboard.html' && user.role !== 'schools') ||
      (currentPage === 'frontdesk-assistant.html' && user.role !== 'assistant')) {
    // Redirect to appropriate dashboard
    redirectToRoleDashboard(user.role);
  }
}
```

### Get Current User
**File:** `frontend/js/auth.js`

```
getCurrentUser() → Check localStorage → Verify with backend → Return user data
```

**Function Details:**
```javascript
// Get current user (frontend/js/auth.js)
async function getCurrentUser() {
  // Check if user data exists in localStorage
  const userData = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  
  if (!userData || !token) {
    return null;
  }
  
  try {
    // Verify token with backend
    const response = await fetch(`${window.API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      // Token invalid, clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return null;
    }
    
    return JSON.parse(userData);
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}
```

## 4. Dashboard Data Loading

### Admin Dashboard Data
**File:** `frontend/js/dashboard.js`

```
loadAdminDashboard() → getAdminDashboardData() → updateDashboardUI()
```

**Function Details:**
```javascript
// Get admin dashboard data (frontend/js/dashboard.js)
async function getAdminDashboardData() {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${window.API_URL}/admin/dashboard`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return await response.json();
}
```

### School Dashboard Data
**File:** `frontend/js/school.js`

```
checkSchoolAuth() → loadSchoolDashboardData() → updateSchoolUI()
```

**Function Details:**
```javascript
// Check school authentication (frontend/js/school.js)
async function checkSchoolAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    // Redirect to login page if not authenticated
    window.location.href = '../index.html';
    return;
  }
  
  // Check if user has schools role
  if (user.role !== 'schools') {
    // Redirect to appropriate dashboard based on role
    redirectToRoleDashboard(user.role);
    return;
  }
  
  // Update user info in dashboard
  document.getElementById('userEmail').textContent = user.email;
  
  // Load dashboard data
  loadSchoolDashboardData();
}
```

## 5. Database Interactions

### Supabase Tables
- `auth.users`: Built-in Supabase auth table
- `user_roles`: Custom table storing user roles and display names
- Role-specific tables (admin_data, school_profiles, etc.)

### Data Fetching Pattern
1. Frontend makes authenticated API call with token
2. Backend verifies token and user permissions
3. Backend queries Supabase with appropriate filters
4. Data is returned to frontend
5. UI is updated with the fetched data

## 6. Complete Authentication Flow Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Login Form     │     │  Backend Auth   │     │   Supabase      │
│  (index.html)   │────▶│  (auth.js)      │────▶│   Database      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                      │                        │
         │                      │                        │
         │                      │                        │
         ▼                      ▼                        │
┌─────────────────┐     ┌─────────────────┐             │
│  Auth Functions │     │  Token & User   │◀────────────┘
│  (auth.js)      │◀────│  Data Response  │
└─────────────────┘     └─────────────────┘
         │
         │
         ▼
┌─────────────────┐
│  Role-based     │
│  Redirection    │
└─────────────────┘
         │
         │
         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Dashboard      │     │  Dashboard.js   │     │   Backend API   │
│  HTML Page      │────▶│  Functions      │────▶│   Endpoints     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                      │                        │
         │                      │                        │
         │                      │                        │
         ▼                      ▼                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  UI Updates     │     │  Data Processing│     │   Supabase      │
│  DOM Rendering  │◀────│  & State Mgmt   │◀────│   Queries       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## 7. Function Call Sequence

1. User submits login form
2. `loginUser(email, password)` in auth.js is called
3. API call to backend `/auth/login` endpoint
4. Backend authenticates with Supabase
5. Token and user data returned to frontend
6. `redirectToRoleDashboard(role)` redirects to appropriate dashboard
7. Dashboard page loads and runs `DOMContentLoaded` event
8. `checkAuthAndRedirect()` verifies authentication
9. `getCurrentUser()` checks token validity
10. Role-specific dashboard loading function is called
11. Dashboard data is fetched from backend
12. UI is updated with user data and dashboard content
