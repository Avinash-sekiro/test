const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role are required.' });
    }
    
    // Check if role is valid
    if (!['admin', 'schools', 'demo', 'developer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be admin, schools, demo, or developer.' });
    }
    
    // Register user with Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (authError) {
      return res.status(400).json({ error: authError.message });
    }
    
    // Store user role in the database
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert([
        { user_id: authData.user.id, role }
      ]);
    
    if (roleError) {
      return res.status(500).json({ error: 'Failed to assign role to user.' });
    }
    
    res.status(201).json({ 
      message: 'User registered successfully. Please check your email for verification.',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred during registration.' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    
    // Sign in user with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (authError) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    
    // Get user role from the database
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role, display_name, n8n_link, audio_url')
      .eq('user_id', authData.user.id)
      .single();
    
    if (roleError) {
      return res.status(500).json({ error: 'Failed to get user role.' });
    }
    
    console.log('Role data from database:', roleData); // Debug: Log the role data
    
    res.status(200).json({
      message: 'Login successful.',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: roleData.role,
        display_name: roleData.display_name || '',
        n8n_link: roleData.n8n_link || '',
        audio_url: roleData.audio_url || ''
      },
      session: {
        access_token: authData.session.access_token,
        expires_at: authData.session.expires_at
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred during login.' });
  }
});

// Logout user
router.post('/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return res.status(500).json({ error: 'Failed to logout.' });
    }
    
    res.status(200).json({ message: 'Logout successful.' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred during logout.' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    // Get user from Supabase
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error) {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    
    // Get user role from the database
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role, display_name, n8n_link, audio_url')
      .eq('user_id', data.user.id)
      .single();
    
    if (roleError) {
      return res.status(500).json({ error: 'Failed to get user role.' });
    }
    
    res.status(200).json({
      user: {
        id: data.user.id,
        email: data.user.email,
        role: roleData.role,
        display_name: roleData.display_name || '',
        n8n_link: roleData.n8n_link || '',
        audio_url: roleData.audio_url || ''
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while getting user information.' });
  }
});

module.exports = router;
