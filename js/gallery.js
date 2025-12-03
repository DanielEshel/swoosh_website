// js/gallery.js
import { storage } from './firebase-config.js';
import { requireAuth } from './auth.js';
import { ref, listAll, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js';

function renderVideoCard(container, url, name) {
  const card = document.createElement('div');
  card.className = 'video-card';

  const title = document.createElement('div');
  title.className = 'video-title';
  title.textContent = name;

  const vid = document.createElement('video');
  vid.src = url;
  vid.controls = true;
  vid.preload = 'metadata';
  vid.playsInline = true;

  card.appendChild(vid); // Video first
  card.appendChild(title);
  container.appendChild(card);
}

async function loadGallery() {
  const user = await requireAuth(); // Wait for user login
  const grid = document.getElementById('gallery-grid');
  const empty = document.getElementById('empty-state');
  const errBox = document.getElementById('error-state');

  // Clear previous content
  grid.innerHTML = ''; 

  try {
    // Look for videos in a folder named after the user's UID
    const folderRef = ref(storage, `videos/${user.uid}`);
    const listing = await listAll(folderRef);

    if (listing.items.length === 0) {
      if (empty) empty.classList.remove('hidden');
      return;
    }

    // Load each video
    for (const itemRef of listing.items) {
      const url = await getDownloadURL(itemRef);
      renderVideoCard(grid, url, itemRef.name);
    }
  } catch (e) {
    console.error("Gallery Error:", e);
    if (errBox) {
      errBox.classList.remove('hidden');
      errBox.textContent = 'Could not load videos. Make sure you have uploaded files to your folder.';
    }
  }
}

document.addEventListener('DOMContentLoaded', loadGallery);