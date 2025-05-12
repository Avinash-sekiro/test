// Main JavaScript file for initialization and event listeners

// DOM elements
const loginForm = document.getElementById('loginForm');
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

// Event listener for login form
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  try {
    // Clear any existing session data first
    sessionStorage.clear();
    
    // Set the justLoggedIn flag to true
    sessionStorage.setItem('justLoggedIn', 'true');
    sessionStorage.setItem('sessionActive', 'true');
    
    await loginUser(email, password);
    
    // Redirect to dashboard immediately without showing modal
    checkAuthAndRedirect();
  } catch (error) {
    showModal('Login Failed', error.message);
  }
});

// Event listener for logout button
logoutBtn.addEventListener('click', async () => {
  try {
    // First clear session storage
    sessionStorage.clear();
    await logoutUser();
    showAuthContainer();
  } catch (error) {
    showModal('Logout Failed', error.message);
  }
});

// Event listeners for dashboard buttons
document.getElementById('manageUsersBtn')?.addEventListener('click', async () => {
  try {
    const users = await getUsers();
    
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
          await updateUserRole(userId, role);
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
            await deleteUser(userId);
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

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Check if user is authenticated and redirect accordingly
  checkAuthAndRedirect();
  
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
