/**
 * js/auth.js
 * Handles all user authentication logic including UI state changes,
 * login/signup modals, and protecting specific routes.
 */
import { auth, provider } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

// Tracks whether the modal is currently showing the "login" or "signup" view
let authMode = "login"; // "login" | "signup"

/**
 * Helper function to retrieve all DOM elements related to authentication.
 * Evaluated dynamically so it works safely across different pages.
 * @returns {Object} Dictionary of DOM elements.
 */
function getEls() {
  return {
    modal: document.getElementById("auth-modal"),
    title: document.getElementById("auth-modal-title"),
    error: document.getElementById("auth-error"),
    form: document.getElementById("auth-form"),
    email: document.getElementById("auth-email"),
    password: document.getElementById("auth-password"),
    btnLogin: document.getElementById("btn-login"),
    btnSignup: document.getElementById("btn-signup"),
    btnLogout: document.getElementById("btn-logout"),
    btnGoogle: document.getElementById("auth-google"),
    btnClose: document.getElementById("auth-modal-close"),
    userEmail: document.getElementById("user-email"),
    navGallery: document.getElementById("nav-gallery"),
    submit: document.getElementById("auth-submit"),
    toggleLink: document.getElementById("auth-toggle-link"),
    toggleText: document.getElementById("auth-toggle-text"),
    // Elements specifically for the Contact Page autofill
    contactEmail: document.getElementById("email"),
    contactName: document.getElementById("name"),
    mainCtaBtn: document.getElementById('main-cta-btn')
  };
}

/**
 * Opens the authentication modal and configures it for login or signup.
 * @param {string} mode - Either "login" or "signup".
 */
function openModal(mode = "login") {
  authMode = mode;
  const els = getEls();
  
  if (!els.modal) return;
  
  els.modal.classList.remove("hidden");
  els.error.textContent = ""; // Clear previous errors

  // Update modal texts based on the current mode
  if (mode === "signup") {
    els.title.textContent = "Create an Account";
    if (els.submit) els.submit.textContent = "Sign Up";
    if (els.toggleText) els.toggleText.textContent = "Already have an account?";
    if (els.toggleLink) els.toggleLink.textContent = "Sign in";
  } else {
    els.title.textContent = "Welcome Back";
    if (els.submit) els.submit.textContent = "Sign In";
    if (els.toggleText) els.toggleText.textContent = "Don't have an account?";
    if (els.toggleLink) els.toggleLink.textContent = "Create account";
  }
}

/**
 * Closes the authentication modal by hiding it.
 */
function closeModal() {
  const els = getEls();
  if (els.modal) els.modal.classList.add("hidden");
}

/**
 * Attaches event listeners to the authentication UI elements (buttons, forms).
 * Should be called once during page load.
 */
export function attachAuthModal() {
  const els = getEls();

  // Open modal buttons
  if (els.btnLogin) els.btnLogin.addEventListener("click", () => openModal("login"));
  if (els.btnSignup) els.btnSignup.addEventListener("click", () => openModal("signup"));

  // Toggle between login and signup modes inside the modal itself
  if (els.toggleLink) {
    els.toggleLink.addEventListener("click", (e) => {
      e.preventDefault(); // prevents page jump
      openModal(authMode === "login" ? "signup" : "login");
    });
  }

  // Close modal logic (X button and background backdrop click)
  if (els.btnClose) els.btnClose.addEventListener("click", closeModal);
  if (els.modal) {
    els.modal.addEventListener("click", (e) => {
      if (e.target === els.modal) closeModal();
    });
  }

  // Handle standard Email/Password form submission
  if (els.form) {
    els.form.addEventListener("submit", async (e) => {
      e.preventDefault();
      els.error.textContent = "";

      try {
        if (authMode === "signup") {
          // Process registration
          const cred = await createUserWithEmailAndPassword(
            auth,
            els.email.value,
            els.password.value,
          );
          
          // Optional: Parse display name from email prefix and update profile
          const name = els.email.value.split("@")[0];
          try {
            await updateProfile(cred.user, { displayName: name });
          } catch (_) {}
        } else {
          // Process login
          await signInWithEmailAndPassword(
            auth,
            els.email.value,
            els.password.value,
          );
        }
        closeModal();
      } catch (err) {
        // Display Firebase auth errors to the user
        els.error.textContent = err.message || "Authentication failed";
      }
    });
  }

  // Handle Google OAuth sign-in via popup
  if (els.btnGoogle) {
    els.btnGoogle.addEventListener("click", async () => {
      els.error.textContent = "";
      try {
        await signInWithPopup(auth, provider);
        closeModal();
      } catch (err) {
        els.error.textContent = err.message || "Google sign-in failed";
      }
    });
  }

  // Handle user logout
  if (els.btnLogout) {
    els.btnLogout.addEventListener("click", async () => {
      await signOut(auth);
      // Note: no need to close modal here as the user is already logged in and modal is closed
    });
  }
}

/**
 * Listens for changes in the user's authentication state globally.
 * Updates navigation links, buttons, and user-specific UI automatically.
 */
export function initAuthUI() {
  const els = getEls();

  onAuthStateChanged(auth, (user) => {
    const loggedIn = !!user;

    // Toggle header navigation buttons based on auth state
    if (els.btnLogin) els.btnLogin.classList.toggle("hidden", loggedIn);
    if (els.btnSignup) els.btnSignup.classList.toggle("hidden", loggedIn);
    if (els.btnLogout) els.btnLogout.classList.toggle("hidden", !loggedIn);

    // Display the user's name or email in the header if logged in
    if (els.userEmail) {
      els.userEmail.textContent = loggedIn
        ? user.displayName || user.email
        : "";
      els.userEmail.classList.toggle("hidden", !loggedIn);
    }

    // Show or hide the gallery link in the navigation menu
    if (els.navGallery) els.navGallery.classList.toggle("hidden", !loggedIn);

    // --- MAIN CTA BUTTON & CONTACT AUTO-FILL LOGIC ---
    if (loggedIn) {
      // 1. Update the Main Hero CTA Button to redirect to the Gallery
      if (els.mainCtaBtn) {
        els.mainCtaBtn.textContent = "Go to Gallery";
        els.mainCtaBtn.href = "gallery.html";
        els.mainCtaBtn.onclick = null; // Clear the modal popup behavior
      }

      // 2. Auto-fill the contact form fields using authenticated user data
      if (els.contactEmail && !els.contactEmail.value) {
        els.contactEmail.value = user.email || "";
      }
      if (els.contactName && !els.contactName.value && user.displayName) {
        els.contactName.value = user.displayName;
      }
    } else {
      // Revert the Main Hero CTA Button to trigger account creation
      if (els.mainCtaBtn) {
        els.mainCtaBtn.textContent = "Create Account";
        els.mainCtaBtn.href = "#";
        
        // Re-attach the function that opens the sign-up modal
        els.mainCtaBtn.onclick = (e) => {
          e.preventDefault();
          openModal("signup"); // Fixed function call
        };
      }
    }

    // Extra safety: Ensure the auth modal is closed if the auth state transitions to logged in
    if (loggedIn) {
      closeModal();
    }
  });
}

/**
 * Guard function for protecting routes/actions that require the user to be logged in.
 * Checks the auth state and forces the login modal open if the user is unauthenticated.
 * @returns {Promise<Object>} Resolves with the Firebase User object if authenticated.
 */
export function requireAuth() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(user);
      } else {
        // Force open the login modal on top of the current page
        openModal("login");
      }
    });
  });
}