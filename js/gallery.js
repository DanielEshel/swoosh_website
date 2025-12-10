// js/gallery.js
import { db, storage } from './firebase-config.js';
import { requireAuth } from './auth.js';

import { 
  ref as dbRef, 
  remove, 
  onValue 
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js';

import { 
  ref as storageRef, 
  deleteObject 
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js';

// --- 1. Delete Function ---
async function deleteVideo(videoId, videoUrl, cardElement) {
  if (!confirm("Are you sure you want to delete this video?")) return;

  const user = await requireAuth();

  try {
    const videoFileRef = storageRef(storage, videoUrl);
    await deleteObject(videoFileRef);

    const videoDbRef = dbRef(db, `videos/${user.uid}/${videoId}`);
    await remove(videoDbRef);

    console.log("Video deleted successfully");

  } catch (error) {
    console.error("Error deleting video:", error);
    if (error.code === 'storage/object-not-found') {
       const videoDbRef = dbRef(db, `videos/${user.uid}/${videoId}`);
       await remove(videoDbRef);
       console.log("File was missing, but DB entry cleared.");
    } else {
       alert("Could not delete video. See console.");
    }
  }
}

// --- 2. Render Card Function ---
function renderVideoCard(container, data) {
  const card = document.createElement('div');
  card.className = 'video-card';

  // FIX: Matches Flutter 'timestamp' (milliseconds) instead of 'createdAt'
  const dateStr = data.timestamp 
    ? new Date(data.timestamp).toLocaleDateString() + ' ' + new Date(data.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    : 'Just now';

  card.innerHTML = `
    <div style="position: relative;">
      
      <button class="delete-btn" style="
          position: absolute; 
          top: 10px; 
          right: 10px; 
          background: rgba(255, 0, 0, 0.8); 
          color: white; 
          border: none; 
          border-radius: 4px; 
          padding: 5px 10px; 
          cursor: pointer; 
          z-index: 10;">
        Delete
      </button>

      <video src="${data.videoUrl}" controls preload="metadata" playsinline style="width:100%; aspect-ratio:16/9; background:#000; display:block; border-radius: 8px 8px 0 0;"></video>
      <div class="video-badge">Speed: ${data.maxSpeed || 'N/A'} mph</div>
    </div>
    <div class="video-title" style="padding: 10px;">
      <div style="font-weight:bold; margin-bottom: 4px;">${data.title || 'Practice Session'}</div>
      <div style="font-size: 0.8rem; opacity: 0.7;">${dateStr} • ${data.rallyCount || 0} shots</div>
    </div>
  `;

  const deleteBtn = card.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', () => {
    deleteVideo(data.id, data.videoUrl, card);
  });
  
  container.appendChild(card);
}

// --- 3. Main Load Function (Real-time) ---
async function loadGallery() {
  const user = await requireAuth();
  const grid = document.getElementById('gallery-grid');
  
  const userVideosRef = dbRef(db, `videos/${user.uid}`);

  onValue(userVideosRef, (snapshot) => {
    grid.innerHTML = ''; 

    if (!snapshot.exists()) {
      // Optional: Handle empty state
      return;
    }

    const videosObj = snapshot.val();

    const videosList = Object.entries(videosObj).map(([key, value]) => ({
      ...value,
      id: key
    }));

    // FIX: Sort using 'timestamp' to match Flutter
    videosList.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    videosList.forEach(videoData => {
      renderVideoCard(grid, videoData);
    });
    
  }, (error) => {
      console.error("Error fetching real-time updates:", error);
  });
}

document.addEventListener('DOMContentLoaded', loadGallery);