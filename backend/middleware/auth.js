const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    // Verify the token with Supabase
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error) {
      return res.status(403).json({ error: 'Invalid token.' });
    }
    
    req.user = data.user;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to authenticate token.' });
  }
};

// Middleware to check if user has admin role
const isAdmin = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', req.user.id)
      .single();
    
    if (error || !data || data.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to verify admin role.' });
  }
};

// Middleware to check if user has schools role
const isSchool = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', req.user.id)
      .single();
    
    if (error || !data || data.role !== 'schools') {
      return res.status(403).json({ error: 'Access denied. School role required.' });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to verify school role.' });
  }
};

// Middleware to check if user has demo role
const isDemo = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', req.user.id)
      .single();
    
    if (error || !data || data.role !== 'demo') {
      return res.status(403).json({ error: 'Access denied. Demo role required.' });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to verify demo role.' });
  }
};

module.exports = {
  authenticateToken,
  isAdmin,
  isSchool,
  isDemo
};
