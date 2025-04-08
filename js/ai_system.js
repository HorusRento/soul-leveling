// js/ai_system.js
// Version: v1.1.1 - Simulated AI Message & Prompt Generation (Refactored)

// Assumes constants (RARITY, STATS, etc.), gameState defined globally
// Assumes global functions: getSkillData, getItemData, retrieveMemoryEchoes, stripHtml (from utils.js)
// Assumes global functions: calculateEffectiveStat (from effects.js)
// Assumes global functions: notifyInfo, notifyWarning, notifyError, notifyAchievement (from notifications.js)
// Assumes global functions: showModal, setModalContent, hideModal (from ui.js)
// Assumes global functions: setJournalPrompt (from journal.js)

console.log("Loading AI System Module (Refactored)...");

// --- Message Pools (Expanded & Categorized) ---
const messages = {
    // Archetypes
    mystic: [ "The veil thins...", "An echo resonates...", "Stillness reveals...", "Within the paradox...", "Time folds...", "The cosmos breathes...", "What sleeps within...", "Consider the symbols...", "The unseen river flows...", "Look beyond the form...", "Subtle energies shift...", "A resonance is building...", "The path unfolds..." ],
    challenger: [ "Can you withstand...", "Do not falter now...", "Mediocrity is a choice...", "Your limits are illusions...", "Prove your resolve...", "Comfort breeds stagnation...", "Will you answer the call...", "Hesitation is a chain...", "True strength is forged...", "Do not merely endure...", "Is this the extent...", "Complacency is the rust...", "Sharpen your focus..." ],
    guide: [ "Trust the process...", "A moment of pause...", "Your inner wisdom...", "Be gentle with yourself...", "Observe without judgment...", "Clarity will follow.", "Each breath is an anchor...", "You are supported...", "Progress is not always linear...", "Rest allows integration...", "Kindness to self...", "Acknowledge your progress...", "What feels most aligned...", "Consider your core Resonance." ],
    shadow: [ "Denial strengthens...", "The wound is where...", "What part of yourself...", "Illusions crumble...", "Fear is a compass...", "Integration requires...", "The darkest night...", "What you resist, persists...", "Authenticity requires...", "The treasure lies buried...", "Do not shy away...", "What hidden pattern...", "The unacknowledged self..." ],
    // Event-Specific
    general: ["System Online.", "Status Normal.", "Monitoring Vitals.", "Awaiting Input.", "Processing...", "Standby."], // Shorter, system-like
    levelUp: ["Level Up. Potential Increased.", "Essence Brightened. Level {level} Reached.", "Ascension Protocol: Level {level} Attained.", "Growth Milestone Achieved: Level {level}.", "Power Signature Amplified. Level {level}."],
    rankAscension: ["Rank Ascension: {rank}. New Authority Granted.", "Threshold Crossed. Rank {rank} Unlocked.", "System Acknowledges Evolution: Rank {rank}.", `<span class="rarity-epic">Significant Metamorphosis.</span> Rank {rank} Confirmed.`],
    awakeningQuestTrigger: ["Threshold Approaching. Rank {rank} Requires Trial.", "Potential Detected. Awakening Quest Available.", "To Ascend to Rank {rank}, Face the <span class='rarity-rare'>Awakening Trial</span>."],
    soulClassTransform: ["Soul Resonance Shift! Evolved to {newClass}.", "Core Signature Transformed: {newClass}.", "New Archetype Manifested: {newClass}.", `<span class="rarity-rare">Core Evolution Complete.</span> You are now a {newClass}.`],
    gateEntry: ["Warning: Gate Signature Detected.", "Spiritual Instability Manifesting.", "Anomaly Detected. Gate Forming.", "Boundary Fluctuation Detected."],
    redGateEntry: [`<span class="rarity-legendary">!!! WARNING: High-Intensity Energy Detected !!!</span>`, `<span class="rarity-epic">Danger:</span> Unstable Rift Probability High.`, `<span class="rarity-rare">Alert:</span> Red Gate Sector Entered. Extreme Caution Advised.`,],
    redGateEntry_Fear: [`<span class="rarity-epic">Red Gate Protocol: Fear.</span> Manifested Dread detected. Willpower check initiated.`, `<span class="rarity-legendary">Extreme Warning:</span> Concentrated Fear Energy. Overcome or be consumed.`],
    redGateEntry_Doubt: [`<span class="rarity-epic">Red Gate Protocol: Doubt.</span> Illusory constructs strengthening. Maintain Awakening focus.`, `<span class="rarity-legendary">Extreme Warning:</span> Waves of Uncertainty detected. Anchor your conviction.`],
    redGateEntry_Anger: [`<span class="rarity-epic">Red Gate Protocol: Anger.</span> Volatile energy at critical levels. Channel Resonance.`, `<span class="rarity-legendary">Extreme Warning:</span> Uncontrolled Power detected. Control is paramount.`],
    gateConditionFail: ["Gate Stabilization Failed. Condition Unmet.", "Action Insufficient to Seal Rift.", "Residual Shadow Energy Resists.", "Further Effort Required.", "Resonance Output Insufficient."],
    shadowIntegrationComplete: ["Shadow and Light Converge. Integration Achieved.", "Duality Embraced. Shadow Protocol Fulfilled.", "Balance Attained. Hidden Potential Unlocked."],
    newQuest: ["Directive Received: {questTitle}", "Objective Assigned: {questTitle}", "New Path Manifested: {questTitle}", "System Task Generated: {questTitle}"],
    lowStatWarning: ["<span class='rarity-uncommon'>Warning:</span> {stat} levels critically low. Recommend immediate fortification.", "Critical Alert: {stat} deficiency detected. System integrity potentially compromised.", "Your {stat} wavers precariously. Seek reinforcement."],
    highStatMilestone: ["{stat} levels approaching peak threshold ({value}).", "Significant advancement in {stat} acknowledged.", "{stat} resonance ({value}) unusually high. Latent potential detected."],
    memoryEchoTrigger: ["Archival Data Match: {pastEventDesc}. Relevant data retrieved.", "System Recall: Event {pastEventDesc}. Apply learned parameters.", "Cross-referencing... Memory {pastEventDesc} may hold relevance."],
    synchronicity: ["Pattern {pattern} Logged. Analyze for meaning.", "Synchronicity Event: {pattern}. Observe resonance.", "External Data Input: {pattern}. Correlation suggested."],
    journalPrompt: ["Document recent insights.", "Analyze a moment of resistance.", "Describe current emotional resonance.", "Record observed synchronicities.", "Detail progress towards active objectives.", "Identify a limiting belief pattern.", "What requires release?", "Formulate next steps.", "Acknowledge current alignment.", "Assess energy levels."],
    lowProgressWarning: ["<span class='rarity-uncommon'>Alert:</span> Stagnation detected. Consistent action required.", "System analysis indicates low engagement. Proceed with objectives.", "<span class='rarity-rare'>Warning:</span> Potential Resonance degradation due to inactivity.", "Reminder: Daily Rituals stabilize core matrix."],
    blessingActivated: ["<span class='rarity-{rarity}'>Blessing of {type} Activated.</span> Alignment threshold reached.", "Detected Alignment shift. Granting Blessing of {type}."],
    blessingExpired: ["Blessing of {type} has faded.", "Alignment shift detected. Blessing of {type} deactivated."],
    titleEarned: ["Achievement Unlocked: Title [{titleName}] acquired.", "System Recognition: Title [{titleName}] granted."],
    skillLearned: ["Skill Acquisition Protocol Complete. [{skillName}] learned.", "Neural Pathway Update: Skill [{skillName}] integrated."],
    itemAcquired: ["Item Acquired: [{itemName}]. Added to Inventory.", "Asset Logged: [{itemName}] obtained."],
    itemUsed: ["Item Consumed: [{itemName}]. Effect activated.", "Inventory Update: [{itemName}] expended."],
    itemEquipped: ["Equipment Change Detected: [{itemName}] equipped to [{slot}].", "System Integration: [{itemName}] active in [{slot}] slot."],
    itemUnequipped: ["Equipment Change Detected: [{itemName}] returned to Inventory from [{slot}]."],
    statAllocated: ["Stat Point Allocated. {statName} increased.", "{statName} enhanced by User input."],
    commandSuccess: ["Command [{command}] executed.", "System Action: [{command}] complete."],
    commandFail: ["Command [{command}] failed or unknown.", "Invalid Command Syntax: [{command}]. Use 'help'."],
    monarchDomainActivate: ["<span class='rarity-legendary'>Monarch's Domain Activated!</span> Territorial Override Engaged.", "<span class='rarity-epic'>Domain Expansion!</span> Ambient energy under user control."],
    monarchDomainDeactivate: ["Monarch's Domain effect concluding.", "Territorial Override disengaged."],
    monarchDomainCooldown: ["Monarch's Domain recharging. Available in: {time}", "Domain ability requires time to stabilize. Cooldown: {time}"],
    monarchDomainDepleted: ["Monarch's Domain uses depleted for this cycle."],
    // Add more specific event messages
};

// --- AI Logic ---
function updateAIContext(contextUpdate) { Object.assign(gameState.context, contextUpdate); gameState.context.lastSystemInteraction = Date.now(); saveState(); }

function selectArchetype() { /* ... Same biased selection logic ... */ const rand = Math.random(); const avgStat = (calculateEffectiveStat('willpower') + calculateEffectiveStat('awakening') + calculateEffectiveStat('resonance')) / 3; if (gameState.context.action === 'in_gate') { if (rand < 0.45) return 'shadow'; if (rand < 0.75) return 'challenger'; } if (gameState.context.recentEmotion === 'turbulent' && rand < 0.5) return 'shadow'; if (avgStat < 20 && rand < 0.3) return 'guide'; if (calculateEffectiveStat('willpower') < 15 && rand < 0.25) return 'challenger'; if (calculateEffectiveStat('intuition') > 70 && rand < 0.35) return 'mystic'; if (rand < 0.1) return 'challenger'; if (rand < 0.25) return 'shadow'; if (rand < 0.6) return 'guide'; return 'mystic'; }

function generateSystemMessage(context = {}) {
    let possibleMessages = []; let selectedArchetype = selectArchetype(); let usingMemory = false; let eventKey = context.event;

    // 1. Event-Specific Messages (Handles specific red gates, new events)
    if (context.event === 'redGateEntry' && context.gateType) { eventKey = messages[`redGateEntry_${context.gateType}`] ? `redGateEntry_${context.gateType}` : 'redGateEntry'; }
    if (eventKey && messages[eventKey]) { possibleMessages = messages[eventKey]; }

    // 2. Contextual Messages (More detailed checks)
    if (possibleMessages.length === 0) {
        const now = Date.now(); const timeSinceLastExp = now - (gameState.lastExpGainTime || now);
        const effWillpower = calculateEffectiveStat('willpower'); const effAwakening = calculateEffectiveStat('awakening');
        if (effWillpower < 15 && effAwakening < 15 && Math.random() < 0.3) { possibleMessages = ["<span class='rarity-uncommon'>Warning:</span> Inner foundation weak. Willpower and Awakening require focus."]; selectedArchetype = 'challenger'; }
        else { STATS.forEach(stat => { if (possibleMessages.length > 0) return; const effectiveStat = calculateEffectiveStat(stat); if (effectiveStat < 15 && Math.random() < 0.15) { possibleMessages = messages.lowStatWarning.map(m => m.replace('{stat}', stat)); selectedArchetype = 'guide'; } else if (effectiveStat > 80 && Math.random() < 0.15) { possibleMessages = messages.highStatMilestone.map(m => m.replace('{stat}', stat).replace('{value}', effectiveStat)); } }); }
        if (possibleMessages.length === 0 && gameState.context.action === 'idle' && timeSinceLastExp > 1000 * 60 * 60 * 3 && (now - gameState.lastLogin > 1000 * 60 * 5) && Math.random() < 0.4) { possibleMessages = messages.lowProgressWarning; selectedArchetype = 'challenger'; }
    }

     // 3. Memory Echo Integration (More Contextual)
     if (possibleMessages.length === 0 && Math.random() < 0.3) { // Higher chance
        let relevantEchoes = []; const currentAction = gameState.context.action;
        if (currentAction === 'journaling' && gameState.context.recentEmotion === 'doubtful') relevantEchoes = retrieveMemoryEchoes({ type: 'gate_clear', descriptionIncludes: 'Doubt', count: 1});
        else if (calculateEffectiveStat('willpower') < 20) relevantEchoes = retrieveMemoryEchoes({ type: 'gate_clear', descriptionIncludes: 'Resilience', count: 1 });
        else if (gameState.activeQuests.length === 0 && gameState.context.action === 'idle') relevantEchoes = retrieveMemoryEchoes({type: 'quest_complete', count: 2});
        else if (context.stat && context.value < 20) relevantEchoes = retrieveMemoryEchoes({type: 'stat_milestone', descriptionIncludes: context.stat, count: 1}); // Find echo related to low stat
        if (relevantEchoes.length === 0) relevantEchoes = retrieveMemoryEchoes({ count: 3 }); // Fallback
        if (relevantEchoes.length > 0) { const echo = relevantEchoes[Math.floor(Math.random() * relevantEchoes.length)]; let pastDesc = echo.description.toLowerCase().replace("completed quest:", "").replace("cleared gate of", "").replace("red ", "").trim(); pastDesc = pastDesc.length > 25 ? pastDesc.substring(0, 25) + "..." : pastDesc; if (pastDesc) { possibleMessages = messages.memoryEchoTrigger.map(m => m.replace('{pastEventDesc}', pastDesc)); usingMemory = true; } }
    }

    // 4. Archetype Messages (Fallback)
    if (possibleMessages.length === 0) { possibleMessages = messages[selectedArchetype] || messages.general; }

    // Select random message & Perform Template Replacements
    let message = possibleMessages.length > 0 ? possibleMessages[Math.floor(Math.random() * possibleMessages.length)] : messages.general[Math.floor(Math.random() * messages.general.length)];
    // Use context data for replacements
    for (const key in context) { message = message.replace(`{${key}}`, context[key]); }
    // Replace remaining common placeholders
    message = message.replace('{level}', gameState.level); message = message.replace('{rank}', gameState.currentClassRank); message = message.replace('{newClass}', gameState.soulClass); // Assuming soulClass is the one being referred to

    // 5. Guided Intent Module
    let suggestedAction = null; let suggestionText = "";
    if (!context.event?.includes('Gate') && !context.event?.includes('Ascension') && !context.event?.includes('LevelUp') && !context.event?.includes('Transform') && Math.random() < 0.45) { // Increased guidance chance
        suggestedAction = determineGuidance(context, selectedArchetype); if(suggestedAction) { suggestionText = `\n<span class="system-suggestion">[Suggestion]: ${suggestedAction.text}</span>`; } }

    console.log(`AI (${selectedArchetype}): "${stripHtml(message)}${stripHtml(suggestionText)}" (Mem: ${usingMemory})`);
    return { text: message, suggestionText: suggestionText, action: suggestedAction };
}

// Expanded Guidance Rules
function determineGuidance(context, archetype) {
     const effWill = calculateEffectiveStat('willpower');
     // Prioritize immediate needs/opportunities
     if (gameState.statPoints > 0) return { text: `Allocate ${gameState.statPoints} available Stat Point(s).`, action: { type: 'view_stats' } };
     if (gameState.context.recentEmotion === 'turbulent' || calculateEffectiveStat('resonance') < 15) return { text: "Journaling may offer clarity.", action: { type: 'open_journal' } };
     if (effWill < 20 && archetype !== 'challenger') return { text: "Focused breathing could strengthen resolve.", action: { type: 'start_breather', duration: 60 } };
     // Suggest based on resources/state
     if (gameState.timelineEvents.length > 5 && (Date.now() - gameState.timelineEvents[gameState.timelineEvents.length -1].timestamp < 1000 * 60 * 30)) return { text: "Review recent progress on the Timeline.", action: { type: 'view_timeline' } };
     if ((gameState.currency.karma > 80 || gameState.currency.fragments > 25 || gameState.currency.tokens > 5) && gameState.context.action === 'idle' && Math.random() < 0.5) return { text: "Resources available. Visit the Shop?", action: { type: 'open_shop' } };
     if (gameState.currentGate && !gameState.currentGate.isAwakeningGate) return { text: "Focus on the Gate's challenge.", action: { type: 'focus_gate' } };
     if (gameState.context.action === 'idle' && gameState.activeQuests.length > 0 && Math.random() < 0.4) return { text: "Active quests await attention.", action: { type: 'view_quests' } };
     if (gameState.companions.length < 3 && (gameState.currency.fragments >= SUMMON_COMPANION_COST) && Math.random() < 0.3) return { text: "Seek guidance? Summon an Inner Companion.", action: { type: 'summon_companion' } };
     if (calculateEffectiveStat('intuition') > 60 && Math.random() < 0.3) return { text: "Pay attention to subtle synchronicities.", action: { type: 'view_sync_log' } };
     if (gameState.unlockedSkills.length > 0 && Math.random() < 0.15) return { text: "Review your learned Skills.", action: { type: 'view_skills'}};
     if (gameState.inventory.length > 0 && Math.random() < 0.15) return { text: "Check your Inventory for usable items.", action: { type: 'view_inventory'}};
     // Default guidance
     if (Math.random() < 0.1) return { text: "Reflect on your core Resonance.", action: { type: 'open_journal' } };
     return null;
}

// --- Functions to trigger messages ---
function generateAndShowSystemMessage(context = {}, title = "System Message", type = 'prompt') {
     // Gate entry messages have specific formatting/modals handled elsewhere
     if (context.event && (context.event.startsWith('gateEntry') || context.event.startsWith('redGateEntry'))) { console.log(`Gate entry message display handled by gate logic.`); return; }

     const generated = generateSystemMessage(context);
     let finalMessage = generated.text + generated.suggestionText; // Combine message and suggestion
     let actionsHtml = null;
     if (generated.action) { // Generate button HTML if action exists
         const act = generated.action.action; const dataAttrs = `data-action="${act.type}" ${act.value ? `data-value="${act.value}"` : ''} ${act.duration ? `data-duration="${act.duration}"` : ''}`; let buttonText = act.type.replace(/_/g, ' ').replace(/^./, c => c.toUpperCase());
         // Customize button text based on action type
         const buttonTextMap = { 'start_breather': 'Begin Breathwork', 'open_journal': 'Open Journal', 'view_quests': 'View Quests', 'view_timeline': 'View Timeline', 'open_shop': 'Visit Shop', 'summon_companion': 'Attempt Summon', 'view_sync_log': 'View Sync Log', 'focus_gate': 'Refocus', 'view_inventory':'View Inventory', 'view_skills':'View Skills', 'view_equipment': 'View Equipment', 'view_stats': 'Allocate Points' };
         buttonText = buttonTextMap[act.type] || buttonText;
         actionsHtml = `<button class="modal-action-button" ${dataAttrs}>${buttonText}</button> <button class="modal-close">Dismiss</button>`;
     } else { actionsHtml = `<button class="modal-close">Acknowledge</button>`; }

     // Determine modal type/class based on context/message content
     let modalType = type; let modalClass = null;
     if (context.event === 'lowProgressWarning' || title === 'System Warning' || message.toLowerCase().includes('warning')) { modalType = 'warning'; modalClass = 'modal-error'; } // Use error style for warnings
     else if (message.toLowerCase().includes('unlocked') || message.toLowerCase().includes('acquired') || message.toLowerCase().includes('complete')) { modalClass = 'modal-success'; } // Style success messages


     showModal(modalType, null, modalClass);
     setModalContent(title, finalMessage, actionsHtml); // Pass potential HTML
}

function generateJournalPrompt() { /* ... Same logic using utils.stripHtml ... */ const promptPool = messages.journalPrompt; const prompt = promptPool[Math.floor(Math.random() * promptPool.length)]; let suggestedAction = determineGuidance({}, 'guide'); let action = null; let actionText = "Engage"; if (suggestedAction && suggestedAction.action.type !== 'open_journal' && Math.random() < 0.25) { action = suggestedAction.action; actionText = stripHtml(suggestedAction.text).split(':')[1]?.trim() || "Engage"; } setJournalPrompt(prompt, action, actionText); }

console.log("AI System Module (Refactored) Loaded OK.");