const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { isAdmin } = require('../middleware/auth');

// Apply admin role check to all routes in this router
router.use(isAdmin);

// Get all users
router.get('/users', async (req, res) => {
  try {
    // Get all users from the user_roles table
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        role,
        created_at
      `);
    
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch users.' });
    }
    
    res.status(200).json({ users: data });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching users.' });
  }
});

// Update user role
router.put('/users/:userId/role', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    if (!role) {
      return res.status(400).json({ error: 'Role is required.' });
    }
    
    // Check if role is valid
    if (!['admin', 'schools', 'demo'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be admin, schools, or demo.' });
    }
    
    // Update user role in the database
    const { error } = await supabase
      .from('user_roles')
      .update({ role })
      .eq('user_id', userId);
    
    if (error) {
      return res.status(500).json({ error: 'Failed to update user role.' });
    }
    
    res.status(200).json({ message: 'User role updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while updating user role.' });
  }
});

// Delete user
router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Delete user role from the database
    const { error: roleError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);
    
    if (roleError) {
      return res.status(500).json({ error: 'Failed to delete user role.' });
    }
    
    // Delete user from Supabase Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    
    if (authError) {
      return res.status(500).json({ error: 'Failed to delete user from authentication system.' });
    }
    
    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while deleting user.' });
  }
});

// Admin dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    // Get counts of users by role
    const { data: roleCounts, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .then(({ data, error }) => {
        if (error) throw error;
        
        const counts = {
          admin: 0,
          schools: 0,
          demo: 0
        };
        
        data.forEach(item => {
          if (counts[item.role] !== undefined) {
            counts[item.role]++;
          }
        });
        
        return { data: counts, error: null };
      });
    
    if (roleError) {
      return res.status(500).json({ error: 'Failed to fetch user role counts.' });
    }
    
    // Get total storage usage
    const { data: storageData, error: storageError } = await supabase
      .storage
      .getBucket('files');
    
    if (storageError) {
      return res.status(500).json({ error: 'Failed to fetch storage usage.' });
    }
    
    res.status(200).json({
      userCounts: roleCounts,
      storage: {
        size: storageData.size,
        publicUrl: storageData.public
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching dashboard data.' });
  }
});

module.exports = router;
