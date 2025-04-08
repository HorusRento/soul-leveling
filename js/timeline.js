// js/timeline.js
// Version: v1.1.1 - Manages timeline events and memory echoes (Refactored)

// Assumes gameState defined globally
// Assumes global functions: saveState, updateTimelineDisplay, retrieveMemoryEchoes (this file), stripHtml

console.log("Loading Timeline Module (Refactored)...");

function addTimelineEvent(title, description, icon = 'milestone') {
    if (!gameState || !gameState.timelineEvents) { console.error("Cannot add timeline event: gameState not ready."); return; }
    const newEvent = {
        id: Date.now() + Math.random(), timestamp: Date.now(), title: title, description: description,
        // Ensure icon type is valid, default to milestone
        icon: ['levelup', 'ascension', 'evolution', 'gate_cleared', 'red_gate_clear', 'quest_complete', 'shadow_integration', 'title_earned', 'skill_learned', 'item_acquired', 'milestone', 'blessing_gained', 'domain_used'].includes(icon) ? icon : 'milestone'
    };
    gameState.timelineEvents.push(newEvent);
    console.log("Timeline event added:", title);
    saveState();
    updateTimelineDisplay(); // Assumes exists in ui.js
}

// Add a memory echo for AI system use
function addMemoryEcho(eventType, description) {
     if (!gameState || !gameState.memoryEchoes) { console.error("Cannot add memory echo: gameState not ready."); return; }
     const newEcho = {
        id: Date.now() + Math.random(), timestamp: Date.now(), eventType: eventType,
        description: description // Keep descriptions concise for AI processing
    };
    gameState.memoryEchoes.push(newEcho);
    // Limit memory echo history size
     const MAX_ECHOES = 50; // Use constant?
     if (gameState.memoryEchoes.length > MAX_ECHOES) { gameState.memoryEchoes.shift(); }
    // Save state handled by the calling function (e.g., completeQuest, completeGate)
    console.log("Memory echo added:", eventType);
}

// Retrieve memory echoes based on criteria (Used by AI)
function retrieveMemoryEchoes(criteria = {}) {
    const echoes = gameState.memoryEchoes || [];
    let filtered = [...echoes]; // Work on a copy

    if (criteria.type) { filtered = filtered.filter(e => e.eventType === criteria.type); }
    if (criteria.descriptionIncludes) { const searchTerm = criteria.descriptionIncludes.toLowerCase(); filtered = filtered.filter(e => e.description.toLowerCase().includes(searchTerm)); }
    if (criteria.gateType) { filtered = filtered.filter(e => e.eventType.includes('gate_clear') && e.description.toLowerCase().includes(criteria.gateType.toLowerCase())); }
    if (criteria.since) { filtered = filtered.filter(e => e.timestamp >= criteria.since); }

    // Return most recent first, limited count
    return filtered.reverse().slice(0, criteria.count || 5);
}

console.log("Timeline Module (Refactored) Loaded OK.");