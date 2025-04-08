// js/devMode.js
// Version: v1.1.1 - Developer Mode Functions (Refactored)

// Assumes constants, gameState, uiElements defined globally
// Assumes global functions: saveState, updateUI, triggerRandomGate, activateDivineSync,
// deactivateDivineSync, addExp, updateExpNeeded, updateMaxStats, checkRankAscension,
// checkSoulClassTransformation, addInventoryItem, activateMonarchDomain,
// resetMonarchDomainCooldown, showErrorModal, showSuccessModal, addQuestById,
// getItemData, getSkillData, increaseStatBase, addCurrency, spendCurrency,
// updateAlignment, checkBlessings, unlockSkillById, resetSkillCooldowns,
// currentModalType (from ui.js scope), formatTimeRemaining, checkTitles

console.log("Loading Dev Mode Module (Refactored)...");

function toggleDevMode() {
    gameState.settings.devMode = !gameState.settings.devMode;
    console.log(`Developer Mode ${gameState.settings.devMode ? 'Enabled' : 'Disabled'}`);
    if (uiElements.devModeToggleButton) uiElements.devModeToggleButton.textContent = gameState.settings.devMode ? 'Disable Dev Mode' : 'Enable Dev Mode';
     if (typeof currentModalType !== 'undefined' && (currentModalType === 'settings' || currentModalType === 'dev')) {
         if (uiElements.devModePanel) uiElements.devModePanel.style.display = gameState.settings.devMode ? 'block' : 'none';
         currentModalType = gameState.settings.devMode ? 'dev' : 'settings';
         if (uiElements.modalTitle) uiElements.modalTitle.textContent = currentModalType === 'dev' ? 'Divine Developer Mode' : 'Divine Settings';
     }
    saveState();
}

// --- Dev Mode Action Functions ---
// (These are typically called by an event handler in main.js or ui_interactions.js)

function devSetLevel(level) {
     level = parseInt(level);
     if (!isNaN(level) && level > 0) {
         console.log(`DEV: Setting level to ${level}`); let expNeeded = 0; for(let i=1; i < level; i++) { expNeeded += Math.floor(100 * Math.pow(1.15, i - 1)); }
         gameState.exp = expNeeded; gameState.level = level; let basePoints = (level - 1) * STAT_POINTS_PER_LEVEL; let titlePoints = 0;
         const titleKey = gameState.achievements?.currentTitleKey; const titleData = titleKey ? TITLES[titleKey] : null;
         if (titleKey === 'soulArchitect' && titleData?.effects?.bonusStatPointsLevelMod) { titlePoints = Math.floor(level / titleData.effects.bonusStatPointsLevelMod); }
         gameState.statPoints = basePoints + titlePoints; updateExpNeeded(); updateMaxStats(); checkRankAscension(); checkSoulClassTransformation(); saveState(); updateUI();
         console.log(`DEV: Granted approx ${gameState.statPoints} stat points for level ${level}.`);
     } else { console.warn("DEV: Invalid level input."); }
}
function devAddExp(exp) { exp = parseInt(exp); if (!isNaN(exp) && exp > 0) { console.log(`DEV: Adding ${exp} EXP`); addExp(exp); } else { console.warn("DEV: Invalid EXP input."); } }
function devSetClass(rankOrName) { let found = false; if (!rankOrName) return; for (const levelThreshold in CLASSES) { const rankData = CLASSES[levelThreshold]; if (rankData.name.toLowerCase() === rankOrName.toLowerCase() || rankData.rank.toLowerCase() === rankOrName.toLowerCase()) { console.log(`DEV: Forcing Rank to ${rankData.rank} (${rankData.name})`); gameState.currentClassRank = rankData.rank; gameState.currentClassName = rankData.name; gameState.level = Math.max(gameState.level, parseInt(levelThreshold) || 1); gameState.unlockedAbilities = []; Object.keys(CLASSES).sort((a, b) => parseInt(a) - parseInt(b)).forEach(lvlThr => { if (parseInt(lvlThr) <= gameState.level) { if (CLASSES[lvlThr].unlocks) { CLASSES[lvlThr].unlocks.forEach(ability => { if (!gameState.unlockedAbilities.includes(ability)) gameState.unlockedAbilities.push(ability); }); } } }); updateMaxStats(); found = true; break; } } if(!found) { console.warn(`DEV: Class/Rank "${rankOrName}" not found.`); return; } saveState(); updateUI(); }
function devTriggerGate(forceRed = false) { console.log(`DEV: Triggering ${forceRed ? 'RED ' : ''}Random Gate`); triggerRandomGate(forceRed); }
function devTriggerSync() { console.log("DEV: Triggering Divine Sync"); activateDivineSync(); }
function devAddStatPoints(points) { points = parseInt(points); if (!isNaN(points)) { gameState.statPoints = (gameState.statPoints || 0) + points; console.log(`DEV: Added ${points} Stat Points.`); saveState(); updateUI(); } else { console.warn("DEV: Invalid Stat Points input."); } }
function devSetAlignment(value) { value = parseInt(value); if (!isNaN(value) && value >= -100 && value <= 100) { gameState.alignment = value; console.log(`DEV: Set Alignment to ${value}`); checkBlessings(); saveState(); updateUI(); } else { console.warn("DEV: Invalid Alignment value."); } }
function devAddItem(itemId) { const itemData = getItemData(itemId); if (itemData) { addInventoryItem({...itemData}); console.log(`DEV: Added ${itemData.name}`); } else { showErrorModal(`DEV: Item ID "${itemId}" not found.`); } }
function devAddSkill(skillId) { const skillData = getSkillData(skillId); if (skillData) { if (!gameState.unlockedSkills?.includes(skillId)) { if (!gameState.unlockedSkills) gameState.unlockedSkills = []; gameState.unlockedSkills.push(skillId); console.log(`DEV: Added Skill: ${skillId} (${skillData.name})`); saveState(); updateSkillDisplay(); showSuccessModal(`DEV: Skill '${skillData.name}' Added.`); } else { showModalMessage(`DEV: Skill '${skillId}' already learned.`); } } else { showErrorModal(`DEV: Skill ID '${skillId}' not found.`); } }
function devResetSkillCooldowns() { gameState.activeSkillCooldowns = {}; console.log("DEV: All skill cooldowns reset."); saveState(); updateSkillDisplay(); showSuccessModal("DEV: Skill Cooldowns Reset."); }
function devActivateMonarchDomain() { if (gameState.unlockedAbilities?.includes('monarchDomain')) { activateMonarchDomain(); } else { showErrorModal("Monarch Domain ability not unlocked."); } }
function devResetDomainCooldown() { gameState.monarchDomainCooldown = null; gameState.monarchDomainUses = MONARCH_DOMAIN_MAX_USES; console.log("DEV: Monarch Domain cooldown reset."); saveState(); updateUI(); }

// --- Divine Sync ---
function activateDivineSync(durationSeconds = 30) { if (gameState.divineSync.active) return; console.log("Divine Sync Initiated!"); gameState.divineSync.active = true; gameState.divineSync.endTime = Date.now() + durationSeconds * 1000; triggerDivineSyncAnimation(true); playSfx('divine-sync'); showSuccessModal(`Divine Sync Active! Stats boosted for ${durationSeconds}s.`, "Divine Sync"); setTimeout(deactivateDivineSync, durationSeconds * 1000); saveState(); updateUI(); }
function deactivateDivineSync() { if (!gameState.divineSync.active) return; console.log("Divine Sync Ended."); gameState.divineSync.active = false; gameState.divineSync.endTime = null; triggerDivineSyncAnimation(false); generateAndShowSystemMessage({ event: 'divineSyncEnd' }); saveState(); updateUI(); }

console.log("Dev Mode Module (Refactored) Loaded OK.");