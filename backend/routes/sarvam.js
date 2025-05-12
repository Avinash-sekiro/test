const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const multer = require('multer');
const FormData = require('form-data');

// Configure multer to accept files with field name 'file'
const upload = multer();

// Sarvam API key - should be in environment variables in production
const SARVAM_API_KEY = '7b6f6502-4025-45cc-9067-4a049ad49476';

// Text translation route
router.post('/translate', async (req, res) => {
  try {
    const { inputText, targetLanguageCode } = req.body;
    
    if (!inputText || !targetLanguageCode) {
      return res.status(400).json({ error: 'Input text and target language code are required.' });
    }

    const options = {
      method: 'POST',
      headers: {
        'api-subscription-key': SARVAM_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: inputText,
        source_language_code: "en-IN",
        target_language_code: targetLanguageCode,
        mode: "formal",
        model: "mayura:v1"
      })
    };

    const response = await fetch('https://api.sarvam.ai/translate', options);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    res.status(200).json(result);
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'An error occurred during translation.' });
  }
});

// Speech to text route
router.post('/speech-to-text', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required.' });
    }

    console.log('Received audio file:', req.file.originalname || 'unnamed', 'Size:', req.file.size, 'MIME type:', req.file.mimetype);

    // Use node's FormData instead of browser's
    const formData = new FormData();
    
    // Add the audio buffer directly
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname || 'audio.mp3',
      contentType: req.file.mimetype || 'audio/mp3',
    });
    
    // Add additional parameters that Sarvam API expects
    formData.append('model', 'saaras:v2');
    formData.append('prompt', 'sentences should be grammatically perfect.');

    console.log('Sending request to Sarvam API');
    const response = await fetch('https://api.sarvam.ai/speech-to-text-translate', {
      method: 'POST',
      headers: {
        'api-subscription-key': SARVAM_API_KEY,
        // Don't set Content-Type header, it will be set automatically by FormData with correct boundary
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Sarvam API error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Sarvam API response:', JSON.stringify(result));
    
    // Extract language code if available
    if (result.language_code) {
      console.log('Detected language code:', result.language_code);
    }
    
    // Format the response to match the client expectations
    res.status(200).json({
      text: result.transcript || '',
      language_code: result.language_code || 'en-IN'
    });
  } catch (error) {
    console.error('Speech to text error:', error);
    res.status(500).json({ error: 'An error occurred during speech to text conversion.' });
  }
});

module.exports = router;
