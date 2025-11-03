// js/auth.js
import { auth, provider } from './firebase-init.js';
import { onAuthStateChanged, signInWithPopup, signOut } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';

export function initAuthUI() {
  const authBtn = document.getElementById('auth-btn');
  const galleryLink = document.getElementById('nav-gallery');

  if (authBtn) {
    authBtn.addEventListener('click', async () => {
      if (auth.currentUser) {
        await signOut(auth);
      } else {
        await signInWithPopup(auth, provider);
      }
    });
  }

  onAuthStateChanged(auth, (user) => {
    if (user) {
      if (authBtn) authBtn.textContent = 'Sign out';
      if (galleryLink) galleryLink.classList.remove('hidden');
    } else {
      if (authBtn) authBtn.textContent = 'Sign in';
      if (galleryLink) galleryLink.classList.add('hidden');
    }
  });
}

export function requireAuth() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) resolve(user);
      else window.location.href = 'login.html?next=' + encodeURIComponent(window.location.pathname);
    });
  });
}