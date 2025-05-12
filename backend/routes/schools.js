const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { isSchool } = require('../middleware/auth');

// Apply school role check to all routes in this router
router.use(isSchool);

// Get school profile
router.get('/profile', async (req, res) => {
  try {
    // Get school profile from the database
    const { data, error } = await supabase
      .from('school_profiles')
      .select('*')
      .eq('user_id', req.user.id)
      .single();
    
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch school profile.' });
    }
    
    res.status(200).json({ profile: data });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching school profile.' });
  }
});

// Update school profile
router.put('/profile', async (req, res) => {
  try {
    const { name, address, contactPerson, phone, email } = req.body;
    
    // Update school profile in the database
    const { data, error } = await supabase
      .from('school_profiles')
      .upsert({
        user_id: req.user.id,
        name,
        address,
        contact_person: contactPerson,
        phone,
        email
      })
      .select()
      .single();
    
    if (error) {
      return res.status(500).json({ error: 'Failed to update school profile.' });
    }
    
    res.status(200).json({ 
      message: 'School profile updated successfully.',
      profile: data
    });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while updating school profile.' });
  }
});

// Upload school document
router.post('/documents', async (req, res) => {
  try {
    const { fileName, fileType, fileContent } = req.body;
    
    if (!fileName || !fileType || !fileContent) {
      return res.status(400).json({ error: 'File name, type, and content are required.' });
    }
    
    // Upload file to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('school-documents')
      .upload(`${req.user.id}/${fileName}`, fileContent, {
        contentType: fileType,
        upsert: true
      });
    
    if (error) {
      return res.status(500).json({ error: 'Failed to upload document.' });
    }
    
    // Get public URL for the uploaded file
    const { data: urlData } = supabase
      .storage
      .from('school-documents')
      .getPublicUrl(`${req.user.id}/${fileName}`);
    
    // Store document metadata in the database
    const { error: metadataError } = await supabase
      .from('school_documents')
      .insert({
        user_id: req.user.id,
        file_name: fileName,
        file_type: fileType,
        file_path: data.path,
        public_url: urlData.publicUrl
      });
    
    if (metadataError) {
      return res.status(500).json({ error: 'Failed to store document metadata.' });
    }
    
    res.status(201).json({
      message: 'Document uploaded successfully.',
      document: {
        fileName,
        fileType,
        publicUrl: urlData.publicUrl
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while uploading document.' });
  }
});

// Get school documents
router.get('/documents', async (req, res) => {
  try {
    // Get document metadata from the database
    const { data, error } = await supabase
      .from('school_documents')
      .select('*')
      .eq('user_id', req.user.id);
    
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch documents.' });
    }
    
    res.status(200).json({ documents: data });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching documents.' });
  }
});

// Delete school document
router.delete('/documents/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    
    // Get document metadata from the database
    const { data, error } = await supabase
      .from('school_documents')
      .select('file_path')
      .eq('id', documentId)
      .eq('user_id', req.user.id)
      .single();
    
    if (error) {
      return res.status(404).json({ error: 'Document not found.' });
    }
    
    // Delete file from Supabase Storage
    const { error: storageError } = await supabase
      .storage
      .from('school-documents')
      .remove([data.file_path]);
    
    if (storageError) {
      return res.status(500).json({ error: 'Failed to delete document from storage.' });
    }
    
    // Delete document metadata from the database
    const { error: metadataError } = await supabase
      .from('school_documents')
      .delete()
      .eq('id', documentId);
    
    if (metadataError) {
      return res.status(500).json({ error: 'Failed to delete document metadata.' });
    }
    
    res.status(200).json({ message: 'Document deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while deleting document.' });
  }
});

module.exports = router;
