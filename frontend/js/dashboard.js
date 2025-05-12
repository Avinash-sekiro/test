// Dashboard functions

// Admin functions
async function getUsers() {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${window.API_URL}/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get users');
    }
    
    return data.users;
  } catch (error) {
    console.error('Get users error:', error);
    throw error;
  }
}

async function updateUserRole(userId, role) {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${window.API_URL}/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update user role');
    }
    
    return data;
  } catch (error) {
    console.error('Update user role error:', error);
    throw error;
  }
}

async function deleteUser(userId) {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${window.API_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete user');
    }
    
    return data;
  } catch (error) {
    console.error('Delete user error:', error);
    throw error;
  }
}

async function getAdminDashboardData() {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${window.API_URL}/admin/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get dashboard data');
    }
    
    return data;
  } catch (error) {
    console.error('Get dashboard data error:', error);
    throw error;
  }
}

// School functions
async function getSchoolProfile() {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${window.API_URL}/schools/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get school profile');
    }
    
    return data.profile;
  } catch (error) {
    console.error('Get school profile error:', error);
    throw error;
  }
}

async function updateSchoolProfile(profileData) {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${window.API_URL}/schools/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update school profile');
    }
    
    return data.profile;
  } catch (error) {
    console.error('Update school profile error:', error);
    throw error;
  }
}

async function uploadSchoolDocument(file) {
  try {
    const token = localStorage.getItem('token');
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onload = async (e) => {
        try {
          const response = await fetch(`${window.API_URL}/schools/documents`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              fileName: file.name,
              fileType: file.type,
              fileContent: e.target.result,
            }),
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.error || 'Failed to upload document');
          }
          
          resolve(data.document);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('Upload document error:', error);
    throw error;
  }
}

async function getSchoolDocuments() {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${window.API_URL}/schools/documents`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get documents');
    }
    
    return data.documents;
  } catch (error) {
    console.error('Get documents error:', error);
    throw error;
  }
}

async function deleteSchoolDocument(documentId) {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${window.API_URL}/schools/documents/${documentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete document');
    }
    
    return data;
  } catch (error) {
    console.error('Delete document error:', error);
    throw error;
  }
}

// Demo functions
async function getDemoData() {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${window.API_URL}/demo/data`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get demo data');
    }
    
    return data.data;
  } catch (error) {
    console.error('Get demo data error:', error);
    throw error;
  }
}

async function getDemoProfile() {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${window.API_URL}/demo/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get demo profile');
    }
    
    return data.profile;
  } catch (error) {
    console.error('Get demo profile error:', error);
    throw error;
  }
}

async function getDemoFiles() {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${window.API_URL}/demo/files`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get demo files');
    }
    
    return data.files;
  } catch (error) {
    console.error('Get demo files error:', error);
    throw error;
  }
}

// Modal functions
function showModal(title, content) {
  const modal = document.getElementById('modal');
  const modalContent = document.getElementById('modalContent');
  
  // Set modal title and content
  modalContent.innerHTML = `
    <h2>${title}</h2>
    <div class="modal-body">
      ${content}
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" onclick="closeModal()">Close</button>
    </div>
  `;
  
  // Show modal
  modal.style.display = 'block';
  
  // Focus on the close button for keyboard accessibility
  setTimeout(() => {
    const closeBtn = modal.querySelector('.modal-footer button');
    if (closeBtn) {
      closeBtn.focus();
    }
  }, 100);
}

function closeModal() {
  const modal = document.getElementById('modal');
  if (modal) {
    modal.style.display = 'none';
  }
}
