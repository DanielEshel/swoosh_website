/**
 * =====================
 *  Minimal JS for Swoosh site
 *  - Mobile menu toggle
 *  - Basic form handler with front-end validation
 *  - Footer year update
 * =====================
 */

// DOM Elements for the responsive navigation menu
const toggleBtn = document.querySelector('.menu-toggle');
const menu = document.querySelector('#site-menu');
let backdrop = null;

/**
 * Creates and injects a semi-transparent backdrop behind the mobile menu.
 * Ensures the backdrop is only created once.
 * @returns {HTMLElement} The backdrop element.
 */
function ensureBackdrop() {
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'menu-backdrop';
    // Insert as the first child of <body> to avoid weird stacking contexts
    document.body.insertBefore(backdrop, document.body.firstChild);
    
    // Clicking the backdrop closes the menu
    backdrop.addEventListener('click', () => setMenuState(false));
  }
  return backdrop;
}

/**
 * Toggles the state of the mobile menu (open or closed).
 * @param {boolean} open - True to open the menu, false to close it.
 */
function setMenuState(open) {
  if (!menu || !toggleBtn) return;
  
  // Toggle visibility class on the menu container
  menu.classList.toggle('open', open);
  
  // Update ARIA attributes for accessibility
  toggleBtn.setAttribute('aria-expanded', String(open));
  toggleBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); // <- fixed )
  
  // Prevent background scrolling when menu is open
  document.body.classList.toggle('no-scroll', open);
  
  // Show or hide the backdrop
  const bd = ensureBackdrop();
  bd.classList.toggle('show', open);
}

// Initialize menu event listeners if the elements exist on the page
if (toggleBtn && menu) {
  // Toggle menu state on button click
  toggleBtn.addEventListener('click', () => setMenuState(!menu.classList.contains('open')));
  
  // Close menu automatically when any navigation link is tapped
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenuState(false)));
  
  // Close menu when the Escape key is pressed
  document.addEventListener('keydown', (e) => { 
    if (e.key === 'Escape') setMenuState(false); 
  });
}

/**
 * Update footer year dynamically to the current year.
 */
const yearSpan = document.querySelector('#year');
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

/**
 * Basic form handler for the contact form.
 * Prevents empty submissions, validates fields, and shows a friendly alert.
 */
const form = document.querySelector('#contact-form');
if (form) {
  form.addEventListener('submit', (e) => {
    // Simple client-side validation using the browser's built-in checkValidity API
    if (!form.checkValidity()) {
      e.preventDefault();
      alert('Please complete all required fields');
      return;
    }
    
    // Prevent actual page reload/form submission
    e.preventDefault();
    
    // Collect a subset of the input values for the demo alert
    const data = new FormData(form);
    const name = data.get('name');
    const interest = data.get('interest');
    
    alert(`Thanks, ${name}! We'll contact you about the ${interest || 'Swoosh'} plan.`);
    
    // Clear the form after submission
    form.reset();
  });
}