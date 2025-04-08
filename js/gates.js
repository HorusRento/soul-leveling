// js/gates.js
// Version: v1.1.1 - Manages Gate entry, conditions, and completion (Refactored)

// Assumes constants (RARITY, ALIGNMENT_CHANGE, AWAKENING_QUEST_ID, RED_GATE_CHANCE), gameState defined globally
// Assumes itemDatabase, skillsDatabase, messages defined globally
// Assumes global functions from utils.js: formatRewardsForMessage, getItemData, getSkillData
// Assumes global functions from other files: showModalMessage, showErrorModal, showSuccessModal, playSfx, playMusic,
// triggerGateOpenAnimation, triggerGateClearAnimation, setModalContent, updateAIContext, saveState, updateUI,
// grantAwakeningRank, addExp, increaseStatBase, addCurrency, addInventoryItem, updateAlignment, notifyInfo,
// checkTitles, addMemoryEcho, addTimelineEvent, checkTriggeredQuests, updateQuestList, updateSkillDisplay,
// determineAndPlayCurrentMusic, startCombatSimulation, applyCurrencyModifiers, calculateChildBonusExp, calculateStatGainMultiplier

console.log("Loading Gates Module (Refactored)...");

// --- Gate Definitions ---
const gateTypes = [ /* ... Same gate definitions as last provided ... */
    { type: "Fear", challenge: "Acknowledge a current fear...", clearCondition: { action: 'journal', tag: 'fear' }, rewards: { exp: { amount: 70, rarity: RARITY.COMMON }, stats: [{ name: 'willpower', amount: 2, rarity: RARITY.UNCOMMON }] }, alignment: ALIGNMENT_CHANGE.DARK_SMALL, redGateChallenge: "Confront the embodiment...", redGateClearCondition: { action: 'journal', tag: 'fear', minLength: 75 }, redGateRewards: { exp: { amount: 150, rarity: RARITY.UNCOMMON }, stats: [{ name: 'willpower', amount: 4, rarity: RARITY.RARE }], currency: [{ type: 'tokens', amount: 1, rarity: RARITY.RARE }] } },
    { type: "Doubt", challenge: "Identify a self-limiting belief...", clearCondition: { action: 'journal', tag: 'doubt' }, rewards: { exp: { amount: 60, rarity: RARITY.COMMON }, stats: [{ name: 'awakening', amount: 1, rarity: RARITY.COMMON }] }, alignment: ALIGNMENT_CHANGE.DARK_SMALL, redGateChallenge: "Dissect a core doubt...", redGateClearCondition: { action: 'journal', tag: 'doubt', requiredCount: 3 }, redGateRewards: { exp: { amount: 130, rarity: RARITY.UNCOMMON }, stats: [{ name: 'awakening', amount: 3, rarity: RARITY.RARE }, { name: 'intuition', amount: 2, rarity: RARITY.UNCOMMON }], items: [{id: 'item_minor_wisdom_orb', rarity: RARITY.RARE }] } },
    { type: "Anger", challenge: "Observe the sensation of anger...", clearCondition: { action: 'breathwork', duration: 120 }, rewards: { exp: { amount: 80, rarity: RARITY.UNCOMMON }, stats: [{ name: 'resonance', amount: 2, rarity: RARITY.UNCOMMON }], currency: [{ type: 'tokens', amount: 1, rarity: RARITY.RARE }] }, alignment: ALIGNMENT_CHANGE.DARK_MEDIUM, redGateChallenge: "Channel the raw energy...", redGateClearCondition: { action: 'breathwork', duration: 300 }, redGateRewards: { exp: { amount: 180, rarity: RARITY.RARE }, stats: [{ name: 'resonance', amount: 4, rarity: RARITY.RARE }, { name: 'willpower', amount: 2, rarity: RARITY.UNCOMMON }], currency: [{ type: 'tokens', amount: 3, rarity: RARITY.EPIC }] } },
    { type: "Anxiety", challenge: "Ground yourself...", clearCondition: { action: 'grounding' }, rewards: { exp: { amount: 50, rarity: RARITY.COMMON }, stats: [{ name: 'intuition', amount: 1, rarity: RARITY.COMMON }] }, alignment: ALIGNMENT_CHANGE.DARK_SMALL, redGateRewards: { exp: { amount: 110, rarity: RARITY.UNCOMMON }, stats: [{ name: 'intuition', amount: 3, rarity: RARITY.RARE }, { name: 'resonance', amount: 1, rarity: RARITY.COMMON }] } },
    { type: "Resilience", challenge: "Recall a past challenge...", clearCondition: { action: 'journal', tag: 'resilience' }, rewards: { exp: { amount: 100, rarity: RARITY.UNCOMMON }, stats: [{ name: 'willpower', amount: 1, rarity: RARITY.COMMON }, { name: 'awakening', amount: 1, rarity: RARITY.COMMON }] }, alignment: ALIGNMENT_CHANGE.LIGHT_SMALL, redGateRewards: { exp: { amount: 220, rarity: RARITY.RARE }, stats: [{ name: 'willpower', amount: 3, rarity: RARITY.RARE }, { name: 'awakening', amount: 2, rarity: RARITY.UNCOMMON }], currency: [{ type: 'fragments', amount: 5, rarity: RARITY.RARE }], items: [{ id: 'item_instant_dungeon_01', rarity: RARITY.LEGENDARY }] } },
    { type: "Awakening Trial", isAwakeningGate: true, challenge: "Face a reflection of your potential...", clearCondition: { action: 'awakening_gate_clear' }, rewards: {}, alignment: 0, }
];

function triggerRandomGate(forceRed = false) { /* ... Same logic using messages object ... */ if (gameState.currentGate) { showErrorModal("You are already within a gate!"); return; } const availableGates = gateTypes.filter(g => !g.isAwakeningGate); if (availableGates.length === 0) { console.error("No standard gate types defined!"); return;} const randomIndex = Math.floor(Math.random() * availableGates.length); let gateData = { ...availableGates[randomIndex] }; let isRed = forceRed || (Math.random() < RED_GATE_CHANCE); let gateEntryMessage = `"You have entered a shadow gate. Face what lies within."`; let gateTitle = `Gate of ${gateData.type}`; let activeClearCondition = gateData.clearCondition; if (isRed) { console.log(`!!! RED GATE TRIGGERED: ${gateData.type} !!!`); let redMsgKey = `redGateEntry_${gateData.type}`; let redWarn = messages[redMsgKey]?.[Math.floor(Math.random() * messages[redMsgKey].length)] || messages.redGateEntry[Math.floor(Math.random() * messages.redGateEntry.length)]; gateEntryMessage = `${redWarn}\n${gateEntryMessage}\n<span class="rarity-rare">This Gate resonates with heightened intensity.</span>`; gateTitle = `<span class="rarity-epic">Red Gate</span> of ${gateData.type}`; gateData.challenge = gateData.redGateChallenge || gateData.challenge; activeClearCondition = gateData.redGateClearCondition || gateData.clearCondition; } gameState.currentGate = { type: gateData.type, challenge: gateData.challenge, clearCondition: activeClearCondition, rewards: gateData.rewards, redGateRewards: gateData.redGateRewards, startTime: Date.now(), isRed: isRed, isAwakeningGate: false }; console.log(`Entering ${isRed ? 'Red ' : ''}Gate: ${gateData.type}`); playSfx(isRed ? 'red-gate-alert' : 'gate-open'); playMusic(isRed ? 'red-gate' : 'gate'); triggerGateOpenAnimation(); if (isRed) { document.body.classList.add('red-gate-active'); } showModal('gateEntry'); setModalContent( gateTitle, gateEntryMessage + `\n\nChallenge: ${gateData.challenge}`, `<button id="accept-gate-challenge" class="modal-close">Accept Challenge</button> <button id="flee-gate">Attempt to Flee</button>` ); updateAIContext({ action: 'in_gate', gateType: gateData.type, isRed: isRed, recentEmotion: 'turbulent' }); saveState(); updateUI(); }

function triggerAwakeningGate() { /* ... Same logic, uses isAwakeningGate flag ... */ }

function attemptGateClear(actionData) { /* ... Same logic (checks minLength, requiredCount if implemented) ... */ }

// *** UPDATED: Uses utils formatter, calls grantExpToAllCompanions, handles Awakening Gate separation ***
function completeGate() {
    if (!gameState.currentGate) return;
    const gateData = gameState.currentGate; const wasRed = gateData.isRed; const wasAwakening = gateData.isAwakeningGate;
    console.log(`Clearing ${wasRed ? 'Red ' : ''}${wasAwakening ? 'Awakening ' : ''}Gate: ${gateData.type}`);

    // --- Handle Awakening Gate Completion ---
    if (wasAwakening) {
        const awakeningQuest = gameState.activeQuests.find(q => q.id === AWAKENING_QUEST_ID);
        if (awakeningQuest) {
             console.log("Marking Awakening Quest as complete.");
             let originalRewards = getQuestData(AWAKENING_QUEST_ID)?.rewards || {}; // Use getter
             let finalRewards = JSON.parse(JSON.stringify(originalRewards));
             let actualExpObject = null; let actualStatsAwarded = []; let actualCurrenciesAwarded = []; let actualItemsAwarded = []; let actualSkillsAwarded = [];
             // Grant base quest rewards before rank bonus
             if (finalRewards.exp?.amount > 0) { addExp(finalRewards.exp.amount); actualExpObject = finalRewards.exp; }
             if (finalRewards.currency?.length > 0) { finalRewards.currency.forEach(cr => { if (cr.amount > 0) { addCurrency(cr.type, cr.amount); actualCurrenciesAwarded.push(cr); } }); }
             if (finalRewards.skills?.length > 0) { finalRewards.skills.forEach(sd => { if (!gameState.unlockedSkills.includes(sd.id)) { gameState.unlockedSkills.push(sd.id); actualSkillsAwarded.push(sd); console.log(`Skill Unlocked: ${sd.name}`); } }); }
             // Grant Awakening Rank and its associated bonuses
             grantAwakeningRank(awakeningQuest.targetRank || 'S'); // This handles stats, abilities, messages
             // Format rewards message ONLY for the quest base rewards
             let rewardMsgString = formatRewardsForMessage({exp:actualExpObject, stats:actualStatsAwarded, currency:actualCurrenciesAwarded, items:actualItemsAwarded, skills:actualSkillsAwarded}, 0, true);
             notifySuccess(`Awakening Trial Base Rewards: ${rewardMsgString}`); // Notify base rewards separately

             const questIndex = gameState.activeQuests.findIndex(q => q.id === AWAKENING_QUEST_ID); if (questIndex !== -1) gameState.activeQuests.splice(questIndex, 1);
             if (!gameState.completedQuests.includes(AWAKENING_QUEST_ID)) gameState.completedQuests.push(AWAKENING_QUEST_ID);
             updateQuestList(); updateSkillDisplay(); // Update relevant UI
        } else { console.error("Awakening Gate cleared but matching quest not found!"); }
        gameState.currentGate = null; updateAIContext({ action: 'idle', recentEmotion: 'triumphant' }); determineAndPlayCurrentMusic(); triggerGateClearAnimation(); saveState(); updateUI(); return;
    }

    // --- Standard & Red Gate Completion Logic ---
    const baseGateData = gateTypes.find(g => g.type === gateData.type);
    let rewardsToGrant = wasRed ? gateData.redGateRewards : gateData.rewards; if (!rewardsToGrant) rewardsToGrant = baseGateData?.rewards || {}; if (!rewardsToGrant) rewardsToGrant = {};
    let finalRewards = JSON.parse(JSON.stringify(rewardsToGrant)); let baseExpReward = finalRewards.exp?.amount || 0;
    applyCurrencyModifiers(finalRewards); // Apply ALL currency mods (Trickster, Title, Skill, Blessing)
    let childBonusExp = calculateChildBonusExp(baseExpReward);
    let actualExpObject = null; let actualStatsAwarded = []; let actualCurrenciesAwarded = []; let actualItemsAwarded = []; let actualSkillsAwarded = [];

    if (finalRewards.exp?.amount > 0) { addExp(finalRewards.exp.amount); actualExpObject = finalRewards.exp; }
    if (childBonusExp > 0) { addExp(childBonusExp); }
    if (finalRewards.stats?.length > 0) { finalRewards.stats.forEach(sr => { if (sr.amount > 0) { const mult = calculateStatGainMultiplier(sr.name); const amt = Math.ceil(sr.amount * mult); if(amt > 0){ increaseStatBase(sr.name, amt); actualStatsAwarded.push({ ...sr, amount: amt }); if(mult !== 1.0) notifyInfo(`${sr.name} gain boosted! (+${amt - sr.amount})`);} } }); }
    if (finalRewards.currency?.length > 0) { finalRewards.currency.forEach(cr => { if (cr.amount > 0) { addCurrency(cr.type, cr.amount); actualCurrenciesAwarded.push(cr); } }); }
    if (finalRewards.items?.length > 0) { finalRewards.items.forEach(i => { const itemData = getItemData(i.id); if(itemData) { addInventoryItem({...itemData, rarity: i.rarity || itemData.rarity}); actualItemsAwarded.push({...itemData, rarity: i.rarity || itemData.rarity});} }); }
    if (finalRewards.skills?.length > 0) { finalRewards.skills.forEach(sd => { const skillData = getSkillData(sd.id); if (skillData && !gameState.unlockedSkills.includes(sd.id)) { if (!gameState.unlockedSkills) gameState.unlockedSkills = []; gameState.unlockedSkills.push(sd.id); actualSkillsAwarded.push({...skillData, rarity: sd.rarity || skillData.rarity}); console.log(`Skill Unlocked: ${skillData.name}`); updateSkillDisplay();} }); }

    if (baseGateData?.alignment) { updateAlignment(baseGateData.alignment); }
    const currentTitleKey = gameState.achievements?.currentTitleKey; const shadowGateTypes = ['Fear', 'Doubt', 'Anger'];
    if (currentTitleKey === 'woundedHealer' && shadowGateTypes.includes(gateData.type)) { const hp = TITLES.woundedHealer.effects.shadowGateHealPercent; const amt = Math.floor(gameState.maxHp * hp); if(amt > 0) { gameState.hp = Math.min(gameState.maxHp, gameState.hp + amt); notifyInfo(`Wounded Healer: +${amt} HP Restored!`); updateUI(); } }

    // *** NEW: Grant EXP to companions after clearing a gate ***
    grantExpToAllCompanions(baseExpReward); // Pass base player EXP gain

    // Format message using helper from utils.js
    let rewardMsgString = formatRewardsForMessage({exp:actualExpObject, stats:actualStatsAwarded, currency:actualCurrenciesAwarded, items:actualItemsAwarded, skills:actualSkillsAwarded}, childBonusExp, true);
    showSuccessModal(`${wasRed ? '<span class="rarity-epic">Red Gate</span> ' : ''}Gate Cleared: ${gateData.type}\nRewards: ${rewardMsgString}`);
    playSfx(wasRed ? 'ascend' : 'gate-clear'); determineAndPlayCurrentMusic(); triggerGateClearAnimation();
    if (wasRed) { document.body.classList.remove('red-gate-active'); }

    gameState.achievements.gatesCleared = (gameState.achievements.gatesCleared || 0) + 1; checkTitles();
    const memoryEventType = wasRed ? 'red_gate_clear' : 'gate_clear'; addMemoryEcho(memoryEventType, `Cleared ${wasRed ? 'Red ' : ''}Gate of ${gateData.type}.`); addTimelineEvent(`${wasRed ? 'Red ' : ''}Gate Cleared`, `Overcame the Gate of ${gateData.type}.`, wasRed ? 'ascension' : 'gate_cleared');
    checkTriggeredQuests(); // Check if clearing this gate triggers m005

    if (shadowGateTypes.includes(gateData.type)) { checkShadowIntegrationProgress(); }
    gameState.currentGate = null; updateAIContext({ action: 'idle', recentEmotion: 'calm' }); saveState(); updateUI();
}

function fleeGate() { /* ... Same logic (prevents fleeing awakening gate) ... */ }
function checkShadowIntegrationProgress() { /* ... Same ... */ }
function completeShadowIntegration() { /* ... Same ... */ }

console.log("Gates Module (Refactored) Loaded OK.");