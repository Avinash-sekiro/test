require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const schoolsRoutes = require('./routes/schools');
const demoRoutes = require('./routes/demo');
const sarvamRoutes = require('./routes/sarvam');
const activityImagesRoutes = require('./routes/activity-images');
const userProfileRoutes = require('./routes/user-profile');
const { authenticateToken } = require('./middleware/auth');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Function to generate a random string
function generateRandomRoute() {
  return crypto.randomBytes(16).toString('hex');
}

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Configure CORS for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || [
        process.env.FRONTEND_URL || 'https://yourdomain.com',
        'http://localhost:8080',
        'http://127.0.0.1:8080'
      ] 
    : ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', authenticateToken, adminRoutes);
app.use('/api/v1/schools', authenticateToken, schoolsRoutes);
app.use('/api/v1/demo', authenticateToken, demoRoutes);
app.use('/api/v1/sarvam', sarvamRoutes);
app.use('/api/v1/activity-images', activityImagesRoutes); // Public endpoint for activity images
app.use('/api/v1/user-profile', userProfileRoutes); // Endpoint for user profile data

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Generate initial routes
const initialRoutes = {
  admin: process.env.NODE_ENV === 'production' ? generateRandomRoute() : 'pages/admin-dashboard.html',
  schools: process.env.NODE_ENV === 'production' ? generateRandomRoute() : 'pages/school-dashboard.html',
  assistant: process.env.NODE_ENV === 'production' ? generateRandomRoute() : 'pages/frontdesk-assistant.html'
};

// Store routes in app locals
app.locals.routes = initialRoutes;

// Log the generated routes for debugging
console.log('Generated Routes:');
console.log(`- Admin: /${app.locals.routes.admin}`);
console.log(`- Schools: /${app.locals.routes.schools}`);
console.log(`- Assistant: /${app.locals.routes.assistant}`);

// API Routes for random URL paths
app.get('/api/v1/routes', (req, res) => {
  // Return the stored routes
  res.json(app.locals.routes);
});

// Handle all dashboard routes in production mode
app.get('/:route', (req, res, next) => {
  const { route } = req.params;
  const routes = app.locals.routes || {};
  
  // Check if this is a random route we've generated
  if (process.env.NODE_ENV === 'production') {
    if (route === routes.admin) {
      return res.sendFile(path.join(__dirname, '../frontend/pages/admin-dashboard.html'));
    } else if (route === routes.schools) {
      return res.sendFile(path.join(__dirname, '../frontend/pages/school-dashboard.html'));
    } else if (route === routes.assistant) {
      return res.sendFile(path.join(__dirname, '../frontend/pages/frontdesk-assistant.html'));
    }
  }
  
  // If not a special route, continue to next middleware
  next();
});

// Root path handler for development mode
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Production mode - handle all routes
if (process.env.NODE_ENV === 'production') {
  // Handle all other routes by serving the index.html
  app.get('*', (req, res) => {
    // If it's not an API route and not one of our random routes
    if (!req.path.startsWith('/api') && 
        req.path !== `/${app.locals.routes.admin}` && 
        req.path !== `/${app.locals.routes.schools}` && 
        req.path !== `/${app.locals.routes.assistant}`) {
      
      // Check if it's a request for a file in the pages directory
      if (req.path.includes('/pages/')) {
        // Redirect to the appropriate random route
        if (req.path.includes('admin-dashboard.html')) {
          return res.redirect(`/${app.locals.routes.admin}`);
        } else if (req.path.includes('school-dashboard.html')) {
          return res.redirect(`/${app.locals.routes.schools}`);
        } else if (req.path.includes('frontdesk-assistant.html')) {
          return res.redirect(`/${app.locals.routes.assistant}`);
        }
      }
      
      // For all other paths, serve the index.html
      res.sendFile(path.join(__dirname, '../frontend/index.html'));
    }
  });
}

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('Random routes generated:');
  console.log(`Admin: /${app.locals.routes.admin}`);
  console.log(`School: /${app.locals.routes.schools}`);
  console.log(`Assistant: /${app.locals.routes.assistant}`);
});
