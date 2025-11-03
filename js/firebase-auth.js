// js/firebase-auth.js

// Sign up with email/password
function signUp() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  auth.createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      alert("Signed up successfully!");
      window.location.href = 'gallery.html';
    })
    .catch(error => {
      alert(error.message);
    });
}

// Login with email/password
function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      alert("Logged in successfully!");
      window.location.href = 'gallery.html';
    })
    .catch(error => {
      alert(error.message);
    });
}

// Google login
function googleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(result => {
      window.location.href = 'gallery.html';
    })
    .catch(error => {
      alert(error.message);
    });
}

// Logout
function logout() {
  auth.signOut().then(() => {
    window.location.href = 'login.html';
  });
}

// Redirect to login if not logged in
auth.onAuthStateChanged(user => {
  if (!user && window.location.pathname.includes('gallery.html')) {
    window.location.href = 'login.html';
  }
});
