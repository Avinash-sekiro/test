const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client using environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * @route   GET /api/activity-images
 * @desc    Get all active activity images
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // Fetch activity images from the cbse_eng_4001_assets table, excluding the instruction slide (index 0)
    const { data: activityImages, error } = await supabase
      .from('cbse_eng_4001_assets')
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

/**
 * @route   GET /api/activity-images/instructions
 * @desc    Get only the instruction slide (index 0)
 * @access  Public
 */
router.get('/instructions', async (req, res) => {
  try {
    // Fetch only the instruction slide (index 0)
    const { data: instructionSlide, error } = await supabase
      .from('cbse_eng_4001_assets')
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

/**
 * @route   GET /api/v1/activity-images/instructions
 * @desc    Get only the instruction slide (index 0)
 * @access  Public
 */
router.get('/instructions', async (req, res) => {
  try {
    // Fetch only the instruction slide (index 0)
    const { data: instructionSlide, error } = await supabase
      .from('cbse_eng_4001_assets')
      .select('*')
      .eq('is_active', true)
      .eq('order_index', 0)
      .single();
    
    if (error) {
      console.error('Error fetching instruction slide:', error);
      return res.status(500).json({ error: 'Failed to fetch instruction slide' });
    }
    
    // Process the instruction slide to include full URLs for image and audio
    // Make sure we're not duplicating URLs if they're already full URLs
    let imageUrl;
    if (instructionSlide.image_path && instructionSlide.image_path.startsWith('http')) {
      imageUrl = instructionSlide.image_path;
    } else {
      imageUrl = `${supabaseUrl}/storage/v1/object/public/ai-activity-assets/${instructionSlide.image_path}`;
    }
    
    // Process audio path similarly
    let audioUrl;
    if (instructionSlide.audio_path && instructionSlide.audio_path.startsWith('http')) {
      audioUrl = instructionSlide.audio_path;
    } else if (instructionSlide.audio_path) {
      audioUrl = `${supabaseUrl}/storage/v1/object/public/ai-activity-assets/${instructionSlide.audio_path}`;
    }
    
    const processedInstruction = {
      ...instructionSlide,
      imageUrl: imageUrl,
      audioUrl: audioUrl
    };
    
    console.log('Constructed image URL:', imageUrl);
    console.log('Constructed audio URL:', audioUrl);
    console.log('Sending instruction data:', processedInstruction);
    return res.json(processedInstruction);
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
