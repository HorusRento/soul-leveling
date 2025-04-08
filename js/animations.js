// js/animations.js
// Version: v1.1.1 - Handles Core Animations (Refactored)

// Assumes constants (TYPING_SPEED), uiElements, playSfx, gameState defined globally
// Assumes global functions: determineAndPlayCurrentMusic, updateStatChart

console.log("Loading Animations Module (Refactored)...");

let typingTimeout = null;

// --- Typing Effect ---
function startTypingAnimation(element, textOrHtml, allowHtml = false, callback) {
    if (!element) { console.warn("Typing animation target element not found."); return; }
    if (typingTimeout) clearTimeout(typingTimeout);
    element.innerHTML = ''; element.classList.remove('completed');
    let i = 0; const speed = TYPING_SPEED || 35; // Use constant

    function type() {
        // Stop if typingTimeout was cleared externally (e.g., hideModal)
        if (!typingTimeout) return;

        if (i < textOrHtml.length) {
            let char = textOrHtml.charAt(i);
            if (allowHtml && char === '<') { let tagEnd = textOrHtml.indexOf('>', i); if (tagEnd !== -1) { element.innerHTML += textOrHtml.substring(i, tagEnd + 1); i = tagEnd; } else { element.textContent += char; } }
            else if (allowHtml && char === '&') { let entityEnd = textOrHtml.indexOf(';', i); if (entityEnd !== -1) { element.innerHTML += textOrHtml.substring(i, entityEnd + 1); i = entityEnd; } else { element.textContent += char; } }
            else { element.innerHTML += char; }
            i++;
            if (char === ' ' || i % 7 === 0) { playSfx('typing'); } // Play sound periodically
            typingTimeout = setTimeout(type, speed);
        } else {
            if (allowHtml) element.innerHTML = textOrHtml; else element.textContent = textOrHtml;
            element.classList.add('completed');
            typingTimeout = null; // Clear timeout reference
            if (callback) callback();
        }
    }
    // Initial call wrapped in timeout to ensure it can be cleared
    typingTimeout = setTimeout(type, 0);
}

// --- Number Ticking Animation ---
function animateNumberTick(element, endValue, duration = 300) {
     if (!element) return;
     if (!gameState.settings.animatedText) { element.textContent = endValue; return; } // Skip if disabled
     const startValue = parseInt(element.textContent.replace(/,/g, '') || '0') || 0; // Handle commas if added
     if (startValue === endValue) return;
     const range = endValue - startValue; let startTime = null;
     function step(timestamp) {
         if (!startTime) startTime = timestamp;
         const progress = Math.min((timestamp - startTime) / duration, 1);
         const currentVal = Math.floor(startValue + range * progress);
         element.textContent = currentVal.toLocaleString(); // Format with commas
         if (progress < 1) { requestAnimationFrame(step); }
         else { element.textContent = endValue.toLocaleString(); }
     } requestAnimationFrame(step);
}

// --- CSS Class Triggers ---
function triggerAscensionAnimation() { console.log("Triggering Ascension Animation..."); uiElements.bodyElement.classList.add('ascension-active'); playMusic('ascension', false); setTimeout(() => { uiElements.bodyElement.classList.remove('ascension-active'); determineAndPlayCurrentMusic(); }, 5000); }
function triggerDivineSyncAnimation(active) { console.log(`Triggering Divine Sync Animation: ${active}`); if (active) { uiElements.bodyElement.classList.add('divine-sync-active'); playSfx('divine-sync'); } else { uiElements.bodyElement.classList.remove('divine-sync-active'); } }
function triggerGateOpenAnimation() { console.log("Triggering Gate Open Animation..."); uiElements.bodyElement.classList.add('gate-active'); }
function triggerGateClearAnimation() { console.log("Triggering Gate Clear Animation..."); uiElements.bodyElement.classList.remove('gate-active'); uiElements.bodyElement.classList.remove('red-gate-active'); }
function triggerStatIncreaseAnimation(statName) {
     const statElement = uiElements.statsDisplay[statName];
     if (statElement) { const parentP = statElement.closest('p'); if (parentP) { parentP.classList.remove('stat-increase-pulse'); void parentP.offsetWidth; parentP.classList.add('stat-increase-pulse'); setTimeout(() => { parentP.classList.remove('stat-increase-pulse'); }, 600); } }
     console.log(`Visual effect for ${statName} increase.`);
}

// --- Theme and Mode Application ---
function applyTheme(themeName) { const themes = ['default', 'celestial', 'shadow', 'monarch']; themes.forEach(t => uiElements.bodyElement.classList.remove(`theme-${t}`)); uiElements.bodyElement.classList.add(`theme-${themeName}`); if (gameState.settings.currentTheme !== themeName) { gameState.settings.currentTheme = themeName; saveState(); } updateStatChart(); console.log(`Theme applied: ${themeName}`); }
function applyNightMode(enabled) { const changed = gameState.settings.nightMode !== enabled; if (enabled) { uiElements.bodyElement.classList.add('night-mode-active'); } else { uiElements.bodyElement.classList.remove('night-mode-active'); } if (changed) { gameState.settings.nightMode = enabled; saveState(); console.log(`Night Mode ${enabled ? 'activated' : 'deactivated'}.`); determineAndPlayCurrentMusic(); } updateStatChart(); }

console.log("Animations Module (Refactored) Loaded OK.");