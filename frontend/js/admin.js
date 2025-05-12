// Admin dashboard specific JavaScript

// DOM elements
const logoutBtn = document.getElementById('logoutBtn');
const manageUsersBtn = document.getElementById('manageUsersBtn');
const viewStatsBtn = document.getElementById('viewStatsBtn');
const manageSchoolsBtn = document.getElementById('manageSchoolsBtn');
const manageContentBtn = document.getElementById('manageContentBtn');

// Show modal function
function showModal(title, content) {
  const modal = document.getElementById('modal');
  const modalContent = document.getElementById('modalContent');
  
  // Set modal title and content
  modalContent.innerHTML = `<h2>${title}</h2><div>${content}</div>`;
  
  // Show modal
  modal.style.display = 'flex';
}

// Close modal function
function closeModal() {
  const modal = document.getElementById('modal');
  modal.style.display = 'none';
}

// Check if user is authenticated and has admin role
async function checkAdminAuth() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      // Redirect to login page if not authenticated
      window.location.href = '../index.html';
      return;
    }
    
    // Check if user has admin role
    if (user.role !== 'admin') {
      // Redirect to appropriate dashboard based on role
      if (user.role === 'schools') {
        window.location.href = 'school-dashboard.html';
      } else {
        // For other roles, redirect to index
        window.location.href = '../index.html';
      }
      return;
    }
    
    // Update user info in dashboard
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('userRole').textContent = `Role: ${user.role}`;
    
    // Display the school name if available
    if (user.display_name) {
      console.log('Admin.js - Display name found:', user.display_name);
      document.getElementById('userDisplayName').textContent = user.display_name;
      document.getElementById('userDisplayName').style.display = 'inline-block';
    } else {
      console.log('Admin.js - No display name found in user object');
      document.getElementById('userDisplayName').style.display = 'none';
    }
    
    // Load admin dashboard data
    loadAdminDashboardData();
  } catch (error) {
    console.error('Auth check error:', error);
    window.location.href = '../index.html';
  }
}

// Load admin dashboard data
async function loadAdminDashboardData() {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    // For mock token, use mock data
    if (token === 'mock-token') {
      // Mock statistics data
      const mockStats = {
        totalUsers: '42',
        activeSchools: '15',
        totalContent: '256',
        systemStatus: 'Online'
      };
      
      // Update statistics in the UI
      document.getElementById('totalUsers').textContent = mockStats.totalUsers;
      document.getElementById('activeSchools').textContent = mockStats.activeSchools;
      document.getElementById('totalContent').textContent = mockStats.totalContent;
      document.getElementById('systemStatus').textContent = mockStats.systemStatus;
      
      return;
    }
    
    // Load system statistics
    try {
      const statsResponse = await fetch(`${window.API_URL}/api/v1/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!statsResponse.ok) {
        throw new Error('Failed to load system statistics');
      }
      
      // Check if response is JSON before parsing
      const contentType = statsResponse.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Admin stats API returned non-JSON response:', contentType);
        throw new Error('Invalid response format from server');
      }
      
      const statsData = await statsResponse.json();
      
      // Update statistics in the UI
      document.getElementById('totalUsers').textContent = statsData.totalUsers || '0';
      document.getElementById('activeSchools').textContent = statsData.activeSchools || '0';
      document.getElementById('totalContent').textContent = statsData.totalContent || '0';
      document.getElementById('systemStatus').textContent = statsData.systemStatus || 'Online';
    } catch (apiError) {
      console.error('Error loading admin dashboard data:', apiError);
      
      // Use mock data as fallback
      document.getElementById('totalUsers').textContent = '42';
      document.getElementById('activeSchools').textContent = '15';
      document.getElementById('totalContent').textContent = '256';
      document.getElementById('systemStatus').textContent = 'Online (Mock)';
    }
  } catch (error) {
    console.error('Error in admin dashboard setup:', error);
    // Show error in the UI
    document.getElementById('totalUsers').textContent = 'Error loading data';
    document.getElementById('activeSchools').textContent = 'Error loading data';
    document.getElementById('totalContent').textContent = 'Error loading data';
    document.getElementById('systemStatus').textContent = 'Error';
  }
}

// Event listener for logout button
logoutBtn.addEventListener('click', async () => {
  try {
    await logoutUser();
    window.location.href = '../index.html';
  } catch (error) {
    showModal('Logout Failed', error.message);
  }
});

// Event listener for manage users button
manageUsersBtn.addEventListener('click', async () => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${window.API_URL}/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to load users');
    }
    
    const users = await response.json();
    
    let usersList = '<ul class="users-list">';
    users.forEach(user => {
      usersList += `
        <li>
          <div class="user-info">
            <span>${user.email}</span>
            <span class="user-role">Role: ${user.role}</span>
          </div>
          <div class="user-actions">
            <select class="role-select" data-user-id="${user.id}">
              <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
              <option value="schools" ${user.role === 'schools' ? 'selected' : ''}>School</option>
              <option value="demo" ${user.role === 'demo' ? 'selected' : ''}>Demo</option>
            </select>
            <button class="btn btn-primary update-role-btn" data-user-id="${user.id}">Update Role</button>
            <button class="btn btn-danger delete-user-btn" data-user-id="${user.id}">Delete</button>
          </div>
        </li>
      `;
    });
    usersList += '</ul>';
    
    showModal('User Management', usersList);
    
    // Add event listeners for user management buttons
    document.querySelectorAll('.update-role-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const userId = btn.getAttribute('data-user-id');
        const roleSelect = document.querySelector(`.role-select[data-user-id="${userId}"]`);
        const role = roleSelect.value;
        
        try {
          const updateResponse = await fetch(`${window.API_URL}/admin/users/${userId}/role`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ role }),
          });
          
          if (!updateResponse.ok) {
            throw new Error('Failed to update user role');
          }
          
          showModal('Success', 'User role updated successfully.');
        } catch (error) {
          showModal('Error', error.message);
        }
      });
    });
    
    document.querySelectorAll('.delete-user-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const userId = btn.getAttribute('data-user-id');
        
        if (confirm('Are you sure you want to delete this user?')) {
          try {
            const deleteResponse = await fetch(`${window.API_URL}/admin/users/${userId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            
            if (!deleteResponse.ok) {
              throw new Error('Failed to delete user');
            }
            
            showModal('Success', 'User deleted successfully.');
          } catch (error) {
            showModal('Error', error.message);
          }
        }
      });
    });
  } catch (error) {
    showModal('Error', error.message);
  }
});

// Initialize the admin dashboard
document.addEventListener('DOMContentLoaded', () => {
  // Check if user is authenticated and has admin role
  checkAdminAuth();
  
  // Close modal when clicking the close button
  const closeModalBtn = document.getElementById('closeModalBtn');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
  }
  
  // Close modal when clicking outside the modal content
  window.addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal')) {
      closeModal();
    }
  });
  
  // Add keyboard event listener to close modal with Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });
});
