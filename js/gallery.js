// js/gallery.js
import { db, storage } from './firebase-config.js';
import { requireAuth } from './auth.js';

// Import Realtime Database functions
import { 
  ref as dbRef, 
  remove, 
  onValue 
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js';

// Import Storage functions
import { 
  ref as storageRef, 
  deleteObject 
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js';

// --- 1. Delete Function ---
async function deleteVideo(videoId, videoUrl, cardElement) {
  if (!confirm("Are you sure you want to delete this video?")) return;

  const user = await requireAuth();

  try {
    // A. Delete the file from Storage
    const videoFileRef = storageRef(storage, videoUrl);
    await deleteObject(videoFileRef);

    // B. Delete the entry from Database
    const videoDbRef = dbRef(db, `videos/${user.uid}/${videoId}`);
    await remove(videoDbRef);

    console.log("Video deleted successfully");
    // Note: We don't need to manually remove the card because 
    // onValue in loadGallery will automatically refresh the screen.

  } catch (error) {
    console.error("Error deleting video:", error);
    // If the file is already gone but DB entry exists, we force delete the DB entry
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

  const dateStr = data.createdAt && data.createdAt.seconds 
    ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() 
    : 'Just now';

  // HTML structure
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

  // Attach Delete Event
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

  // This listener runs immediately AND whenever data changes
  onValue(userVideosRef, (snapshot) => {
    
    // Clear the current list
    grid.innerHTML = ''; 

    if (!snapshot.exists()) {
      // Optional: Show an "Empty" message if you have one in your HTML
      // const empty = document.getElementById('empty-state');
      // if (empty) empty.classList.remove('hidden');
      return;
    }

    const videosObj = snapshot.val();

    // Convert Object to Array and add the ID
    const videosList = Object.entries(videosObj).map(([key, value]) => ({
      ...value,
      id: key
    }));

    // Sort by date (newest first)
    videosList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    // Render each video
    videosList.forEach(videoData => {
      renderVideoCard(grid, videoData);
    });
    
  }, (error) => {
      console.error("Error fetching real-time updates:", error);
  });
}

// --- 4. Start ---
document.addEventListener('DOMContentLoaded', loadGallery);