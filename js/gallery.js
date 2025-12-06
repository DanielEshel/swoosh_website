// js/gallery.js
import { db } from './firebase-config.js'; // This now works because config is fixed
import { requireAuth } from './auth.js';
import { ref, get } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js';

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
  // ... (keep UI clearing code) ...

  try {
    // ⚡️ THE BIG CHANGE: 
    // Instead of searching the whole list, we point DIRECTLY to the user's folder
    const userVideosRef = ref(db, `videos/${user.uid}`);

    const snapshot = await get(userVideosRef);

    if (!snapshot.exists()) {
      if (empty) empty.classList.remove('hidden');
      return;
    }

    // Convert Object to Array
    const videosObj = snapshot.val();
    const videosList = Object.values(videosObj); 

    // Sort by date (newest first)
    videosList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    videosList.forEach(videoData => {
      renderVideoCard(grid, videoData);
    });

  } catch (e) {
    console.error("Gallery Error:", e);
    // ... error handling ...
  }
}

document.addEventListener('DOMContentLoaded', loadGallery);