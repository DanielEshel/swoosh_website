/**
 * js/gallery.js
 * Manages the display, fetching, and deletion of user videos in the gallery.
 * Integrates with Firebase Realtime Database for metadata and Storage for video files.
 */
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

/**
 * --- 1. Delete Function ---
 * Deletes a video file from Cloud Storage and its corresponding entry in the Database.
 * @param {string} videoId - The unique ID of the video in the Realtime Database.
 * @param {string} videoUrl - The storage URL path of the actual .mp4 file.
 * @param {HTMLElement} cardElement - The DOM element representing the card (for localized removal, though state sync handles it).
 */
async function deleteVideo(videoId, videoUrl, cardElement) {
  // Confirm deletion intent with the user
  if (!confirm("Are you sure you want to delete this video?")) return;
  
  // Ensure the user is still authenticated before proceeding
  const user = await requireAuth();
  
  try {
    // 1. Delete the physical video file from Firebase Storage
    const videoFileRef = storageRef(storage, videoUrl);
    await deleteObject(videoFileRef);
    
    // 2. Delete the metadata entry from the Realtime Database
    const videoDbRef = dbRef(db, `videos/${user.uid}/${videoId}`);
    await remove(videoDbRef);
    
    console.log("Video deleted successfully");
  } catch (error) {
    console.error("Error deleting video:", error);
    
    // Fallback: If the physical file is already gone but the DB entry exists,
    // clear the DB entry anyway to prevent "ghost" files in the UI.
    if (error.code === 'storage/object-not-found') {
      const videoDbRef = dbRef(db, `videos/${user.uid}/${videoId}`);
      await remove(videoDbRef);
      console.log("File was missing, but DB entry cleared.");
    } else {
      alert("Could not delete video. See console.");
    }
  }
}

/**
 * --- 2. Render Card Function ---
 * Constructs the HTML DOM structure for a single video card and appends it to the grid.
 * @param {HTMLElement} container - The DOM node where the card will be attached.
 * @param {Object} data - The video metadata fetched from the database.
 */
function renderVideoCard(container, data) {
  const card = document.createElement('div');
  card.className = 'video-card';
  
  // Format the timestamp into a human-readable localized date/time string
  const dateStr = data.timestamp 
    ? new Date(data.timestamp).toLocaleDateString() + ' ' + new Date(data.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    : 'Just now';

  // Build the card HTML structure safely.
  // Note: We wrap the thumbnail/title in an anchor tag that links to video.html?id=...
  card.innerHTML = `
    <div style="position: relative;">
      <button class="delete-btn" style="
          position: absolute; 
          top: 10px; 
          right: 10px; 
          background: rgba(226, 62, 71, 0.9); 
          color: white; 
          border: none; 
          border-radius: 6px; 
          padding: 6px 12px; 
          font-weight: bold;
          cursor: pointer; 
          z-index: 10;
          transition: background 0.2s;">
        Delete
      </button>
      <a href="video.html?id=${data.id}&url=${encodeURIComponent(data.videoUrl)}" style="display:block; text-decoration: none; color: inherit;">
        <video src="${data.videoUrl}" preload="metadata" style="width:100%; aspect-ratio:16/9; background:#000; display:block; border-radius: 12px 12px 0 0; object-fit: cover;" muted></video>
        <div class="video-badge">Speed: ${data.maxSpeed || 'N/A'} mph</div>
      </a>
    </div>
    
    <a href="video.html?id=${data.id}&url=${encodeURIComponent(data.videoUrl)}" style="display:block; text-decoration: none; color: inherit;">
      <div class="video-title" style="padding: 15px;">
        <div style="font-weight: 700; margin-bottom: 4px; font-size: 1.1rem; color: var(--text);">${data.title || 'Practice Session'}</div>
        <div style="font-size: 0.85rem; color: var(--text-muted);">${dateStr} • ${data.rallyCount || 0} shots</div>
      </div>
    </a>
  `;

  // Attach the event listener to the dynamically created delete button
  const deleteBtn = card.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent the click from navigating to the video page
    deleteVideo(data.id, data.videoUrl, card);
  });

  // Inject the fully built card into the DOM
  container.appendChild(card);
}

/**
 * --- 3. Main Load Function (Real-time) ---
 * Connects to the Database and listens for real-time updates to the user's video list.
 */
async function loadGallery() {
  // Ensure the user is logged in before fetching their specific database path
  const user = await requireAuth();
  
  const grid = document.getElementById('gallery-grid');
  const userVideosRef = dbRef(db, `videos/${user.uid}`);

  // Set up a real-time listener on the user's videos path
  onValue(userVideosRef, (snapshot) => {
    // Clear the existing grid on every update to prevent duplicates
    grid.innerHTML = ''; 
    
    if (!snapshot.exists()) {
      // Optional: Handle empty state if the user has no videos
      return;
    }
    
    // Extract the data from the snapshot
    const videosObj = snapshot.val();
    
    // Map the Firebase object into an array and inject the object keys as 'id' properties
    const videosList = Object.entries(videosObj).map(([key, value]) => ({
      ...value,
      id: key
    }));

    // FIX: Sort using 'timestamp' to match the chronological order expected by the Flutter app
    videosList.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    // Iterate through the sorted list and render each card
    videosList.forEach(videoData => {
      renderVideoCard(grid, videoData);
    });
    
  }, (error) => {
    // Log any permission or connection errors
    console.error("Error fetching real-time updates:", error);
  });
}

// Boot up the gallery loading logic once the browser has parsed the initial HTML
document.addEventListener('DOMContentLoaded', loadGallery);