// School dashboard specific JavaScript

// DOM elements
const logoutBtn = document.getElementById('logoutBtn');

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

// Check if user is authenticated and has schools role
async function checkSchoolAuth() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      // Redirect to login page if not authenticated
      window.location.href = '../index.html';
      return;
    }
    
    // Check if user has schools role
    if (user.role !== 'schools') {
      // Redirect to appropriate dashboard based on role
      if (user.role === 'admin') {
        window.location.href = 'admin-dashboard.html';
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
      console.log('School.js - Display name found:', user.display_name);
      document.getElementById('userDisplayName').textContent = user.display_name;
      document.getElementById('userDisplayName').style.display = 'inline-block';
    } else {
      console.log('School.js - No display name found in user object');
      document.getElementById('userDisplayName').style.display = 'none';
    }
    
    // Update profile section
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profileRole').textContent = user.role;
    if (user.display_name) {
      document.getElementById('profileDisplayName').textContent = user.display_name;
    } else {
      document.getElementById('profileDisplayName').textContent = 'Not available';
    }
    
    // Load school dashboard data
    loadSchoolDashboardData();
  } catch (error) {
    console.error('Auth check error:', error);
    window.location.href = '../index.html';
  }
}

// Load school dashboard data
async function loadSchoolDashboardData() {
  try {
    console.log('School dashboard data loading simplified');
    // We've removed all the dashboard cards and school information
    // No need to fetch data for removed elements
  } catch (error) {
    console.error('Dashboard data loading error:', error);
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

// Initialize the school dashboard
document.addEventListener('DOMContentLoaded', () => {
  // Check if user is authenticated and has schools role
  checkSchoolAuth();
  
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
