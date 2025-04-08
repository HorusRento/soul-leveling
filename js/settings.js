// js/settings.js
// Version: v1.1.1 - Manages user settings and reset functionality (Refactored)

// Assumes constants (APP_VERSION, SAVE_KEY), gameState, uiElements defined globally
// Assumes global functions: saveState, applyTheme, applyNightMode, playSfx, updateThemeSelector (this file),
// showModal, setModalContent, hideModal, executeReset (this file), stopBackgroundPrompts, stopPeriodicChecks,
// initializeState, initializeAudio, initializeQuests, startBackgroundPrompts, startPeriodicChecks,
// updateUI, askForPlayerName, showSuccessModal, showErrorModal, toggleDevMode, setMusicEnabled, setSfxEnabled,
// deepMerge, getDefaultGameState // Needed for executeReset

console.log("Loading Settings Module (Refactored)...");

function applySettings() {
    if (!gameState || !gameState.settings) return;
    // Ensure volume settings exist with defaults if loading older save
    gameState.settings.baseVolume = gameState.settings.baseVolume ?? 0.5;
    gameState.settings.musicVolume = gameState.settings.musicVolume ?? gameState.settings.baseVolume;
    gameState.settings.sfxVolume = gameState.settings.sfxVolume ?? gameState.settings.baseVolume;

    setMusicEnabled(gameState.settings.musicEnabled); // Applies volume too
    setSfxEnabled(gameState.settings.sfxEnabled);
    applyTheme(gameState.settings.currentTheme);
    applyNightMode(gameState.settings.nightMode);
    updateSettingsPanel(); // Ensure UI reflects loaded/default settings
}

function toggleAnimatedText(enabled) { if(gameState.settings.animatedText !== enabled){ gameState.settings.animatedText = enabled; console.log(`Animated Text ${enabled ? 'Enabled' : 'Disabled'}`); saveState(); } }
function toggleNightModeSetting(enabled) { if(gameState.settings.nightMode !== enabled) { playSfx('theme-change'); applyNightMode(enabled); } }
function toggleSystemPrompts(enabled) { if(gameState.settings.systemPrompts !== enabled) { gameState.settings.systemPrompts = enabled; console.log(`Background Prompts ${enabled ? 'Enabled' : 'Disabled'}`); if (enabled) { startBackgroundPrompts?.(); } else { stopBackgroundPrompts?.(); } saveState(); } }
function changeTheme(themeName) { if(gameState.settings.currentTheme !== themeName) { if (themeName === 'default' || gameState.settings.unlockedThemes?.includes(themeName)) { playSfx('theme-change'); applyTheme(themeName); } else { showErrorModal(`Theme "${themeName}" is not unlocked.`); if (uiElements.themeSelector) uiElements.themeSelector.value = gameState.settings.currentTheme; } } }

function resetAllProgress() {
    showModal('prompt');
    setModalContent( 'Confirm Reset', '<span class="rarity-legendary">WARNING:</span> This will erase ALL progress. This cannot be undone. Are you sure?', `<button id="confirm-reset-yes" style="background-color: var(--error-color); border-color: var(--error-color); color: white;">Yes, Reset Everything</button><button id="confirm-reset-no" class="modal-close">Cancel</button>` );
    // Listener in main.js handles confirmation
}

// Performs the actual reset (called from main.js listener)
function executeReset() {
     console.log("Resetting all game data...");
     localStorage.removeItem(SAVE_KEY);
     stopBackgroundPrompts?.(); stopPeriodicChecks?.();
     gameState = getDefaultGameState(); // Get fresh defaults
     // Re-initialize ALL systems
     initializeState(); // This now applies settings & saves
     initializeAudio(); initializeQuests();
     startBackgroundPrompts?.(); startPeriodicChecks?.();
     updateUI(); // Full UI refresh
     showSuccessModal("Your journey has been reset to its beginning.", "System Reset");
     if (!gameState.settings.userNameSet) { setTimeout(askForPlayerName, 500); }
}

// Update theme selector options
function updateThemeSelector() {
     const selector = uiElements.themeSelector; if (!selector) return;
     const currentValue = gameState.settings.currentTheme;
     while (selector.options.length > 1) { selector.remove(1); }
     const themes = { celestial: "Celestial Radiance", shadow: "Shadow Sovereign", monarch: "Monarch of Light" }; // Keep display names here
     (gameState.settings.unlockedThemes || []).forEach(themeKey => { if (themes[themeKey]) { const option = document.createElement('option'); option.value = themeKey; option.textContent = `${themes[themeKey]} (${themeKey.charAt(0).toUpperCase() + themeKey.slice(1)})`; selector.appendChild(option); } });
     selector.value = currentValue;
}

console.log("Settings Module (Refactored) Loaded OK.");