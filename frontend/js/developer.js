// Developer Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // Get user information
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user) {
    window.location.href = '/index.html';
    return;
  }
  
  // Display user information
  document.getElementById('userEmail').textContent = user.email;
  document.getElementById('userRole').textContent = `Role: ${user.role}`;
  
  if (user.display_name) {
    document.getElementById('userDisplayName').textContent = `Name: ${user.display_name}`;
    document.getElementById('userDisplayName').style.display = 'inline';
    document.getElementById('profileDisplayName').textContent = user.display_name;
  }
  
  document.getElementById('profileEmail').textContent = user.email;
  document.getElementById('profileRole').textContent = user.role;
  
  // Logout functionality
  document.getElementById('logoutBtn').addEventListener('click', async function() {
    try {
      await logoutUser();
      window.location.href = '/index.html';
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to logout. Please try again.');
    }
  });
  
  // Navigation functionality
  document.getElementById('dashboardLink').addEventListener('click', function(e) {
    e.preventDefault();
    showSection('dashboardSection');
  });
  
  document.getElementById('profileLink').addEventListener('click', function(e) {
    e.preventDefault();
    showSection('profileSection');
  });
  
  document.getElementById('projectsLink').addEventListener('click', function(e) {
    e.preventDefault();
    showSection('projectsSection');
  });
  
  document.getElementById('apisLink').addEventListener('click', function(e) {
    e.preventDefault();
    showSection('apisSection');
  });
  
  document.getElementById('settingsLink').addEventListener('click', function(e) {
    e.preventDefault();
    showSection('settingsSection');
  });
  
  // Load dashboard data
  loadDashboardData();
  
  // Edit profile button
  document.getElementById('editProfileBtn').addEventListener('click', function() {
    showProfileEditModal();
  });
  
  // Create project button
  document.getElementById('createProjectBtn').addEventListener('click', function() {
    showCreateProjectModal();
  });
  
  // Generate API key button
  document.getElementById('generateApiKeyBtn').addEventListener('click', function() {
    generateNewApiKey();
  });
  
  // Save settings button
  document.getElementById('saveSettingsBtn').addEventListener('click', function() {
    saveSettings();
  });
  
  // Close modal button
  document.getElementById('closeModalBtn').addEventListener('click', function() {
    closeModal();
  });
});

// Show specific section and hide others
function showSection(sectionId) {
  // Hide all sections
  const sections = document.querySelectorAll('.dashboard-section');
  sections.forEach(section => {
    section.classList.add('hidden');
  });
  
  // Show the selected section
  document.getElementById(sectionId).classList.remove('hidden');
  
  // Update active link
  const links = document.querySelectorAll('.sidebar nav a');
  links.forEach(link => {
    link.classList.remove('active');
  });
  
  // Determine which link to set as active
  let activeLink;
  switch (sectionId) {
    case 'dashboardSection':
      activeLink = 'dashboardLink';
      break;
    case 'profileSection':
      activeLink = 'profileLink';
      break;
    case 'projectsSection':
      activeLink = 'projectsLink';
      break;
    case 'apisSection':
      activeLink = 'apisLink';
      break;
    case 'settingsSection':
      activeLink = 'settingsLink';
      break;
  }
  
  if (activeLink) {
    document.getElementById(activeLink).classList.add('active');
  }
}

// Load dashboard data
async function loadDashboardData() {
  try {
    // In a real application, this would fetch data from the server
    // For now, we'll use mock data
    
    // Set mock data for dashboard
    setTimeout(() => {
      document.getElementById('totalProjects').textContent = '3';
      document.getElementById('apiKeys').textContent = '2 Active';
      document.getElementById('apiUsage').textContent = '1,250 Calls';
      document.getElementById('lastActivity').textContent = 'Today, 10:30 AM';
      
      // Load projects list
      const projectsList = document.getElementById('projectsList');
      projectsList.innerHTML = `
        <div class="list-item">
          <div class="list-item-title">Language Translation API</div>
          <div class="list-item-details">Last updated: Yesterday</div>
          <div class="list-item-actions">
            <button class="btn btn-sm btn-primary">View</button>
            <button class="btn btn-sm btn-secondary">Edit</button>
          </div>
        </div>
        <div class="list-item">
          <div class="list-item-title">Sentiment Analysis Tool</div>
          <div class="list-item-details">Last updated: 3 days ago</div>
          <div class="list-item-actions">
            <button class="btn btn-sm btn-primary">View</button>
            <button class="btn btn-sm btn-secondary">Edit</button>
          </div>
        </div>
        <div class="list-item">
          <div class="list-item-title">Speech Recognition Integration</div>
          <div class="list-item-details">Last updated: 1 week ago</div>
          <div class="list-item-actions">
            <button class="btn btn-sm btn-primary">View</button>
            <button class="btn btn-sm btn-secondary">Edit</button>
          </div>
        </div>
      `;
      
      // Load API keys list
      const apisList = document.getElementById('apisList');
      apisList.innerHTML = `
        <div class="list-item">
          <div class="list-item-title">Production API Key</div>
          <div class="list-item-details">Created: 2 months ago</div>
          <div class="list-item-actions">
            <button class="btn btn-sm btn-primary">View</button>
            <button class="btn btn-sm btn-danger">Revoke</button>
          </div>
        </div>
        <div class="list-item">
          <div class="list-item-title">Development API Key</div>
          <div class="list-item-details">Created: 1 month ago</div>
          <div class="list-item-actions">
            <button class="btn btn-sm btn-primary">View</button>
            <button class="btn btn-sm btn-danger">Revoke</button>
          </div>
        </div>
      `;
    }, 1000);
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}

// Show profile edit modal
function showProfileEditModal() {
  const user = JSON.parse(localStorage.getItem('user'));
  const modalContent = document.getElementById('modalContent');
  
  modalContent.innerHTML = `
    <h2>Edit Profile</h2>
    <form id="editProfileForm">
      <div class="form-group">
        <label for="displayName">Display Name</label>
        <input type="text" id="displayName" class="form-control" value="${user.display_name || ''}">
      </div>
      <div class="form-group">
        <label for="github">GitHub Username</label>
        <input type="text" id="github" class="form-control" value="">
      </div>
      <div class="form-group">
        <label for="contact">Contact Number</label>
        <input type="text" id="contact" class="form-control" value="">
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary">Save Changes</button>
      </div>
    </form>
  `;
  
  document.getElementById('modal').style.display = 'block';
  
  document.getElementById('editProfileForm').addEventListener('submit', function(e) {
    e.preventDefault();
    updateProfile();
  });
}

// Show create project modal
function showCreateProjectModal() {
  const modalContent = document.getElementById('modalContent');
  
  modalContent.innerHTML = `
    <h2>Create New Project</h2>
    <form id="createProjectForm">
      <div class="form-group">
        <label for="projectName">Project Name</label>
        <input type="text" id="projectName" class="form-control" required>
      </div>
      <div class="form-group">
        <label for="projectDescription">Description</label>
        <textarea id="projectDescription" class="form-control" rows="3"></textarea>
      </div>
      <div class="form-group">
        <label for="projectType">Project Type</label>
        <select id="projectType" class="form-control">
          <option value="api">API Integration</option>
          <option value="web">Web Application</option>
          <option value="mobile">Mobile Application</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary">Create Project</button>
      </div>
    </form>
  `;
  
  document.getElementById('modal').style.display = 'block';
  
  document.getElementById('createProjectForm').addEventListener('submit', function(e) {
    e.preventDefault();
    createNewProject();
  });
}

// Update profile
function updateProfile() {
  // In a real application, this would send data to the server
  // For now, we'll just update the UI
  const displayName = document.getElementById('displayName').value;
  const github = document.getElementById('github').value;
  const contact = document.getElementById('contact').value;
  
  // Update user object
  const user = JSON.parse(localStorage.getItem('user'));
  user.display_name = displayName;
  localStorage.setItem('user', JSON.stringify(user));
  
  // Update UI
  document.getElementById('userDisplayName').textContent = `Name: ${displayName}`;
  document.getElementById('userDisplayName').style.display = 'inline';
  document.getElementById('profileDisplayName').textContent = displayName;
  document.getElementById('profileGithub').textContent = github || 'Not available';
  document.getElementById('profileContact').textContent = contact || 'Not available';
  
  closeModal();
  alert('Profile updated successfully!');
}

// Create new project
function createNewProject() {
  // In a real application, this would send data to the server
  // For now, we'll just update the UI
  const projectName = document.getElementById('projectName').value;
  const projectDescription = document.getElementById('projectDescription').value;
  const projectType = document.getElementById('projectType').value;
  
  // Add new project to the list
  const projectsList = document.getElementById('projectsList');
  const newProject = document.createElement('div');
  newProject.className = 'list-item';
  newProject.innerHTML = `
    <div class="list-item-title">${projectName}</div>
    <div class="list-item-details">Created: Just now</div>
    <div class="list-item-actions">
      <button class="btn btn-sm btn-primary">View</button>
      <button class="btn btn-sm btn-secondary">Edit</button>
    </div>
  `;
  
  projectsList.insertBefore(newProject, projectsList.firstChild);
  
  // Update project count
  const totalProjects = parseInt(document.getElementById('totalProjects').textContent) + 1;
  document.getElementById('totalProjects').textContent = totalProjects.toString();
  
  closeModal();
  alert('Project created successfully!');
}

// Generate new API key
function generateNewApiKey() {
  // In a real application, this would send a request to the server
  // For now, we'll just update the UI
  const apiKey = 'api_' + Math.random().toString(36).substring(2, 15);
  
  const modalContent = document.getElementById('modalContent');
  modalContent.innerHTML = `
    <h2>New API Key Generated</h2>
    <p>Your new API key has been generated. Please copy it now as it won't be shown again.</p>
    <div class="api-key-container">
      <code>${apiKey}</code>
      <button id="copyApiKeyBtn" class="btn btn-sm btn-secondary">Copy</button>
    </div>
    <div class="form-actions mt-4">
      <button id="doneBtn" class="btn btn-primary">Done</button>
    </div>
  `;
  
  document.getElementById('modal').style.display = 'block';
  
  document.getElementById('copyApiKeyBtn').addEventListener('click', function() {
    navigator.clipboard.writeText(apiKey).then(() => {
      alert('API key copied to clipboard!');
    });
  });
  
  document.getElementById('doneBtn').addEventListener('click', function() {
    closeModal();
    
    // Add new API key to the list
    const apisList = document.getElementById('apisList');
    const newApiKey = document.createElement('div');
    newApiKey.className = 'list-item';
    newApiKey.innerHTML = `
      <div class="list-item-title">New API Key</div>
      <div class="list-item-details">Created: Just now</div>
      <div class="list-item-actions">
        <button class="btn btn-sm btn-primary">View</button>
        <button class="btn btn-sm btn-danger">Revoke</button>
      </div>
    `;
    
    apisList.insertBefore(newApiKey, apisList.firstChild);
    
    // Update API key count
    const apiKeys = document.getElementById('apiKeys').textContent.split(' ')[0];
    const totalApiKeys = parseInt(apiKeys) + 1;
    document.getElementById('apiKeys').textContent = `${totalApiKeys} Active`;
  });
}

// Save settings
function saveSettings() {
  // In a real application, this would send data to the server
  // For now, we'll just show a success message
  alert('Settings saved successfully!');
}

// Close modal
function closeModal() {
  document.getElementById('modal').style.display = 'none';
}
