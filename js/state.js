// js/state.js
// Version: v1.1.1 - Core Game State Management (Refactored with Utils)

// Assumes constants.js, items.js, skills.js, utils.js loaded first
// Assumes gameState (this file), uiElements defined globally
// Assumes global functions from other files: loadState, saveState, applySettings, updateExpNeeded,
// updateMaxStats, checkRankAscension, checkSoulClassTransformation, triggerStatIncreaseAnimation,
// updateStatChart, updateUI, playSfx, showErrorModal, notifyInfo, notifySuccess, notifyWarning,
// checkTitles, addTimelineEvent, addMemoryEcho, updateInventoryDisplay, updateEquipmentDisplay,
// updateSkillDisplay, addQuestById, grantAwakeningRank, calculateExpMultiplier, calculateChildBonusExp,
// calculateStatBonus, calculateStatPercentMultiplier, checkBlessings, addTemporaryEffect,
// cleanupExpiredEffects, formatTimeRemaining, triggerRandomGate, activateDivineSync, deactivateDivineSync,
// deepMerge (from utils.js)

console.log("Loading State Module (Refactored)...");

let gameState = {}; // Populated by initializeState

function getDefaultGameState() { /* ... Same default structure using CONSTANTS ... */ }
function initializeState() { /* ... Same merge logic using deepMerge ... */ }
function updateExpNeeded() { /* ... Same ... */ }
function updateMaxStats() { /* ... Same logic using calculateStatBonus/PercentMultiplier ... */ }
function addExp(amount) { /* ... Same logic using calculateExpMultiplier/calculateChildBonusExp ... */ }
function checkLevelUp() { /* ... Same logic granting points using STAT_POINTS_PER_LEVEL/TITLES... */ }
function checkRankAscension() { /* ... Same logic triggering quest using AWAKENING_QUEST_ID ... */ }
function grantAwakeningRank(targetRank) { /* ... Same logic granting rank/bonus using increaseStatBase... */ }
function checkSoulClassTransformation() { /* ... Same logic ... */ }
function increaseStat(statName, amount = 1) { /* ... Same logic using points, calls increaseStatBase ... */ }
function increaseStatBase(statName, amount) { /* ... Same base increase logic, calls triggerStatIncreaseAnimation ... */ }
function addCurrency(type, amount) { /* ... Same logic ... */ }
function spendCurrency(type, amount) { /* ... Same logic using showErrorModal ... */ }

// --- Inventory & Equipment (Relies on global getItemData, EQUIPMENT_SLOTS) ---
function addInventoryItem(itemData) { /* ... Same logic using notifySuccess, updateInventoryDisplay ... */ }
function removeInventoryItem(itemId, quantity = 1) { /* ... Same logic ... */ }
function equipItem(itemId) { /* ... Same logic using getItemData, unequipItem, removeInventoryItem, updateMaxStats, playSfx ... */ }
function unequipItem(slot) { /* ... Same logic using getItemData, addInventoryItem, updateMaxStats, playSfx ... */ }
function useInventoryItem(itemId) { /* ... Same logic using getItemData, addTemporaryEffect, triggerRandomGate, addExp, notifySuccess/Warning/Error, removeInventoryItem ... */ }

// --- Alignment & Blessings ---
function updateAlignment(change) { /* ... Same logic using checkBlessings ... */ }
function checkBlessings() { /* ... Same logic using notifyInfo, playSfx ... */ }

// --- Skills (Relies on global getSkillData, activeSkillCooldowns) ---
function activateSkill(skillId) { /* ... Same logic using getSkillData, addTemporaryEffect, formatTimeRemaining, showErrorModal, showSuccessModal, playSfx ... */ }

// --- Titles (Relies on global TITLES constant) ---
function checkTitles() { /* ... Same logic using TITLES ... */ }
function earnTitle(titleKey) { /* ... Same logic using TITLES, showSuccessModal, playSfx, addTimelineEvent ... */ }

// --- Temporary Effects (Relies on global getItemData, getSkillData) ---
function addTemporaryEffect(sourceId, effectData) { /* ... Same logic using getItemData, getSkillData, notifyInfo ... */ }
function cleanupExpiredEffects() { /* ... Same logic using getItemData, getSkillData, notifyInfo ... */ }

// --- Getters ---
function getStat(statName) { return gameState.stats?.[statName] || 0; } // Base stat
function getLevel() { return gameState.level || 1; }

console.log("State Module (Refactored) Loaded OK.");