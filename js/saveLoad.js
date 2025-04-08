// js/saveLoad.js
// Version: v1.1.1 - Handles Saving, Loading, Import, Export (Refactored)

// Assumes constants (SAVE_KEY, APP_VERSION), gameState defined globally
// Assumes global functions: deepMerge, initializeState, initializeAudio, initializeQuests,
// startBackgroundPrompts, startPeriodicChecks, stopBackgroundPrompts, stopPeriodicChecks,
// updateUI, showErrorModal, showSuccessModal, showModal, setModalContent, hideModal, playSfx

console.log("Loading Save/Load Module (Refactored)...");

function saveState() {
    try {
        if (typeof gameState === 'undefined' || Object.keys(gameState).length === 0) { return; }
        gameState.lastLogin = Date.now();
        const stateString = JSON.stringify(gameState);
        localStorage.setItem(SAVE_KEY, stateString); // Use specific version key
    } catch (error) { console.error("Save Error:", error); showErrorModal("Failed to save progress.", "Save Error"); }
}

function loadState() {
    try {
        const stateString = localStorage.getItem(SAVE_KEY); // Use specific version key
        if (stateString) { const loaded = JSON.parse(stateString); if (loaded.level === undefined || loaded.settings === undefined) { throw new Error("Invalid save data structure."); } console.log("Save state found."); return loaded; }
        console.log("No saved state found."); return null;
    } catch (error) { console.error("Load Error:", error); showErrorModal(`Failed to load progress: ${error.message}. Resetting.`, "Load Error"); localStorage.removeItem(SAVE_KEY); return null; }
}

function exportProfile() {
    try {
        const stateString = JSON.stringify(gameState, null, 2);
        const blob = new Blob([stateString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        const playerNameSafe = gameState.playerName.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'user';
        a.download = `sl_system_profile_${playerNameSafe}_${APP_VERSION}.json`; // Use constant
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url); console.log("Profile exported.");
        showSuccessModal("Spiritual Profile exported successfully.", "Export Complete"); playSfx('success');
    } catch (error) { console.error("Export Error:", error); showErrorModal(`Failed to export profile: ${error.message}`, "Export Error"); }
}

function importProfile(file) {
    const inputElement = document.getElementById('import-file');
    try {
        if (!file) { throw new Error("No file selected."); }
        if (file.type !== 'application/json') { throw new Error("Invalid file type (must be .json)."); }

        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const importedState = JSON.parse(event.target.result);
                if (importedState.level === undefined || importedState.stats === undefined || importedState.settings === undefined) { throw new Error("File does not appear to be a valid profile."); }
                // Show confirmation modal
                showModal('prompt');
                setModalContent( 'Confirm Import', 'Importing profile will overwrite ALL current progress. Are you sure?', `<button id="confirm-import-yes" style="background-color: var(--accent-color); border-color: var(--accent-color); color: var(--bg-color);">Yes, Import</button><button id="confirm-import-no" class="modal-close">Cancel</button>` );
                // Add listener dynamically
                const confirmBtn = document.getElementById('confirm-import-yes');
                if(confirmBtn) { confirmBtn.addEventListener('click', () => executeImport(importedState) , { once: true }); }
                else { console.error("Cannot find import confirm button."); hideModal(); }
            } catch (error) { console.error("Import Parse/Validation Error:", error); showErrorModal(`Import failed: ${error.message}`, "Import Error"); }
            finally { if (inputElement) inputElement.value = ''; } // Clear input
        };
        reader.onerror = function() { console.error("File Reading Error:", reader.error); showErrorModal("Error reading the selected file."); if (inputElement) inputElement.value = ''; };
        reader.readAsText(file);
    } catch (error) { showErrorModal(error.message, "Import Error"); if (inputElement) inputElement.value = ''; } // Catch initial errors
}

// Performs the actual import after confirmation
function executeImport(importedState) {
     console.log("Executing profile import...");
     hideModal(); // Close confirmation
     stopBackgroundPrompts?.(); stopPeriodicChecks?.(); // Stop tasks
     gameState = deepMerge(getDefaultGameState(), importedState); // Apply imported state
     initializeState(); initializeAudio(); initializeQuests(); // Re-initialize systems
     startBackgroundPrompts?.(); startPeriodicChecks?.(); // Restart tasks
     console.log("Profile imported successfully.");
     showSuccessModal("Journey successfully imported.", "Import Complete");
     updateUI(); playSfx('success');
}

// Auto-save periodically
const autoSaveInterval = setInterval(saveState, 60 * 1000);
// Save on page unload/close
window.addEventListener('beforeunload', () => {
     console.log("Attempting save before unload...");
     saveState(); // Try to save one last time
});

console.log("Save/Load Module (Refactored) Loaded OK.");