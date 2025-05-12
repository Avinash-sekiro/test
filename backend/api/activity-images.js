// Backend API for handling Supabase activity images
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase configuration - stored securely in environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// API endpoint to get activity images
app.get('/api/activity-images', async (req, res) => {
  try {
    // Fetch activity images from the cbse_eng_4001 table, excluding the instruction slide (index 0)
    const { data: activityImages, error } = await supabase
      .from('cbse_eng_4001')
      .select('*')
      .eq('is_active', true)
      .gt('order_index', 0) // Skip the instruction slide (index 0)
      .order('order_index', { ascending: true });
    
    if (error) {
      console.error('Error fetching activity images:', error);
      return res.status(500).json({ error: 'Failed to fetch activity images' });
    }
    
    // Process the images to include full URLs
    const processedImages = activityImages.map(activity => ({
      ...activity,
      imageUrl: `${supabaseUrl}/storage/v1/object/public/ai-activity-assets/${activity.image_path}`
    }));
    
    return res.json(processedImages);
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint to get only the instruction slide (index 0)
app.get('/api/activity-instructions', async (req, res) => {
  try {
    // Fetch only the instruction slide (index 0)
    const { data: instructionSlide, error } = await supabase
      .from('cbse_eng_4001')
      .select('*')
      .eq('is_active', true)
      .eq('order_index', 0)
      .single();
    
    if (error) {
      console.error('Error fetching instruction slide:', error);
      return res.status(500).json({ error: 'Failed to fetch instruction slide' });
    }
    
    // Process the instruction slide to include full URL
    const processedInstruction = {
      ...instructionSlide,
      imageUrl: `${supabaseUrl}/storage/v1/object/public/ai-activity-assets/${instructionSlide.image_path}`
    };
    
    return res.json(processedInstruction);
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
