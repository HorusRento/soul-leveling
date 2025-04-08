// js/main.js
// Version: v1.1.1 - Main Application Entry Point & Initialization (Refactored)

// --- Global Variables ---
// gameState defined/managed within state.js
// uiElements defined/managed within ui.js
// itemDatabase defined in items.js (loaded before this)
// skillsDatabase defined in skills.js (loaded before this)
// All constants (APP_VERSION, STATS, RARITY etc.) defined in constants.js (loaded before this)

let backgroundPromptInterval = null;
let periodicCheckInterval = null;

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Ensure constants loaded before logging version
    console.log(`DOM Loaded. Initializing The System v${typeof APP_VERSION !== 'undefined' ? APP_VERSION : '???' }...`);

    // 0. Cache UI Elements (Defined in ui.js, ensure it's loaded)
    // Assuming ui.js defines uiElements globally or provides a caching function
    // cacheUIElements(); // Call if needed

    // 1. Load State & Initialize Core Systems (Order matters)
    initializeState();         // state.js - Loads save data or defaults
    initializeAudio();         // audio.js - Sets up audio based on settings
    initializeQuests();        // quests.js - Loads initial/daily quests
    checkActiveEffects();    // effects.js - Cleans up expired buffs/debuffs on load

    // 2. Initial UI Draw
    updateUI();                // ui.js - Renders initial state
    hideLoadingOverlay();      // ui.js - Hides loading screen

    // 3. Setup ALL Event Listeners
    setupStaticEventListeners();     // main.js (this file) - For static elements
    // setupDelegatedEventListeners(); // If using delegation for dynamic elements not covered by ui_interactions
    setupInteractionListeners(); // ui_interactions.js - For complex list items etc.

    // 4. Post-Load Actions
    if (!gameState.settings.userNameSet) {
        setTimeout(askForPlayerName, 1000); // ui.js - Prompt if name not set
    }
    startBackgroundPrompts();  // main.js (this file) - Start AI background tasks
    startPeriodicChecks();     // main.js (this file) - Start checks for effects/dailies

    // 5. PWA Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js') // Path relative to root
            .then(reg => console.log('Service Worker registered.', reg.scope))
            .catch(err => console.error('SW registration failed:', err));
    }
    console.log("The System Initialized and Ready.");
});


// --- Event Listeners Setup ---
function setupStaticEventListeners() {
    console.log("Setting up static event listeners...");
    // Assume uiElements is populated correctly by ui.js loading

    // --- Modal Global Actions ---
    uiElements.modalCloseButton?.addEventListener('click', hideModal);
    uiElements.modalContainer?.addEventListener('click', (event) => { if (event.target === uiElements.modalContainer) { hideModal(); } });

    // --- Settings Panel Direct Toggles/Selectors/Buttons ---
    // Note: Listeners for toggles/select are now often better placed within settings.js if they directly call settings functions
    // But keeping basic ones here for simplicity if settings.js doesn't handle listeners itself.
    uiElements.animatedTextToggle?.addEventListener('change', (e) => toggleAnimatedText(e.target.checked));
    uiElements.nightModeToggle?.addEventListener('change', (e) => toggleNightModeSetting(e.target.checked));
    uiElements.systemPromptsToggle?.addEventListener('change', (e) => toggleSystemPrompts(e.target.checked));
    uiElements.musicToggle?.addEventListener('change', (e) => setMusicEnabled(e.target.checked));
    uiElements.sfxToggle?.addEventListener('change', (e) => setSfxEnabled(e.target.checked));
    uiElements.themeSelector?.addEventListener('change', (e) => changeTheme(e.target.value));
    document.getElementById('export-button')?.addEventListener('click', exportProfile);
    const importFile = document.getElementById('import-file');
    document.getElementById('import-button-wrapper')?.addEventListener('click', () => importFile?.click());
    importFile?.addEventListener('change', (e) => importProfile(e.target.files[0]));
    document.getElementById('reset-button')?.addEventListener('click', resetAllProgress);
    uiElements.devModeToggleButton?.addEventListener('click', toggleDevMode);

     // --- Dev Mode Panel Interactions (Delegated better, but can add direct if panel static) ---
     // Using direct listeners here based on previous structure
     if (uiElements.devModePanel) { uiElements.devModePanel.addEventListener('click', handleDevModeAction); }

    // --- Main UI Button Interactions ---
    document.getElementById('save-journal-entry')?.addEventListener('click', saveJournalEntry);
    uiElements.journalActionBtn?.addEventListener('click', (e) => handleGuidedActionClick(e.target)); // Guided action from journal prompt
    document.getElementById('summon-companion-button')?.addEventListener('click', summonCompanion);
    document.getElementById('activate-karma-mirror')?.addEventListener('click', () => { playSfx('mirror-activate'); activateKarmaMirror(); });
    document.getElementById('open-shop-button')?.addEventListener('click', toggleShop);
    document.getElementById('open-settings-button')?.addEventListener('click', () => { showModal('settings'); playSfx('click'); });
    uiElements.monarchDomainButton?.addEventListener('click', activateMonarchDomain);
    document.getElementById('toggle-command-button')?.addEventListener('click', toggleCommandInput);
    document.getElementById('submit-command-button')?.addEventListener('click', handleCommandSubmit);
    uiElements.commandInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleCommandSubmit(); });

    // Companion Rename/Dismiss (Direct listeners on list for keydown, clicks handled by interaction module)
    uiElements.companionList?.addEventListener('keydown', handleCompanionNameEditKey);
}

// Setup delegated listeners if needed (example for modal actions)
function setupDelegatedEventListeners() {
     console.log("Setting up delegated event listeners...");
     // Modal Dynamic Button Actions (Handles confirmations, guided actions)
     uiElements.modalActions?.addEventListener('click', handleModalActionClick);
     // Add other delegated listeners here if ui_interactions.js doesn't cover specific cases
}

// --- Event Handler Functions ---
// These primarily route events to the correct modules or handle simple logic

function handleModalActionClick(event) {
    const target = event.target; const targetId = target.id;
    if (target.matches('.modal-close') || targetId === 'modal-confirm-button' || targetId === 'modal-default-close' || targetId === 'confirm-reset-no' || targetId === 'confirm-import-no') { hideModal(); }
    else if (targetId === 'flee-gate') { fleeGate(); } // gates.js
    else if (targetId === 'submit-player-name') { handlePlayerNameSubmit(); } // main.js (below)
    else if (targetId === 'confirm-reset-yes') { hideModal(); executeReset(); } // settings.js
    else if (targetId === 'confirm-import-yes') { /* Handled by dynamic listener in saveLoad.js */ }
    else if (target.matches('.modal-action-button')) { handleGuidedActionClick(target); } // main.js (below)
    // Add combat modal action listener if combat uses this area
    else if (target.matches('.combat-action-button')) {
         const action = target.dataset.action; const skillId = target.dataset.skillId;
         handleCombatAction(action, skillId); // combatSimulation.js
    }
}

function handleDevModeAction(event) {
    const target = event.target; if (target.tagName !== 'BUTTON') return;
    const actionId = target.id; let value = null;
    const inputIdMap = { 'dev-set-level': 'dev-level', 'dev-add-exp': 'dev-exp', 'dev-set-class': 'dev-class', 'dev-add-stat-points': 'dev-stat-points', 'dev-set-alignment': 'dev-alignment', 'dev-add-item': 'dev-item-id', 'dev-add-skill': 'dev-skill-id' };
    const inputId = inputIdMap[actionId]; if (inputId) { value = document.getElementById(inputId)?.value; }
    // Route to devMode.js functions
    switch(actionId) {
        case 'dev-set-level': devSetLevel?.(value); break; case 'dev-add-exp': devAddExp?.(value); break;
        case 'dev-set-class': devSetClass?.(value); break; case 'dev-trigger-gate': devTriggerGate?.(); break;
        case 'dev-trigger-red-gate': devTriggerGate?.(true); break; // Pass true to force red
        case 'dev-trigger-sync': devTriggerSync?.(); break; case 'dev-add-stat-points': devAddStatPoints?.(value); break;
        case 'dev-set-alignment': devSetAlignment?.(value); break; case 'dev-add-item': devAddItem?.(value); break;
        case 'dev-add-skill': devAddSkill?.(value); break; case 'dev-reset-skills': devResetSkillCooldowns?.(); break;
        case 'dev-activate-domain': devActivateMonarchDomain?.(); break; case 'dev-reset-domain': devResetDomainCooldown?.(); break;
        default: console.warn("Unknown dev button action:", actionId);
    }
}

function handlePlayerNameSubmit() {
    const inputElement = document.getElementById('player-name-input');
    if (inputElement && inputElement.value.trim()) {
        gameState.playerName = inputElement.value.trim(); gameState.settings.userNameSet = true;
        saveState(); updateUI(); hideModal();
        showSuccessModal(`Welcome, ${gameState.playerName}. Your journey begins.`, "Identity Confirmed");
    } else { showErrorModal("Name cannot be empty."); }
}

function handleGuidedActionClick(target) {
    const action = target.dataset.action; const value = target.dataset.value || target.dataset.duration;
    hideModal(); // Hide modal before handling action
    handleGuidedAction(action, value); // Route to handler
}

function handleCommandSubmit() {
    const input = uiElements.commandInput; if (!input) return;
    const commandText = input.value.trim().toLowerCase(); if (!commandText) return;
    console.log("Processing command:", commandText); input.value = '';
    parseAndExecuteCommand(commandText); // Route to handler
}

function handleCompanionNameEditKey(event) { // Handles Enter/Escape during rename
    const target = event.target; if (target.classList.contains('companion-name') && target.isContentEditable) { const companionLi = target.closest('li[data-companion-id]'); const companionId = companionLi.dataset.companionId; const editButton = companionLi.querySelector('.edit-companion-name-button'); if (event.key === 'Enter') { event.preventDefault(); target.contentEditable = false; editButton.textContent = "Rename"; renameCompanion(companionId, target.textContent); } else if (event.key === 'Escape') { target.contentEditable = false; editButton.textContent = "Rename"; updateCompanionList(); } }
}

// --- Background Processes ---
function startBackgroundPrompts() { stopBackgroundPrompts(); if (gameState.settings.systemPrompts) { console.log("Starting background prompt interval."); backgroundPromptInterval = setInterval(() => { if (!currentModalType) { /* Check modal type from ui.js scope */ const now = Date.now(); const timeSinceLastExp = now - (gameState.lastExpGainTime || now); const isLoggedInShortTime = (now - gameState.lastLogin < 1000 * 60 * 2); const promptChance = (timeSinceLastExp > 1000 * 60 * 10) ? 0.15 : 0.08; if (gameState.context.action === 'idle' && Math.random() < promptChance && !isLoggedInShortTime) { generateAndShowSystemMessage({}, "System Alert"); } else if (Math.random() < 0.05) { checkTriggeredQuests(); } if (Math.random() < 0.15) { generateJournalPrompt(); } if (gameState.context.action === 'idle' && timeSinceLastExp > 1000 * 60 * 60 * 3 && !isLoggedInShortTime && Math.random() < 0.35) { generateAndShowSystemMessage({event: 'lowProgressWarning'}, "System Warning"); } } }, 35 * 1000); } }
function stopBackgroundPrompts() { if (backgroundPromptInterval) { clearInterval(backgroundPromptInterval); backgroundPromptInterval = null; console.log("Stopped background prompt interval."); } }
function startPeriodicChecks() { stopPeriodicChecks(); console.log("Starting periodic check interval."); periodicCheckInterval = setInterval(() => { checkActiveEffects(); checkDailyQuests(); cleanupExpiredEffects(); updateSkillCooldownTimers(); }, 1000); } // Check every second
function stopPeriodicChecks() { if (periodicCheckInterval) { clearInterval(periodicCheckInterval); periodicCheckInterval = null; console.log("Stopped periodic check interval."); } }

// --- Guided Action Handler ---
function handleGuidedAction(action, value) {
     console.log(`Handling guided action: ${action}, Value: ${value}`); let targetElementId = null;
     switch(action) {
         case 'open_journal': targetElementId = 'soul-journal'; uiElements.journalInput?.focus(); break;
         case 'start_breather': startBreathworkSession(parseInt(value || 60)); break;
         case 'view_quests': targetElementId = 'quest-log'; break;
         case 'view_timeline': targetElementId = 'spiritual-timeline'; break;
         case 'open_shop': if(uiElements.shopPanel.style.display === 'none') toggleShop(); targetElementId = 'spiritual-shop'; break;
         case 'summon_companion': summonCompanion(); targetElementId = 'shadow-companions'; break;
         case 'view_sync_log': targetElementId = 'quests-synchronicity'; break;
         case 'focus_gate': if(gameState.currentGate) { showModal('gateEntry'); setModalContent( `Gate of ${gameState.currentGate.type}`, `Focus on the challenge: ${gameState.currentGate.challenge}`, `<button class="modal-close">Continue</button>` ); } break;
         case 'view_inventory': targetElementId = 'inventory-section'; break;
         case 'view_skills': targetElementId = 'skills-section'; break;
         case 'view_equipment': targetElementId = 'equipment-section'; break;
         case 'view_stats': targetElementId = 'stats-allocation'; break;
         default: console.warn(`Unhandled guided action type: ${action}`);
     }
     document.getElementById(targetElementId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function startBreathworkSession(duration) { showSuccessModal(`Starting ${duration}s breathwork session...`, "Breathwork Focus"); playSfx('prompt'); if (gameState.currentGate?.clearCondition.action === 'breathwork') { showModalMessage("Focus on your breathing...", "Gate Challenge"); setTimeout(() => { attemptGateClear({ type: 'breathwork', duration: duration }); }, duration * 1000 + 500); } }

// --- Command Input Handling ---
function parseAndExecuteCommand(cmd) {
    const parts = cmd.split(' '); const command = parts[0]; const args = parts.slice(1); let targetElementId = null; let success = false;
    try { // Add try-catch for robustness
        switch(command) {
             case 'status': case 'stats': targetElementId = 'soul-window'; success = true; break;
             case 'quests': case 'quest': targetElementId = 'quest-log'; success = true; break;
             case 'inventory': case 'inv': targetElementId = 'inventory-section'; success = true; break;
             case 'equipment': case 'eq': targetElementId = 'equipment-section'; success = true; break;
             case 'skills': case 'skill': targetElementId = 'skills-section'; success = true; break;
             case 'companions': case 'shadows': case 'soldiers': targetElementId = 'shadow-companions'; success = true; break;
             case 'journal': targetElementId = 'soul-journal'; success = true; break;
             case 'timeline': targetElementId = 'spiritual-timeline'; success = true; break;
             case 'shop': if(uiElements.shopPanel.style.display === 'none') toggleShop(); targetElementId = 'spiritual-shop'; success = true; break;
             case 'settings': showModal('settings'); success = true; break;
             case 'use': if (args.length > 0) { success = useInventoryItem(args[0]); } else { showErrorModal("Specify item ID."); } break;
             case 'equip': if (args.length > 0) { success = equipItem(args[0]); } else { showErrorModal("Specify item ID."); } break;
             case 'unequip': if (args.length > 0 && EQUIPMENT_SLOTS.includes(args[0])) { success = unequipItem(args[0]); } else { showErrorModal(`Specify slot: ${EQUIPMENT_SLOTS.join('/')}.`); } break;
             case 'daily': if (args.length >= 2 && args[0] === 'complete') { const qId = args[1]; const q = gameState.activeQuests.find(q => q.id === qId && q.type === 'daily'); if (q) { updateQuestProgress(qId, q.goal); completeQuest(qId); success = true; } else { showErrorModal(`Daily quest '${qId}' not found.`); } } else { showErrorModal("Use 'daily complete [id]'."); } break;
             case 'allocate': if (args.length >= 2) { const stat = args[0]; const amount = parseInt(args[1]); if (STATS.includes(stat) && !isNaN(amount) && amount > 0) { success = increaseStat(stat, amount); } else { showErrorModal("Use 'allocate [stat] [amount]'."); } } else { showErrorModal("Specify stat & amount."); } break;
             case 'activate': if (args.length > 0) { success = activateSkill(args[0]); } else { showErrorModal("Specify skill ID."); } break;
             case 'help': showModalMessage("Cmds: status, quests, inv, eq, skills, companions, journal, timeline, shop, settings, use [id], equip [id], unequip [slot], daily complete [id], allocate [stat] [amt], activate [skill_id]", "Help"); success = true; break;
             default: showErrorModal(`Unknown command: '${command}'.`); playSfx('command-fail'); return;
        }
        if (success) { playSfx('command-enter'); if(targetElementId) { document.getElementById(targetElementId)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }
        else { if (!currentModalType) { playSfx('command-fail');} } // Play fail only if no modal shown
    } catch (error) {
         console.error("Error executing command:", cmd, error);
         showErrorModal("Command execution failed.");
    }
}

// --- Getters defined in utils.js ---
// function getItemData(id) { ... }
// function getSkillData(id) { ... }
// function getQuestData(id) { ... }

console.log("Main Module (Refactored) Loaded OK.");