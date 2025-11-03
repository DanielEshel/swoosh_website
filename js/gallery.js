// js/gallery.js
import { storage } from './firebase-init.js';
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

  card.appendChild(title);
  card.appendChild(vid);
  container.appendChild(card);
}

async function loadGallery() {
  const user = await requireAuth();
  const grid = document.getElementById('gallery-grid');
  const empty = document.getElementById('empty-state');
  const errBox = document.getElementById('error-state');

  try {
    const root = ref(storage, `videos/${user.uid}`);
    const listing = await listAll(root);

    if (listing.items.length === 0) {
      if (empty) empty.classList.remove('hidden');
      return;
    }

    for (const itemRef of listing.items) {
      const url = await getDownloadURL(itemRef);
      renderVideoCard(grid, url, itemRef.name);
    }
  } catch (e) {
    console.error(e);
    if (errBox) {
      errBox.classList.remove('hidden');
      errBox.textContent = 'Failed to load your videos.';
    }
  }
}

document.addEventListener('DOMContentLoaded', loadGallery);