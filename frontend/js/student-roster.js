/**
 * Student Roster Management
 * Provides functionality for displaying and managing students in the classroom activity
 */

// Student Roster Module
const StudentRoster = (function() {
  // Webhook URL for fetching data
  const WEBHOOK_URL = "https://n8n.srv819941.hstgr.cloud/webhook/5d4dbdb7-c22c-43bd-bda4-5017b5e95264";
  
  // Variables
  let students = [];
  let currentStudentIndex = -1;
  let rosterElement = null;
  let currentStudentElement = null;
  let isRosterVisible = true;
  let classNum = null;
  let sectionCode = null;
  
  // Random avatar colors array for student icons
  const avatarColors = [
    "#4285F4", "#EA4335", "#FBBC05", "#34A853", "#8E44AD", "#F39C12", 
    "#16A085", "#E74C3C", "#3498DB", "#1ABC9C", "#D35400", "#27AE60"
  ];

  // Initialize the student roster
  function init() {
    // Get class and section from URL or localStorage
    parseClassAndSection();
    
    // Create roster container if it doesn't exist
    if (!document.getElementById('student-roster-container')) {
      createRosterUI();
    }

    rosterElement = document.getElementById('student-roster-list');
    currentStudentElement = document.getElementById('current-student');
    
    // Fetch students data
    fetchStudents().then(() => {
      // Initialize roster with students
      renderRoster();
    });
    
    // Add event listeners
    document.getElementById('roster-toggle').addEventListener('click', toggleRoster);
    document.getElementById('call-next-student').addEventListener('click', callNextStudent);
    document.getElementById('mark-absent').addEventListener('click', markCurrentStudentAbsent);
    
    // Correct container padding on init
    adjustContainerPadding();
    
    return {
      callNextStudent,
      getStudents: () => students,
      getCurrentStudent: () => students[currentStudentIndex],
      toggleRoster,
      refreshStudents: fetchStudents
    };
  }
  
  // Parse class and section from URL or localStorage
  function parseClassAndSection() {
    // Try to get from URL parameters first
    const urlParams = new URLSearchParams(window.location.search);
    classNum = urlParams.get('class');
    
    // If not in URL, try localStorage
    if (!classNum) {
      classNum = localStorage.getItem('selectedClass');
    }
    
    // Get section from URL or localStorage
    const urlSection = urlParams.get('section');
    sectionCode = urlSection || localStorage.getItem('selectedSection');
    
    console.log(`Roster initialized for Class ${classNum}, Section ${sectionCode}`);
  }
  
  // Fetch students from webhook API
  async function fetchStudents() {
    if (!classNum || !sectionCode) {
      console.warn("Class or section not available for fetching students");
      showToast("Class or section not specified");
      return;
    }
    
    try {
      showToast("Fetching students...");
      
      const formData = new FormData();
      formData.append("cmd", "4");  // Use "4" for get_students
      formData.append("user", "auden_cbse");
      formData.append("class", classNum);
      formData.append("section", sectionCode);
      
      console.log(`Fetching students for Class ${classNum}, Section ${sectionCode}`);
      
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Get response as text first
      const responseText = await response.text();
      console.log("Students raw response:", responseText);
      
      try {
        // Parse the response as JSON
        const parsedData = JSON.parse(responseText);
        
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          // Process the student data from the server format
          students = parsedData.map((student, index) => {
            return {
              id: index + 1,
              name: student.name,
              status: student.chance === "0" ? "waiting" : 
                     student.chance === "1" ? "completed" : 
                     student.chance === "A" ? "absent" : "waiting",
              avatarColor: avatarColors[index % avatarColors.length]
            };
          });
          
          console.log(`Loaded ${students.length} students:`, students);
          showToast(`Loaded ${students.length} students`);
          
          // Update UI if roster is already created
          if (rosterElement) {
            renderRoster();
          }
        } else {
          console.warn("No students found or invalid data format");
          showToast("No students found");
        }
      } catch (parseError) {
        console.error("Error parsing students JSON:", parseError);
        console.log("Raw response:", responseText);
        showToast("Error parsing student data");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      showToast("Failed to load students");
    }
  }
  
  // Create the roster UI elements
  function createRosterUI() {
    // Create main container
    const rosterContainer = document.createElement('div');
    rosterContainer.id = 'student-roster-container';
    rosterContainer.className = 'student-roster-container';
    
    // Create header with controls
    const rosterHeader = document.createElement('div');
    rosterHeader.className = 'roster-header';
    rosterHeader.innerHTML = `
      <h3><i class="fa fa-users"></i> Students</h3>
      <div class="roster-controls">
        <button id="roster-toggle" class="roster-btn" title="Toggle Roster">
          <i class="fa fa-chevron-right"></i>
        </button>
      </div>
    `;
    
    // Create current student display
    const currentStudentSection = document.createElement('div');
    currentStudentSection.className = 'current-student-section';
    currentStudentSection.innerHTML = `
      <div class="class-info">Class ${classNum || '-'} Section ${sectionCode || '-'}</div>
      <div id="current-student" class="current-student">
        <div class="current-student-placeholder">
          <i class="fa fa-user-circle"></i>
          <p>No student selected</p>
        </div>
      </div>
      <div class="student-actions">
        <button id="call-next-student" class="action-btn primary-action">
          <i class="fa fa-bullhorn"></i> Next Student
        </button>
        <button id="mark-absent" class="action-btn danger-action" disabled>
          <i class="fa fa-times"></i> Mark Absent
        </button>
      </div>
    `;
    
    // Create student list with instructions
    const rosterList = document.createElement('div');
    rosterList.id = 'student-roster-list';
    rosterList.className = 'student-roster-list';
    rosterList.innerHTML = '<div class="list-label">Upcoming Students (scroll to see more)</div>';
    
    // Assemble the components
    rosterContainer.appendChild(rosterHeader);
    rosterContainer.appendChild(currentStudentSection);
    rosterContainer.appendChild(rosterList);
    
    // Add to the page
    document.querySelector('.container').appendChild(rosterContainer);
    
    // Log component creation
    console.log('Student roster component created');
  }
  
  // Add the CSS for the roster - Simplified to avoid duplication
  function ensureRosterStyles() {
    // Check if the external CSS is loaded
    const externalCssLoaded = Array.from(document.styleSheets).some(sheet => {
      try {
        return sheet.href && sheet.href.includes('student-roster.css');
      } catch (e) {
        return false;
      }
    });
    
    if (!externalCssLoaded) {
      console.warn('student-roster.css not detected, some styles may be missing');
    }
  }
  
  // Adjust container padding based on roster state
  function adjustContainerPadding() {
    const container = document.querySelector('.container');
    if (!container) return;
    
    if (isRosterVisible) {
      container.style.paddingRight = "300px";
      container.classList.remove('roster-collapsed');
    } else {
      container.style.paddingRight = "0";
      container.classList.add('roster-collapsed');
    }
  }
  
  // Render the student roster
  function renderRoster() {
    if (!rosterElement) return;
    
    // Keep the label at the top
    rosterElement.innerHTML = '<div class="list-label">Upcoming Students</div>';
    
    // Filter students to just show waiting ones
    const waitingStudents = students.filter(student => student.status === "waiting");
    
    if (waitingStudents.length === 0) {
      rosterElement.innerHTML += '<div style="text-align:center;padding:10px;color:#666;font-style:italic;">No waiting students</div>';
    } else {
      // Show first 15 waiting students - increased from 10 to show more
      waitingStudents.slice(0, 15).forEach((student, index) => {
        const studentElement = document.createElement('div');
        studentElement.className = `student-item ${index === 0 && currentStudentIndex === -1 ? 'active' : ''}`;
        studentElement.dataset.id = student.id;
        
        const initials = getInitials(student.name);
        
        studentElement.innerHTML = `
          <div class="student-item-avatar" style="background-color: ${student.avatarColor}">${initials}</div>
          <div class="student-item-info">
            <div class="student-item-name">${student.name}</div>
          </div>
          <div class="student-item-status status-indicator-${student.status}"></div>
        `;
        
        studentElement.addEventListener('click', () => selectStudent(students.indexOf(student)));
        
        rosterElement.appendChild(studentElement);
      });
    }
    
    // Add a count of remaining students if there are more than 15
    if (waitingStudents.length > 15) {
      const remainingCount = waitingStudents.length - 15;
      const countElement = document.createElement('div');
      countElement.style.textAlign = 'center';
      countElement.style.fontSize = '12px';
      countElement.style.color = '#666';
      countElement.style.marginTop = '6px';
      countElement.textContent = `+ ${remainingCount} more students`;
      rosterElement.appendChild(countElement);
    }
  }
  
  // Call the next student
  function callNextStudent() {
    // Find the next waiting student
    let nextIndex = -1;
    
    for (let i = 0; i < students.length; i++) {
      if (students[i].status === 'waiting') {
        nextIndex = i;
        break;
      }
    }
    
    // If no waiting student found, show notification
    if (nextIndex === -1) {
      showToast('No more waiting students!');
      return;
    }
    
    // Update current student
    currentStudentIndex = nextIndex;
    students[currentStudentIndex].status = 'active';
    
    // Update UI
    updateCurrentStudent();
    renderRoster();
    
    // Enable action button
    document.getElementById('mark-absent').disabled = false;
  }
  
  // Update the current student display
  function updateCurrentStudent() {
    if (!currentStudentElement) return;
    
    if (currentStudentIndex === -1 || !students[currentStudentIndex]) {
      currentStudentElement.innerHTML = `
        <div class="current-student-placeholder">
          <i class="fa fa-user-circle"></i>
          <p>No student selected</p>
        </div>
      `;
      return;
    }
    
    const student = students[currentStudentIndex];
    const initials = getInitials(student.name);
    
    currentStudentElement.innerHTML = `
      <div class="current-student-info">
        <div class="student-avatar" style="background-color: ${student.avatarColor}">${initials}</div>
        <div class="student-name">${student.name}</div>
        <div class="student-status status-${student.status}">${capitalizeFirstLetter(student.status)}</div>
      </div>
    `;
    
    // Add highlight animation
    currentStudentElement.classList.add('highlight');
    setTimeout(() => {
      currentStudentElement.classList.remove('highlight');
    }, 1000);
  }
  
  // Mark the current student as absent
  function markCurrentStudentAbsent() {
    if (currentStudentIndex === -1) return;
    
    students[currentStudentIndex].status = 'absent';
    
    // Update student's chance value on the server
    updateStudentChance(students[currentStudentIndex].name, 'A');
    
    updateCurrentStudent();
    renderRoster();
    
    // Disable action button
    document.getElementById('mark-absent').disabled = true;
    
    // Show toast notification
    showToast(`${students[currentStudentIndex].name} marked absent`);
    
    // Call next student automatically after a delay
    setTimeout(callNextStudent, 1000);
  }
  
  // Update student's chance value on the server
  async function updateStudentChance(studentName, chance) {
    if (!classNum || !sectionCode) return;
    
    try {
      const formData = new FormData();
      formData.append("cmd", "5");  // Use "5" for update_student_status
      formData.append("user", "auden_cbse");
      formData.append("class", classNum);
      formData.append("section", sectionCode);
      formData.append("name", studentName);
      formData.append("chance", chance);
      
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        body: formData
      });
      
      if (!response.ok) {
        console.warn(`Status update not successful: ${response.status}`);
      } else {
        console.log(`Student ${studentName} chance updated to ${chance} on server`);
      }
    } catch (error) {
      console.error("Error updating student chance:", error);
    }
  }
  
  // Select a specific student by index
  function selectStudent(index) {
    currentStudentIndex = index;
    students[currentStudentIndex].status = 'active';
    
    // Update UI
    updateCurrentStudent();
    renderRoster();
    
    // Enable action button
    document.getElementById('mark-absent').disabled = false;
  }
  
  // Toggle the visibility of the roster
  function toggleRoster() {
    const rosterContainer = document.getElementById('student-roster-container');
    const toggleButton = document.getElementById('roster-toggle');
    
    if (!rosterContainer || !toggleButton) return;
    
    isRosterVisible = !isRosterVisible;
    
    if (isRosterVisible) {
      rosterContainer.classList.remove('collapsed');
      toggleButton.innerHTML = '<i class="fa fa-chevron-right"></i>';
    } else {
      rosterContainer.classList.add('collapsed');
      toggleButton.innerHTML = '<i class="fa fa-chevron-left"></i>';
    }
    
    // Adjust container padding
    adjustContainerPadding();
  }
  
  // Helper function to get initials from a name
  function getInitials(name) {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
  
  // Helper function to capitalize the first letter of a string
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  // Helper function to show toast notification
  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = 'show';
    
    setTimeout(() => {
      toast.className = toast.className.replace('show', '');
    }, 3000);
  }
  
  // Public API
  return {
    init,
    callNextStudent,
    toggleRoster,
    getStudents: () => students,
    refreshStudents: fetchStudents
  };
})();

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize after a slight delay to ensure all other elements are ready
  setTimeout(() => {
    window.studentRoster = StudentRoster.init();
  }, 500);
}); 