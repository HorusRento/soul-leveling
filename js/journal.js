// js/journal.js
// Version: v1.1.1 - Handles Journal Entries and Prompts (Refactored)

// Assumes constants, gameState, uiElements defined globally
// Assumes global functions: saveState, notifyError, playSfx, addMemoryEcho, attemptGateClear,
// updateJournalDisplay (in ui.js), detectTags (this file), setJournalPrompt (this file),
// checkJournalQuestProgress (this file), updateAIContext, startTypingAnimation, stripHtml

console.log("Loading Journal Module (Refactored)...");

function saveJournalEntry() {
    if (!uiElements.journalInput) return;
    const entryText = uiElements.journalInput.value.trim();
    const promptArea = uiElements.journalPrompt;
    const promptText = promptArea ? stripHtml(promptArea.innerHTML) : "Personal Reflection"; // Get clean text

    if (entryText === '') { notifyError("Your reflection cannot be empty."); return; }

    const newEntry = {
        id: Date.now() + Math.random(), timestamp: Date.now(),
        prompt: promptText.startsWith("System Prompt:") ? promptText.substring(14).trim() : "Personal Reflection",
        entry: entryText, // Store raw text entry
        tags: detectTags(entryText, promptText) // Use helper
    };

    if (!gameState.journalEntries) gameState.journalEntries = [];
    gameState.journalEntries.push(newEntry);
    addMemoryEcho('journal_entry', `Wrote journal entry: "${entryText.substring(0, 30)}..."`);

    console.log("Journal entry saved:", newEntry);
    uiElements.journalInput.value = ''; // Clear input
    playSfx('journalSave');

    if (gameState.currentGate) { attemptGateClear({ type: 'journal', tags: newEntry.tags, text: newEntry.entry }); }
    checkJournalQuestProgress(newEntry);
    updateAIContext({ action: 'journaling', recentEmotion: 'calm' });
    saveState();
    updateJournalDisplay(); // Refresh UI
}

// Detect tags based on keywords
function detectTags(text, prompt) {
    const tags = new Set();
    const combinedText = (text + ' ' + prompt).toLowerCase();
    // More comprehensive tag map
    const tagMap = { fear:['fear','afraid','anxious','scared','terror','dread'], doubt:['doubt','unsure','uncertain','hesitant','insecure'], anger:['anger','angry','frustrated','irritated','rage','resent'], anxiety:['anxiety','worried','stressed','nervous','panic'], positive:['happy','joy','grateful','blessed','excited','love','peace','good','relief','success'], sadness:['sad','grief','lonely','depressed','down','cry','sorrow','loss'], shadow:['shadow','dark','negative','inner conflict','struggle','pain','trauma','wound'], light:['light','hope','awake','aware','positive','healing','growth','love','clarity','release'], resilience:['strength','courage','overcame','resilience','persevered','strong','push through'], insight:['insight','realization','learned','understood','epiphany','aware','clarity','lesson'], dream:['dream','sleep','nightmare','vision'], meditation:['meditate','meditation','stillness','mindfulness','breath','calm'], synchronicity:['synchronicity','coincidence','sign','pattern','111','444','1111', '222', '333', '555', '777', '888', '999', '1212', 'angel number'], action: ['action', 'decide', 'choose', 'do', 'commit', 'plan'], obstacle: ['obstacle', 'block', 'challenge', 'difficult', 'stuck'], relationship: ['friend', 'family', 'partner', 'relationship', 'connect', 'alone'], work: ['work', 'job', 'career', 'project', 'task', 'goal'], selfcare: ['self-care', 'rest', 'nourish', 'boundary', 'wellbeing'] };
    for (const tag in tagMap) { if (tagMap[tag].some(keyword => combinedText.includes(keyword))) { tags.add(tag); } }
    return Array.from(tags);
}

// Sets the prompt in the UI
function setJournalPrompt(promptText, action = null, actionText = "Engage") {
    if (!uiElements.journalPrompt) return;
    const fullPrompt = `System Prompt: ${promptText}`;
    // Use typing animation if enabled
    if (gameState.settings.animatedText && typeof startTypingAnimation === 'function') {
         startTypingAnimation(uiElements.journalPrompt, fullPrompt, false); // Don't allow HTML here
    } else { uiElements.journalPrompt.textContent = fullPrompt; }
    // Handle action button
    if (uiElements.journalActionBtn) { if (action) { uiElements.journalActionBtn.style.display = 'inline-block'; uiElements.journalActionBtn.textContent = actionText; uiElements.journalActionBtn.dataset.actionType = action.type; uiElements.journalActionBtn.dataset.actionValue = action.value || ''; } else { uiElements.journalActionBtn.style.display = 'none'; delete uiElements.journalActionBtn.dataset.actionType; delete uiElements.journalActionBtn.dataset.actionValue; } }
}

// Check if entry makes progress on quests
function checkJournalQuestProgress(entryData) {
     (gameState.activeQuests || []).forEach(quest => {
        const baseQuestData = getQuestData(quest.id); // Use getter
        if (!baseQuestData || (quest.progress || 0) >= quest.goal) return;
        const goalType = baseQuestData.goalType || quest.goalType;
        if (goalType === 'journal') {
            let progressMade = false; const requiredTags = baseQuestData.requiredTags || quest.requiredTags; const requiredTopic = baseQuestData.requiredTopic || quest.requiredTopic;
            if (requiredTags && entryData.tags) { if (requiredTags.every(tag => entryData.tags.includes(tag))) { progressMade = true; } }
            else if (requiredTopic && entryData.prompt.toLowerCase().includes(requiredTopic.toLowerCase())) { progressMade = true; }
            else if (!requiredTags && !requiredTopic && baseQuestData.description.toLowerCase().includes("journal entry")) { progressMade = true; }
            if (progressMade) { updateQuestProgress(quest.id, 1); } // Assumes exists
        }
    });
}

console.log("Journal Module (Refactored) Loaded OK.");