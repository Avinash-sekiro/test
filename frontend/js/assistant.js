// Frontdesk Assistant dashboard specific JavaScript

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

// Check if user is authenticated and has assistant role
async function checkAssistantAuth() {
  try {
    const user = await getCurrentUser();
    const routes = await fetchRoutes();
    
    if (!user) {
      // Redirect to login page if not authenticated
      window.location.href = '/index.html';
      return;
    }
    
    // Check if user has assistant role
    if (user.role !== 'assistant') {
      // Redirect to appropriate dashboard based on role
      redirectToRoleDashboard(user.role);
      return;
    }
    
    // Update user info in dashboard
    if (document.getElementById('userEmail')) {
      document.getElementById('userEmail').textContent = user.email;
    }
    
    if (document.getElementById('userRole')) {
      document.getElementById('userRole').textContent = `Role: ${user.role}`;
    }
    
    // Display the school name if available
    if (user.display_name && document.getElementById('userDisplayName')) {
      console.log('Assistant.js - Display name found:', user.display_name);
      document.getElementById('userDisplayName').textContent = user.display_name;
      document.getElementById('userDisplayName').style.display = 'inline-block';
    } else if (document.getElementById('userDisplayName')) {
      console.log('Assistant.js - No display name found in user object');
      document.getElementById('userDisplayName').style.display = 'none';
    }
    
    // Load assistant dashboard data
    loadAssistantDashboardData();
  } catch (error) {
    console.error('Auth check error:', error);
    window.location.href = '/index.html';
  }
}

// Load assistant dashboard data
async function loadAssistantDashboardData() {
  try {
    console.log('Assistant dashboard data loading');
    // Add your dashboard data loading logic here
  } catch (error) {
    console.error('Dashboard data loading error:', error);
  }
}

// Event listener for logout button
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      await logoutUser();
      window.location.href = '/index.html';
    } catch (error) {
      showModal('Logout Failed', error.message);
    }
  });
}

// Initialize the assistant dashboard
document.addEventListener('DOMContentLoaded', () => {
  // Check if user is authenticated and has assistant role
  checkAssistantAuth();
  
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
