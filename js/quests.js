// js/quests.js
// Version: v1.1.1 - Manages quests and rewards (Refactored with Utils)

// Assumes constants (RARITY, ALIGNMENT_CHANGE, AWAKENING_QUEST_ID), gameState defined globally
// Assumes global functions from utils.js: formatActualRewardsForMessage, getItemData, getSkillData
// Assumes global functions from other files: saveState, updateUI, updateQuestList, playSfx, addExp, increaseStatBase,
// addCurrency, addInventoryItem, updateAlignment, updateAIContext, notifySuccess, notifyInfo, showErrorModal,
// generateAndShowSystemMessage, isActiveOrCompleted (this file), addQuest (this file), addQuestById (this file),
// applyCurrencyModifiers, calculateChildBonusExp, calculateStatGainMultiplier, grantAwakeningRank, updateSkillDisplay

console.log("Loading Quests Module (Refactored)...");

// --- Quest Database (Uses Constants) ---
const questDatabase = [ /* ... Same database structure as last provided ... */
    { id: 'd001', title: 'Moment of Stillness', type: 'daily', description: 'Meditate or sit in silence for 5 minutes.', goal: 1, rewards: { exp: { amount: 15, rarity: RARITY.COMMON }, stats: [{ name: 'resonance', amount: 1, rarity: RARITY.COMMON }] }, alignment: ALIGNMENT_CHANGE.LIGHT_SMALL, repeatable: true },
    { id: 'd002', title: 'Morning Intent', type: 'daily', description: 'Set a clear, positive intention for the day.', goal: 1, rewards: { exp: { amount: 10, rarity: RARITY.COMMON }, stats: [{ name: 'willpower', amount: 1, rarity: RARITY.COMMON }] }, alignment: ALIGNMENT_CHANGE.LIGHT_SMALL, repeatable: true },
    { id: 'd003', title: 'Gratitude Reflection', type: 'daily', description: 'Write down or acknowledge 3 things you are grateful for.', goal: 1, rewards: { exp: { amount: 10, rarity: RARITY.COMMON }, stats: [{ name: 'awakening', amount: 1, rarity: RARITY.COMMON }] }, alignment: ALIGNMENT_CHANGE.LIGHT_MEDIUM, repeatable: true },
    { id: 'm001', title: 'Inner Doubt', description: 'Confront a lingering self-doubt through journaling.', goal: 1, rewards: { exp: { amount: 50, rarity: RARITY.COMMON }, stats: [{ name: 'willpower', amount: 2, rarity: RARITY.UNCOMMON }] }, alignment: ALIGNMENT_CHANGE.DARK_SMALL, trigger: { stat: 'willpower', threshold: 15, condition: 'less' } },
    { id: 'm002', title: 'Intuitive Guidance', description: 'Follow a gut feeling or intuition about a small decision today.', goal: 1, rewards: { exp: { amount: 40, rarity: RARITY.COMMON }, stats: [{ name: 'intuition', amount: 2, rarity: RARITY.UNCOMMON }] }, alignment: ALIGNMENT_CHANGE.LIGHT_SMALL, trigger: { stat: 'intuition', threshold: 20, condition: 'greater' } },
    { id: 'm003', title: 'Act of Service', description: 'Perform a small, selfless act for someone without expectation.', goal: 1, rewards: { exp: { amount: 60, rarity: RARITY.UNCOMMON }, currency: [{ type: 'karma', amount: 5, rarity: RARITY.UNCOMMON }], stats: [{ name: 'awakening', amount: 1, rarity: RARITY.COMMON }] }, alignment: ALIGNMENT_CHANGE.LIGHT_MEDIUM, trigger: 'random' },
    { id: 'm004', title: 'Face the Shadow', description: 'Acknowledge and sit with a difficult emotion without judgment.', goal: 1, rewards: { exp: { amount: 75, rarity: RARITY.UNCOMMON }, currency: [{ type: 'tokens', amount: 1, rarity: RARITY.RARE }], stats: [{ name: 'resonance', amount: 2, rarity: RARITY.UNCOMMON }] }, alignment: ALIGNMENT_CHANGE.DARK_MEDIUM, trigger: { context: 'recentEmotion', value: 'turbulent' } },
    { id: 'm005', title: 'Echoes in the Rift', description: 'Survive and clear a challenging Red Gate.', goal: 1, rewards: { exp: { amount: 200, rarity: RARITY.RARE }, currency: [{ type: 'fragments', amount: 10, rarity: RARITY.RARE }], items: [{ id: 'item_instant_dungeon_01', rarity: RARITY.LEGENDARY }] }, alignment: ALIGNMENT_CHANGE.DARK_SMALL, trigger: { event: 'red_gate_clear' } },
    { id: 'm006', title: 'Path of the Seeker', description: 'Reach Level 10 and demonstrate understanding of core stats.', goal: 1, rewards: { skills: [{ id: 'skill_mana_infusion', rarity: RARITY.UNCOMMON }], exp: { amount: 100, rarity: RARITY.UNCOMMON } }, alignment: ALIGNMENT_CHANGE.LIGHT_SMALL, trigger: { level: 10 } },
    { id: 'm007', title: 'The Weight of Choice', description: 'Make a difficult decision that aligns with either Light or Dark alignment.', goal: 1, rewards: { exp: { amount: 100, rarity: RARITY.UNCOMMON } }, trigger: { /* Needs specific game event trigger */ } },
    { id: 's111', title: 'Synchronicity: Alignment', description: 'You noticed 111. Reflect on your current path.', goal: 1, rewards: { exp: { amount: 25, rarity: RARITY.COMMON }, stats: [{ name: 'intuition', amount: 1, rarity: RARITY.COMMON }] }, alignment: ALIGNMENT_CHANGE.LIGHT_SMALL, trigger: { synchronicity: '111' } },
    { id: 's444', title: 'Synchronicity: Protection', description: 'The pattern 444 appeared. Trust your support.', goal: 1, rewards: { exp: { amount: 25, rarity: RARITY.COMMON }, stats: [{ name: 'willpower', amount: 1, rarity: RARITY.COMMON }] }, alignment: ALIGNMENT_CHANGE.LIGHT_SMALL, trigger: { synchronicity: '444' } },
    { id: AWAKENING_QUEST_ID, title: 'Threshold: The Awakening', type: 'main', description: 'To Ascend to Rank S, overcome a manifestation of your limitations in a specialized Gate simulation.', goal: 1, rewards: { exp: { amount: 1000, rarity: RARITY.EPIC }, currency: [{ type: 'fragments', amount: 50, rarity: RARITY.EPIC }], skills: [{id: 'skill_shadow_step', rarity: RARITY.EPIC}] }, alignment: 0, trigger: null, isAwakeningQuest: true, targetRank: 'S' }
];

// --- Quest Management Functions ---
function initializeQuests() { checkDailyQuests(); checkTriggeredQuests(); updateQuestList(); }
function checkDailyQuests() { /* ... Same logic ... */ }
function checkTriggeredQuests() { /* ... Same logic using calculateEffectiveStat ... */ }
function addQuestById(questId, doSaveAndUpdate = true) { /* ... Same logic ... */ }
function addQuest(questData, doSaveAndUpdate = true) { /* ... Same logic ... */ }
function updateQuestProgress(questId, progressAmount = 1) { /* ... Same logic ... */ }

function completeQuest(questId) {
    const questIndex = gameState.activeQuests.findIndex(q => q.id === questId); if (questIndex === -1) return;
    const quest = gameState.activeQuests[questIndex];
    if (quest.isAwakeningQuest) { showErrorModal("The Awakening quest must be completed through its unique trial."); return; }
    if ((quest.progress || 0) < quest.goal) { showErrorModal("Progress insufficient."); return; }

    console.log(`Completing quest: ${quest.title}`);
    const baseQuestData = getQuestData(quest.id); // Use getter from utils.js
    let originalRewards = baseQuestData?.rewards || quest.rewards || {};
    let finalRewards = JSON.parse(JSON.stringify(originalRewards)); // Deep copy
    let baseExpReward = finalRewards.exp?.amount || 0;

    applyCurrencyModifiers(finalRewards); // Assumes exists in effects.js
    let childBonusExp = calculateChildBonusExp(baseExpReward); // Assumes exists in effects.js

    // Grant Rewards
    let actualExpObject = null; let actualStatsAwarded = []; let actualCurrenciesAwarded = []; let actualItemsAwarded = []; let actualSkillsAwarded = [];

    if (finalRewards.exp?.amount > 0) { addExp(finalRewards.exp.amount); actualExpObject = finalRewards.exp; }
    if (childBonusExp > 0) { addExp(childBonusExp); }
    if (finalRewards.stats?.length > 0) { finalRewards.stats.forEach(sr => { if (sr.amount > 0) { const mult = calculateStatGainMultiplier(sr.name); const amt = Math.ceil(sr.amount * mult); if(amt > 0){ increaseStatBase(sr.name, amt); actualStatsAwarded.push({ ...sr, amount: amt }); if(mult !== 1.0) notifyInfo(`${sr.name} gain boosted! (+${amt - sr.amount})`);} } }); } // Uses increaseStatBase
    if (finalRewards.currency?.length > 0) { finalRewards.currency.forEach(cr => { if (cr.amount > 0) { addCurrency(cr.type, cr.amount); actualCurrenciesAwarded.push(cr); } }); }
    if (finalRewards.items?.length > 0) { finalRewards.items.forEach(i => { const itemData = getItemData(i.id); if(itemData) { addInventoryItem({...itemData, rarity: i.rarity || itemData.rarity}); actualItemsAwarded.push({...itemData, rarity: i.rarity || itemData.rarity});} }); } // Uses addInventoryItem
    if (finalRewards.skills?.length > 0) { finalRewards.skills.forEach(sd => { const skillData = getSkillData(sd.id); if (skillData && !gameState.unlockedSkills.includes(sd.id)) { if (!gameState.unlockedSkills) gameState.unlockedSkills = []; gameState.unlockedSkills.push(sd.id); actualSkillsAwarded.push({...skillData, rarity: sd.rarity || skillData.rarity}); console.log(`Skill Unlocked: ${skillData.name}`); updateSkillDisplay();} }); } // Uses updateSkillDisplay

    if (baseQuestData?.alignment) { updateAlignment(baseQuestData.alignment); } // Uses updateAlignment

    // Use formatter from utils.js
    let rewardMsgString = formatRewardsForMessage({exp:actualExpObject, stats:actualStatsAwarded, currency:actualCurrenciesAwarded, items:actualItemsAwarded, skills:actualSkillsAwarded}, childBonusExp, true);
    showSuccessModal(`Quest Completed: ${quest.title}\nRewards: ${rewardMsgString}`); playSfx('quest-complete');

    if (!quest.repeatable) gameState.completedQuests.push(quest.id);
    addMemoryEcho('quest_complete', `Completed quest: ${quest.title}`); addTimelineEvent(`Quest Completed`, `${quest.title}`, 'quest_complete');
    gameState.activeQuests.splice(questIndex, 1);
    checkTriggeredQuests(); updateAIContext({ action: 'questing', questOutcome: 'success' });
    saveState(); updateQuestList(); updateUI();
}

function abandonQuest(questId) { /* ... Same logic ... */ const questIndex = gameState.activeQuests.findIndex(q => q.id === questId); if (questIndex !== -1) { const quest = gameState.activeQuests[questIndex]; if(quest.type === 'daily') { showModalMessage("Daily rituals cannot be abandoned."); return; } if (quest.isAwakeningQuest) { showErrorModal("The Awakening quest cannot be abandoned."); return; } console.log(`Abandoning quest: ${quest.title}`); gameState.activeQuests.splice(questIndex, 1); showModalMessage(`Quest Abandoned: ${quest.title}`); playSfx('click'); saveState(); updateQuestList(); } }
function isActiveOrCompleted(questId, checkOnlyActive = false) { /* ... Same logic ... */ }
function logSynchronicity(pattern) { /* ... Same logic ... */ }

console.log("Quests Module (Refactored) Loaded OK.");