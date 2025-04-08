// js/effects.js
// Version: v1.1.1 - Calculates combined effects from various sources (Refactored)

// Assumes gameState, TITLES defined globally (state.js, constants.js)
// Assumes skillsDatabase, itemDatabase defined globally (skills.js, items.js)
// Assumes notifyInfo defined globally (notifications.js)
// Assumes STATS, EQUIPMENT_SLOTS, RARITY defined globally (constants.js)
// Assumes helper functions like getItemData, getSkillData defined globally (utils.js)

console.log("Loading Effects Module (Refactored)...");

// --- Helper Getters ---
function getActiveCompanions() { return gameState?.companions || []; }
function getEquippedItems() { return gameState?.equipment || {}; }
function getLearnedSkills() { return gameState?.unlockedSkills || []; }
function getActiveTitleData() { return gameState?.achievements?.currentTitleKey ? TITLES[gameState.achievements.currentTitleKey] : null; }
function getActiveBlessing() { if (gameState?.activeBlessing && Date.now() < gameState.activeBlessing.expires) { return gameState.activeBlessing; } return null; }
function getTemporaryEffects(type = null, targetStat = null) {
    if (!gameState?.activeEffects) return []; const now = Date.now();
    return gameState.activeEffects.filter(effect => {
        if (effect.expires && now >= effect.expires) return false;
        if (type && effect.type !== type) return false;
        if (targetStat && effect.targetStat !== targetStat && effect.targetStat !== 'all') return false;
        return true;
    });
}

// --- Stat Calculation ---

// Calculate FLAT bonuses from Companions, Equipment, Passive Skills, Titles, Temp Effects
function calculateStatBonus(statName) {
    let bonus = 0;
    // 1. Companions
    getActiveCompanions().forEach(comp => { let cb = 0; switch (comp.type) { case 'Guardian': if (statName === 'willpower') cb = 5; break; case 'Seer': if (statName === 'intuition') cb = 5; break; case 'Echo': if (statName === 'resonance') cb = 5; break; } bonus += Math.floor(cb * (1 + (comp.level || 0) * 0.1)); });
    // 2. Equipment
    Object.values(getEquippedItems()).forEach(itemId => { if (itemId) { const i = getItemData(itemId); if (i?.effects?.[statName] && typeof i.effects[statName] === 'number') bonus += i.effects[statName]; } });
    // 3. Passive Skills
    getLearnedSkills().forEach(skillId => { const s = getSkillData(skillId); if (s?.passive && s.effects?.[statName] && typeof s.effects[statName] === 'number') bonus += s.effects[statName]; });
    // 4. Titles (Flat) - None currently defined this way
    // 5. Temporary Flat Stat Boosts
    getTemporaryEffects('stat_boost', statName).forEach(effect => bonus += effect.amount || 0);
    return bonus;
}

// Calculate PERCENTAGE bonuses from sources
function calculateStatPercentMultiplier(statName) {
    let multiplier = 1.0;
    // 1. Equipment % Bonuses
    Object.values(getEquippedItems()).forEach(itemId => { if (itemId) { const i = getItemData(itemId); if (i?.effects?.[`${statName}Percent`]) multiplier += i.effects[`${statName}Percent`]; } });
    // 2. Passive Skill % Bonuses
    getLearnedSkills().forEach(skillId => { const s = getSkillData(skillId); if (s?.passive && s.effects?.[`${statName}Percent`]) multiplier += s.effects[`${statName}Percent`]; });
    // 3. Title % Bonuses - None currently defined this way
    // 4. Blessing % Bonuses - None currently defined this way
    // 5. Temporary Percent Stat Boosts (Specific stat or 'all')
    getTemporaryEffects('stat_percent_boost').forEach(effect => { if (effect.targetStat === 'all' || effect.targetStat === statName) { multiplier += effect.allStatsPercent || effect.percent || 0; } });
    // Note: Monarch domain % boost applied differently in calculateEffectiveStat

    return multiplier;
}

// Calculate the FINAL effective stat value including all modifiers
function calculateEffectiveStat(statName) {
    const baseStat = gameState.stats?.[statName] || 0;
    const flatBonus = calculateStatBonus(statName);
    const percentMultiplier = calculateStatPercentMultiplier(statName);

    // Apply percent multiplier to base + flat bonus
    let statAfterMods = Math.floor((baseStat + flatBonus) * percentMultiplier);

    // Apply Monarch Domain Flat Buff (based on BASE stat, applied AFTER other mods)
    if (gameState.context?.monarchDomainActive) {
        statAfterMods += Math.floor(baseStat * 0.5);
    }

    // Apply final flat modifiers (e.g., temporary debuffs)
    let finalFlatModifier = 0;
    getTemporaryEffects('stat_debuff', statName).forEach(effect => finalFlatModifier -= effect.amount || 0);
    statAfterMods += finalFlatModifier;

    return Math.max(0, statAfterMods); // Ensure non-negative
}

// --- Modifier Calculations ---

// Calculate the combined EXP multiplier
function calculateExpMultiplier() {
    let multiplier = 1.0;
    getActiveCompanions().forEach(comp => { if (comp.type === 'Mentor') { multiplier += 0.05 * (1 + (comp.level || 0) * 0.1); } }); // Companions
    if (gameState.unlockedAbilities?.includes('fasterEXP')) { multiplier *= 1.2; } // Abilities
    if (getLearnedSkills().includes('skill_quick_learner')) { multiplier += getSkillData('skill_quick_learner')?.effects?.expGainMod || 0; } // Skills
    if (getActiveBlessing()?.type === 'Light') { multiplier += 0.1; } // Blessings
    if (gameState.divineSync?.active) { multiplier *= gameState.divineSync.boostMultiplier; } // Sync
    if (gameState.context?.monarchDomainActive) { multiplier *= 1.5; } // Domain
    getTemporaryEffects('exp_boost').forEach(effect => multiplier += effect.percent || 0); // Temp Effects
    return multiplier;
}

// Calculate Child companion bonus EXP
function calculateChildBonusExp(baseExpReward) {
    let bonusExp = 0;
    getActiveCompanions().forEach(comp => { if (comp.type === 'Child') { const triggerChance = 0.15 + (comp.level || 0) * 0.01; if (Math.random() < triggerChance) { const bonusMultiplier = 0.10 + (comp.level || 0) * 0.01; const calculatedBonus = Math.floor(baseExpReward * bonusMultiplier); if (calculatedBonus > 0) { bonusExp += calculatedBonus; console.log(`Child (Lvl ${comp.level || 0}) bonus EXP: +${calculatedBonus}`); notifyInfo(`Child's Blessing: +${calculatedBonus} Bonus EXP!`); } } } }); return bonusExp;
}

// Apply modifiers (Trickster, Titles, Skills, Blessings) to currency rewards object
function applyCurrencyModifiers(rewardsObject) {
     if (!rewardsObject?.currency?.length) return;
    let baseMultiplier = 0; // Calculate additive bonuses first
    const titleData = getActiveTitleData(); const skills = getLearnedSkills(); const blessing = getActiveBlessing();
    if (titleData?.name === "Gateborn" && gameState.currentGate) { baseMultiplier += titleData.effects.gateCurrencyMod; console.log("Gateborn Bonus Active"); }
    if (skills.includes('skill_gate_breaker') && gameState.currentGate) { baseMultiplier += getSkillData('skill_gate_breaker')?.effects?.gateCurrencyMod || 0; console.log("Gate Breaker Bonus Active"); }

    rewardsObject.currency.forEach(curr => {
        // Apply base % bonuses
        if (baseMultiplier > 0) { const bonusAmount = Math.ceil(curr.amount * baseMultiplier); if (bonusAmount > 0) { curr.amount += bonusAmount; notifyInfo(`Currency Bonus: +${bonusAmount} ${curr.type}!`); } }
        // Apply Blessing of Darkness specifically to Tokens
        if (blessing?.type === 'Darkness' && curr.type === 'tokens') { const bonusAmount = Math.ceil(curr.amount * 0.25); if (bonusAmount > 0) { curr.amount += bonusAmount; notifyInfo(`Darkness Blessing: +${bonusAmount} Tokens!`); } }
    });

    // Apply Trickster effect last
    let tricksterPresent = getActiveCompanions().some(comp => comp.type === 'Trickster');
    if (tricksterPresent) { const roll = Math.random(); if (roll < 0.20) { console.log("Trickster doubles currency!"); notifyWarning("Trickster's Gamble: Currency Doubled!"); playSfx('currencyGain'); rewardsObject.currency.forEach(curr => curr.amount = (curr.amount || 0) * 2); } else if (roll < 0.30) { console.log("Trickster halves currency!"); notifyWarning("Trickster's Gamble: Currency Halved!"); playSfx('error'); rewardsObject.currency.forEach(curr => curr.amount = Math.floor((curr.amount || 0) / 2)); } }
}

// Calculate Stat Gain Multipliers (Blessings, Titles etc.)
function calculateStatGainMultiplier(statName) {
    let multiplier = 1.0; const titleData = getActiveTitleData(); const blessing = getActiveBlessing();
    if (blessing?.type === 'Light' && statName === 'awakening') { multiplier += 0.15; }
    if (titleData?.name === "Lightwalker" && statName === 'resonance') { multiplier += titleData.effects.resonanceGainMod; }
    getTemporaryEffects('stat_gain_boost', statName).forEach(effect => multiplier += effect.percent || 0);
    return multiplier;
}

// --- Misc Effects ---
// Checks for expired temporary effects AND handles blessing/domain cooldown checks
function checkActiveEffects() {
    const now = Date.now(); let stateChanged = false;
    // Cleanup generic temporary effects
    stateChanged = cleanupExpiredEffects() || stateChanged; // cleanup handles save/UI if needed
    // Check Divine Sync
    if (gameState.divineSync?.active && now >= gameState.divineSync.endTime) { deactivateDivineSync(); stateChanged = true; } // Assumes deactivateDivineSync handles save/UI
    // Check Blessing Expiry
    if (gameState.activeBlessing && now >= gameState.activeBlessing.expires) { console.log(`Blessing expired.`); notifyInfo(`Blessing of ${gameState.activeBlessing.type} has faded...`); gameState.activeBlessing = null; stateChanged = true; }
    // Check Monarch Domain Cooldown
    if (gameState.monarchDomainCooldown && now >= gameState.monarchDomainCooldown) { console.log("Monarch Domain ready."); notifyInfo("Monarch Domain Recharged"); gameState.monarchDomainCooldown = null; gameState.monarchDomainUses = MONARCH_DOMAIN_MAX_USES; stateChanged = true; }
    // Check Monarch Domain Duration (if active) - Should be handled by its own timeout now
    // if (gameState.context?.monarchDomainActive && now >= gameState.context.monarchDomainEndTime) { deactivateMonarchDomain(); stateChanged = true; } // deactivate handles save/UI

    // If only blessing/domain cooldown changed state, trigger save/UI here
    if (stateChanged) { saveState(); updateUI(); }
}

console.log("Effects Module (Refactored) Loaded OK.");