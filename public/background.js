// Install event - dummy
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Install event');
});

// Activate event - dummy
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activate event');
});
