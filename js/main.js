// =====================
//  Minimal JS for Swoosh site
//  - Mobile menu toggle
//  - Basic form handler with front-end validation
//  - Footer year update
// =====================

// Toggle the responsive menu
const toggleBtn = document.querySelector('.menu-toggle');
const menu = document.querySelector('#site-menu');

let backdrop = null;
function ensureBackdrop(){
  if (!backdrop){
    backdrop = document.createElement('div');
    backdrop.className = 'menu-backdrop';
    // Insert as the first child of <body> to avoid weird stacking contexts
    document.body.insertBefore(backdrop, document.body.firstChild);
    backdrop.addEventListener('click', () => setMenuState(false)); // outside click closes
  }
  return backdrop;
}

function setMenuState(open){
  if (!menu || !toggleBtn) return;
  menu.classList.toggle('open', open);
  toggleBtn.setAttribute('aria-expanded', String(open));
  toggleBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); // <- fixed )
  document.body.classList.toggle('no-scroll', open);

  const bd = ensureBackdrop();
  bd.classList.toggle('show', open);
}

if (toggleBtn && menu){
  toggleBtn.addEventListener('click', () => setMenuState(!menu.classList.contains('open')));

  // Close when a link is tapped
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenuState(false)));

  // Close with Escape
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenuState(false); });
}


// Update footer year
const yearSpan = document.querySelector('#year');
if (yearSpan){ yearSpan.textContent = new Date().getFullYear(); }

// Basic form handler (prevent empty submission and show a friendly message)
const form = document.querySelector('#contact-form');
if (form){
  form.addEventListener('submit', (e) => {
    // Simple client-side validation
    if (!form.checkValidity()){
      e.preventDefault();
      alert('Please complete all required fields 🙂');
      return;
    }
    e.preventDefault();
    // Collect a subset of the values for demo
    const data = new FormData(form);
    const name = data.get('name');
    const interest = data.get('interest');
    alert(`Thanks, ${name}! We'll contact you about the ${interest || 'Swoosh'} plan.`);
    form.reset();
  });
}
