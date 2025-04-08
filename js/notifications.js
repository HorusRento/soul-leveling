// js/notifications.js
// Version: v1.1.1 - Handles temporary UI notifications

// Assumes uiElements, playSfx defined globally
// Assumes constants MAX_VISIBLE_NOTIFICATIONS, NOTIFICATION_DURATION defined globally

console.log("Loading Notifications Module...");

const notificationQueue = [];
let isProcessingQueue = false;

// Main function to add notifications to the queue
function showTemporaryNotification(message, type = 'info') {
    if (typeof uiElements === 'undefined' || !uiElements.notificationArea) {
        notificationQueue.push({ message, type });
        console.warn("Notification area not ready, notification queued.");
        if (!isProcessingQueue) setTimeout(processNotificationQueue, 500); // Attempt to start processing later
        return;
    }
    notificationQueue.push({ message, type });
    if (!isProcessingQueue) {
        processNotificationQueue();
    }
}

// Processes one notification from the queue if space is available
function processNotificationQueue() {
    isProcessingQueue = true;

    if (!uiElements.notificationArea) {
         console.error("Notification area missing, cannot process queue.");
         isProcessingQueue = false; return;
    }

    if (notificationQueue.length > 0 && uiElements.notificationArea.children.length < MAX_VISIBLE_NOTIFICATIONS) {
        const notificationData = notificationQueue.shift();

        const note = document.createElement('div');
        note.className = `system-notification notification-${notificationData.type}`;
        note.setAttribute('role', 'status'); note.setAttribute('aria-live', 'polite');
        note.innerHTML = notificationData.message; // Allow basic HTML

        uiElements.notificationArea.prepend(note); // Add to top

        while (uiElements.notificationArea.children.length > MAX_VISIBLE_NOTIFICATIONS) {
             uiElements.notificationArea.lastChild.remove();
        }

        note.classList.add('notification-fade-in'); // Trigger animation

        // Set timer to start fade out and attach removal listener
        const fadeOutTimer = setTimeout(() => {
            note.classList.remove('notification-fade-in');
            note.classList.add('notification-fade-out');
            note.addEventListener('animationend', handleNotificationRemoval);
        }, NOTIFICATION_DURATION - 500); // Start fade out early

        note.dataset.timerId = fadeOutTimer; // Store timer reference

        // Check if more can be processed immediately
        if (notificationQueue.length > 0 && uiElements.notificationArea.children.length < MAX_VISIBLE_NOTIFICATIONS) {
            requestAnimationFrame(processNotificationQueue);
        } else if (notificationQueue.length === 0 && uiElements.notificationArea.children.length === 0) {
             // If queue became empty and display is clearing, mark processing as false
             // This might happen slightly early, checkQueueAfterRemoval is more robust
             // isProcessingQueue = false;
        }

    } else {
         // If queue is empty OR no space, check again only after an item is removed
         if (notificationQueue.length === 0 && uiElements.notificationArea.children.length === 0) {
              isProcessingQueue = false;
         }
    }
}

// Handler for when fade-out animation ends
function handleNotificationRemoval(event) {
     const note = event.target;
     if (note.parentNode === uiElements.notificationArea) {
          uiElements.notificationArea.removeChild(note);
     }
     // Let the check function handle queue processing
     checkQueueAfterRemoval();
}

// Helper function called after a notification is removed
function checkQueueAfterRemoval() {
     // If there are items AND space, process next
     if (notificationQueue.length > 0 && uiElements.notificationArea.children.length < MAX_VISIBLE_NOTIFICATIONS) {
          processNotificationQueue();
     } else if (notificationQueue.length === 0 && uiElements.notificationArea.children.length === 0) {
          // Stop processing ONLY if queue and display are both empty
          isProcessingQueue = false;
     }
      // If queue has items but no space, wait for next removal.
      // If queue is empty but items still fading out, wait.
}

// Specific notification helpers
function notifyInfo(message) { showTemporaryNotification(message, 'info'); }
function notifySuccess(message) { showTemporaryNotification(message, 'success'); playSfx('success'); }
function notifyWarning(message) { showTemporaryNotification(message, 'warning'); playSfx('error'); } // Use error sound for warning
function notifyError(message) { showTemporaryNotification(message, 'error'); playSfx('error'); }
function notifyAchievement(message) { showTemporaryNotification(`🏆 Achievement: ${message}`, 'achievement'); playSfx('levelup'); } // Use level up sound

console.log("Notifications Module Loaded OK.");