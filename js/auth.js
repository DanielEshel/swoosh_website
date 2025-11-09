// js/auth.js
import { auth, provider } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

let authMode = "login"; // "login" | "signup"

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
  };
}

function openModal(mode = "login") {
  authMode = mode;
  const els = getEls();
  if (!els.modal) return;
  els.modal.classList.remove("hidden");
  els.error.textContent = "";
  els.title.textContent =
    mode === "signup" ? "Create your account" : "Welcome back";
  if (els.submit)
    els.submit.textContent = mode === "signup" ? "Create account" : "Sign in";
}

function closeModal() {
  const els = getEls();
  if (els.modal) els.modal.classList.add("hidden");
}

export function attachAuthModal() {
  const els = getEls();

  // open
  if (els.btnLogin) els.btnLogin.addEventListener("click", () => openModal("login"));
  if (els.btnSignup) els.btnSignup.addEventListener("click", () => openModal("signup"));

  // close
  if (els.btnClose) els.btnClose.addEventListener("click", closeModal);
  if (els.modal) {
    // click backdrop
    els.modal.addEventListener("click", (e) => {
      if (e.target === els.modal) closeModal();
    });
  }

  // email/password submit
  if (els.form) {
    els.form.addEventListener("submit", async (e) => {
      e.preventDefault();
      els.error.textContent = "";
      try {
        if (authMode === "signup") {
          const cred = await createUserWithEmailAndPassword(
            auth,
            els.email.value,
            els.password.value
          );
          // optional display name
          const name = els.email.value.split("@")[0];
          try {
            await updateProfile(cred.user, { displayName: name });
          } catch (_) {}
        } else {
          await signInWithEmailAndPassword(
            auth,
            els.email.value,
            els.password.value
          );
        }
        closeModal();
      } catch (err) {
        els.error.textContent = err.message || "Authentication failed";
      }
    });
  }

  // Google
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

  // logout
  if (els.btnLogout) {
    els.btnLogout.addEventListener("click", async () => {
      await signOut(auth);
      // no need to close modal here
    });
  }
}

export function initAuthUI() {
  const els = getEls();

  onAuthStateChanged(auth, (user) => {
    const loggedIn = !!user;

    // header buttons
    if (els.btnLogin) els.btnLogin.classList.toggle("hidden", loggedIn);
    if (els.btnSignup) els.btnSignup.classList.toggle("hidden", loggedIn);
    if (els.btnLogout) els.btnLogout.classList.toggle("hidden", !loggedIn);

    // show user name
    if (els.userEmail) {
      els.userEmail.textContent = loggedIn
        ? user.displayName || user.email
        : "";
      els.userEmail.classList.toggle("hidden", !loggedIn);
    }

    // show gallery link
    if (els.navGallery) els.navGallery.classList.toggle("hidden", !loggedIn);

    // extra safety: if user just logged in from popup, close modal
    if (loggedIn) {
      closeModal();
    }
  });
}

// for pages that must be logged in
export function requireAuth() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(user);
      } else {
        // open login on top of the current page
        openModal("login");
      }
    });
  });
}
