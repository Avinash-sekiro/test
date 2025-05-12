const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

// Get user profile data
router.get('/', authenticateToken, async (req, res) => {
  try {
    // User ID is attached by the authenticateToken middleware
    const userId = req.user.id;
    
    // Get user role data from the database
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role, display_name, n8n_link, audio_url')
      .eq('user_id', userId)
      .single();
    
    if (roleError) {
      return res.status(404).json({ error: 'User profile not found.' });
    }
    
    res.status(200).json({
      profile: {
        id: userId,
        email: req.user.email,
        role: roleData.role,
        display_name: roleData.display_name || '',
        n8n_link: roleData.n8n_link || '',
        audio_url: roleData.audio_url || ''
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'An error occurred while fetching user profile.' });
  }
});

module.exports = router;
