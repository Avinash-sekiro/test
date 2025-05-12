// Function to load the sidebar component
async function loadSidebar() {
    const response = await fetch('/assets/components/sidebar.html');
    const sidebarHtml = await response.text();
    document.querySelector('.container').insertAdjacentHTML('afterbegin', sidebarHtml);
    
    // Initialize dropdown functionality after sidebar is loaded
    initializeDropdowns();
}

// Load sidebar when document is ready
document.addEventListener('DOMContentLoaded', loadSidebar);

// Function to toggle sidebar visibility
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}

// Function to initialize dropdowns
function initializeDropdowns() {
    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    document.body.appendChild(tooltip);

    // Track touch interaction state
    let touchTimer;
    let activeTooltipLink = null;

    document.querySelectorAll('.sidebar .dropdown').forEach(dropdown => {
        const parentLink = dropdown.querySelector('a');
        const dropdownContent = dropdown.querySelector('.dropdown-content');

        if (parentLink && dropdownContent) {
            // Initialize tooltips for dropdown items
            dropdownContent.querySelectorAll('a[data-tooltip]').forEach(link => {
                // Function to show tooltip
                const showTooltip = (rect) => {
                    const sidebar = document.querySelector('.sidebar');
                    const sidebarRect = sidebar.getBoundingClientRect();
                    const windowWidth = window.innerWidth;
                    const dropdownRect = dropdownContent.getBoundingClientRect();
                    
                    // Calculate the available space to the right of the dropdown
                    const availableSpace = windowWidth - dropdownRect.right;
                    
                    // Calculate offset based on dropdown width
                    const dropdownWidth = dropdownRect.width;
                    const baseOffset = 20; // minimum spacing from dropdown
                    const centerOffset = Math.min(
                        availableSpace * 0.05, // 20% of available space
                        dropdownWidth * 0.1   // or 30% of dropdown width
                    );
                    
                    // Get parent dropdown's position for vertical alignment
                    const relativeTop = rect.top - dropdownRect.top;
                    
                    // Set tooltip content and position
                    tooltip.textContent = link.getAttribute('data-tooltip');
                    tooltip.style.top = `${dropdownRect.top + relativeTop}px`;
                    tooltip.style.left = `${dropdownRect.right + baseOffset + centerOffset}px`;
                    tooltip.style.transform = 'translateY(0)';
                    tooltip.classList.add('visible');
                    activeTooltipLink = link;
                };

                // Function to hide tooltip
                const hideTooltip = () => {
                    tooltip.classList.remove('visible');
                    activeTooltipLink = null;
                };

                // Mouse events
                link.addEventListener('mouseenter', (e) => {
                    showTooltip(e.target.getBoundingClientRect());
                });

                link.addEventListener('mouseleave', hideTooltip);

                // Touch events
                link.addEventListener('touchstart', (e) => {
                    // Prevent immediate click
                    e.preventDefault();
                    
                    // Clear any existing timer
                    if (touchTimer) clearTimeout(touchTimer);
                    
                    // Hide any existing tooltip
                    if (activeTooltipLink && activeTooltipLink !== link) {
                        hideTooltip();
                    }
                    
                    // Show tooltip after a brief delay
                    touchTimer = setTimeout(() => {
                        showTooltip(e.target.getBoundingClientRect());
                    }, 200);
                });

                link.addEventListener('touchend', (e) => {
                    // Clear the timer if touch ended too quickly
                    if (touchTimer) {
                        clearTimeout(touchTimer);
                    }
                    
                    // If tooltip is visible, hide it and prevent navigation
                    if (activeTooltipLink === link) {
                        e.preventDefault();
                        hideTooltip();
                    }
                });

                link.addEventListener('touchmove', (e) => {
                    // Clear the timer if user starts scrolling
                    if (touchTimer) {
                        clearTimeout(touchTimer);
                    }
                });
            });

            // Wrap the content in an inner container
            const innerContent = document.createElement('div');
            innerContent.className = 'dropdown-content-inner';
            
            // Move all existing children to the inner container
            while (dropdownContent.firstChild) {
                innerContent.appendChild(dropdownContent.firstChild);
            }
            dropdownContent.appendChild(innerContent);

            let isScrolling = false;
            let startY = 0;
            let currentY = 0;
            let previousY = 0;
            let scrollTop = 0;
            let currentTranslateY = 0;
            let velocity = 0;
            let lastTime = 0;
            let animationFrame = null;

            const lerp = (start, end, factor) => {
                return start + (end - start) * factor;
            };

            const animate = () => {
                if (!isScrolling) return;
                
                const now = Date.now();
                const deltaTime = Math.min(now - lastTime, 30);
                lastTime = now;

                const movement = currentY - previousY;
                velocity = lerp(velocity, movement, 0.3);
                previousY = currentY;

                if (Math.abs(velocity) > 0.1) {
                    requestAnimationFrame(animate);
                }
            };

            const startRubberBand = () => {
                dropdownContent.classList.add('rubber-banding');
                dropdownContent.classList.remove('bouncing-back');
            };

            const endRubberBand = () => {
                dropdownContent.classList.remove('rubber-banding');
                dropdownContent.classList.add('bouncing-back');
                innerContent.style.transform = 'translateY(0)';
                
                setTimeout(() => {
                    dropdownContent.classList.remove('bouncing-back');
                }, 150);
            };

            // Touch start event
            innerContent.addEventListener('touchstart', (e) => {
                isScrolling = true;
                startY = currentY = previousY = e.touches[0].pageY;
                scrollTop = innerContent.scrollTop;
                currentTranslateY = 0;
                velocity = 0;
                lastTime = Date.now();
                
                if (animationFrame) {
                    cancelAnimationFrame(animationFrame);
                }
                animationFrame = requestAnimationFrame(animate);
            });

            // Touch move event
            innerContent.addEventListener('touchmove', (e) => {
                if (!isScrolling) return;

                currentY = e.touches[0].pageY;
                const deltaY = currentY - previousY;

                // Calculate new scroll position
                const newScrollTop = innerContent.scrollTop;
                const isAtTop = newScrollTop <= 0;
                const isAtBottom = newScrollTop + innerContent.clientHeight >= innerContent.scrollHeight;

                // Apply rubber band effect at boundaries
                if ((isAtTop && deltaY > 0) || (isAtBottom && deltaY < 0)) {
                    if (!dropdownContent.classList.contains('rubber-banding')) {
                        startRubberBand();
                    }
                    
                    e.preventDefault();
                    
                    // Calculate resistance factor based on distance
                    const resistance = 1 - (Math.abs(currentTranslateY) / 150);
                    const dampedDelta = deltaY * Math.max(0.15, resistance) * 0.5;
                    
                    currentTranslateY += dampedDelta;
                    currentTranslateY = Math.max(Math.min(currentTranslateY, 60), -60);
                    
                    // Apply easing to the transform
                    const easedTransform = currentTranslateY * (1 - Math.abs(currentTranslateY) / 120);
                    innerContent.style.transform = `translateY(${easedTransform}px)`;
                } else {
                    if (dropdownContent.classList.contains('rubber-banding')) {
                        endRubberBand();
                    }
                }
            }, { passive: false });

            // Touch end event
            innerContent.addEventListener('touchend', () => {
                if (!isScrolling) return;
                isScrolling = false;
                
                if (currentTranslateY !== 0) {
                    endRubberBand();
                }
                
                if (animationFrame) {
                    cancelAnimationFrame(animationFrame);
                    animationFrame = null;
                }
            });

            // Mouse wheel event for desktop
            let wheelTimeout;
            innerContent.addEventListener('wheel', (e) => {
                const newScrollTop = innerContent.scrollTop + e.deltaY;
                const isAtTop = newScrollTop <= 0;
                const isAtBottom = newScrollTop + innerContent.clientHeight >= innerContent.scrollHeight;

                if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
                    e.preventDefault();
                    
                    clearTimeout(wheelTimeout);
                    startRubberBand();
                    
                    // Calculate rubber band effect
                    const direction = e.deltaY > 0 ? -1 : 1;
                    const magnitude = Math.min(Math.abs(e.deltaY), 40);
                    const dampedMagnitude = magnitude * 0.4;
                    
                    currentTranslateY = direction * dampedMagnitude;
                    innerContent.style.transform = `translateY(${currentTranslateY}px)`;
                    
                    wheelTimeout = setTimeout(() => {
                        endRubberBand();
                    }, 80);
                }
            }, { passive: false });

            // Toggle dropdown on click
            parentLink.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Close all other dropdowns first
                document.querySelectorAll('.sidebar .dropdown').forEach(otherDropdown => {
                    if (otherDropdown !== dropdown) {
                        const otherLink = otherDropdown.querySelector('a');
                        const otherContent = otherDropdown.querySelector('.dropdown-content');
                        if (otherLink) otherLink.classList.remove('active');
                        if (otherContent) {
                            otherContent.style.display = 'none';
                            otherContent.classList.remove('rubber-banding', 'bouncing-back');
                        }
                    }
                });
                
                // Toggle current dropdown
                parentLink.classList.toggle('active');
                dropdownContent.style.display = parentLink.classList.contains('active') ? 'block' : 'none';
                dropdownContent.classList.remove('rubber-banding', 'bouncing-back');
            });

            // Add click handlers for dropdown items
            innerContent.querySelectorAll('a').forEach(item => {
                item.addEventListener('click', () => {
                    // Close the dropdown
                    parentLink.classList.remove('active');
                    dropdownContent.style.display = 'none';
                    endRubberBand();
                    // Close the sidebar
                    const sidebar = document.querySelector('.sidebar');
                    if (sidebar) {
                        sidebar.classList.remove('active');
                    }
                });
            });
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const clickedElement = e.target;
        const dropdownLink = clickedElement.closest('.sidebar .dropdown > a');
        const dropdownContent = clickedElement.closest('.dropdown-content');
        
        if (!dropdownLink && !dropdownContent) {
            closeAllDropdowns();
        }
    });
}

// Helper function to close all dropdowns
function closeAllDropdowns() {
    document.querySelectorAll('.sidebar .dropdown').forEach(dropdown => {
        const link = dropdown.querySelector('a');
        const content = dropdown.querySelector('.dropdown-content');
        const inner = content?.querySelector('.dropdown-content-inner');
        if (link) link.classList.remove('active');
        if (content) {
            content.style.display = 'none';
            content.classList.remove('rubber-banding', 'bouncing-back');
        }
        if (inner) {
            inner.style.transform = 'translateY(0)';
            inner.classList.remove('rubber-banding', 'bouncing-back');
        }
    });
}

// Close sidebar when clicking outside
document.addEventListener('click', function(event) {
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    
    if (sidebar && !sidebar.contains(event.target) && event.target !== sidebarToggle) {
        sidebar.classList.remove('active');
        sidebar.classList.remove('open');
        closeAllDropdowns(); // Also close any open dropdowns
    }
});
