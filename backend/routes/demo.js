const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { isDemo } = require('../middleware/auth');

// Apply demo role check to all routes in this router
router.use(isDemo);

// Get demo data
router.get('/data', async (req, res) => {
  try {
    // Get demo data from the database
    const { data, error } = await supabase
      .from('demo_data')
      .select('*')
      .limit(10);
    
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch demo data.' });
    }
    
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching demo data.' });
  }
});

// Get demo profile
router.get('/profile', async (req, res) => {
  try {
    // For demo users, we return a mock profile
    res.status(200).json({
      profile: {
        id: req.user.id,
        email: req.user.email,
        name: 'Demo User',
        role: 'demo',
        permissions: [
          'view_demo_data',
          'view_demo_profile'
        ],
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching demo profile.' });
  }
});

// View demo files
router.get('/files', async (req, res) => {
  try {
    // List files in the demo-files bucket
    const { data, error } = await supabase
      .storage
      .from('demo-files')
      .list();
    
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch demo files.' });
    }
    
    // Get public URLs for the files
    const filesWithUrls = data.map(file => {
      const { data: urlData } = supabase
        .storage
        .from('demo-files')
        .getPublicUrl(file.name);
      
      return {
        ...file,
        publicUrl: urlData.publicUrl
      };
    });
    
    res.status(200).json({ files: filesWithUrls });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching demo files.' });
  }
});

module.exports = router;
