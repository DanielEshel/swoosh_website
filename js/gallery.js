// js/gallery.js
import { db } from './firebase-config.js'; // This now works because config is fixed
import { requireAuth } from './auth.js';
import { collection, query, where, getDocs, orderBy } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js';

function renderVideoCard(container, data) {
  const card = document.createElement('div');
  card.className = 'video-card';

  // Safe date formatting (handles missing dates)
  const dateStr = data.createdAt && data.createdAt.seconds 
    ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() 
    : 'Just now';

  // HTML with stats overlay
  console.log(data.videoUrl);
  card.innerHTML = `
    <div style="position: relative;">
      <video src="${data.videoUrl}" controls preload="metadata" playsinline style="width:100%; aspect-ratio:16/9; background:#000; display:block; border-radius: 8px 8px 0 0;"></video>
      <div class="video-badge">Speed: ${data.maxSpeed || 'N/A'} mph</div>
    </div>
    <div class="video-title" style="padding: 10px;">
      <div style="font-weight:bold; margin-bottom: 4px;">${data.title || 'Practice Session'}</div>
      <div style="font-size: 0.8rem; opacity: 0.7;">${dateStr} • ${data.rallyCount || 0} shots</div>
    </div>
  `;
  
  container.appendChild(card);
}

async function loadGallery() {
  const user = await requireAuth();
  const grid = document.getElementById('gallery-grid');
  const empty = document.getElementById('empty-state');
  const errorState = document.getElementById('error-state');
  
  // Clear loading state/previous content
  if (grid) grid.innerHTML = '';
  if (errorState) errorState.classList.add('hidden');

  try {
    
    // Query: Give me items from "videos" where userId == current user
    const q = query(
      collection(db, "videos"), 
      where("userId", "==", user.uid)
      // Note: If you uncomment orderBy, you must create an index in Firebase Console
      // orderBy("createdAt", "desc") 
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      if (empty) empty.classList.remove('hidden');
      return;
    }

    // Hide empty state if we have videos
    if (empty) empty.classList.add('hidden');

    querySnapshot.forEach((doc) => {
      renderVideoCard(grid, doc.data());
    });

  } catch (e) {
    console.error("Error loading gallery:", e);
    if (errorState) {
      errorState.textContent = "Could not load stats. Check console for details.";
      errorState.classList.remove('hidden');
    }
  }
}

document.addEventListener('DOMContentLoaded', loadGallery);