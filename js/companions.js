// js/companions.js
// Version: v1.1.1 - Manages Companions/Shadow Soldiers (Refactored)

// Assumes constants (COMPANION_MAX_LEVEL, SUMMON_COMPANION_COST...), gameState, uiElements defined globally
// Assumes global functions: showErrorModal, showSuccessModal, notifyInfo, notifySuccess, playSfx,
// saveState, updateUI, updateCompanionList, spendCurrency, getCompanionExpNeeded (this file),
// checkCompanionLevelUp (this file), addCompanionExp (this file)

console.log("Loading Companions Module (Refactored)...");

const companionTypes = [ /* ... Same definitions ... */ ];
const companionNames = [ /* ... Same expanded list ... */ ];

// --- Companion Leveling ---
function getCompanionExpNeeded(currentLevel) { return Math.floor(50 * Math.pow(1.25, currentLevel)); }

function addCompanionExp(companionId, amount) {
    const companion = gameState.companions.find(c => c.id === companionId);
    const currentLevel = Number(companion?.level) || 0;
    if (!companion || currentLevel >= COMPANION_MAX_LEVEL) return 0;
    const actualAmount = Math.max(1, Math.floor(amount));
    companion.exp = (Number(companion.exp) || 0) + actualAmount;
    console.log(`Companion ${companion.name} gained ${actualAmount} EXP.`);
    checkCompanionLevelUp(companion);
    return actualAmount;
}

function grantExpToAllCompanions(basePlayerExpGain) {
    if (!gameState.companions || gameState.companions.length === 0) return;
    const expPerCompanion = Math.max(1, Math.floor(basePlayerExpGain * 0.1)); // Base 10%
    console.log(`Granting ${expPerCompanion} EXP to each active companion.`);
    let stateChangedByLevelUp = false;
    gameState.companions.forEach(comp => { const added = addCompanionExp(comp.id, expPerCompanion); if (added > 0) stateChangedByLevelUp = true; });
    if (stateChangedByLevelUp) { saveState(); updateCompanionList(); /* UI update handled by check level up */ }
}

function checkCompanionLevelUp(companion) {
    let leveledUp = false; let currentLevel = Number(companion.level) || 0; let currentExp = Number(companion.exp) || 0; let expNext = Number(companion.expNext) || getCompanionExpNeeded(currentLevel);
    while (currentLevel < COMPANION_MAX_LEVEL && currentExp >= expNext) {
        currentExp -= expNext; currentLevel++; leveledUp = true; expNext = getCompanionExpNeeded(currentLevel);
        console.log(`Companion ${companion.name} Leveled Up to Level ${currentLevel}!`);
        notifySuccess(`${companion.name} reached Level ${currentLevel}!`); playSfx('levelup');
    }
    companion.level = currentLevel; companion.exp = currentExp; companion.expNext = (currentLevel < COMPANION_MAX_LEVEL) ? expNext : 0;
    if (leveledUp) { updateUI(); /* Recalculate effective stats */ /* Save handled by caller */ }
}

// --- Companion Management ---
function summonCompanion() {
    const MAX_COMPANIONS = 3; if (gameState.companions.length >= MAX_COMPANIONS) { showErrorModal(`Cannot guide more than ${MAX_COMPANIONS} companions.`); return; }
    if(!spendCurrency('fragments', SUMMON_COMPANION_COST)) { return; } // Use constant
    const randomTypeData = companionTypes[Math.floor(Math.random() * companionTypes.length)]; let randomName; let attempts = 0;
    do { randomName = companionNames[Math.floor(Math.random() * companionNames.length)]; attempts++; } while (gameState.companions.some(c => c.name === randomName) && attempts < 50)
    const newCompanion = { id: Date.now()+Math.random(), name: randomName, type: randomTypeData.type, summonedAt: Date.now(), level: 0, exp: 0, expNext: getCompanionExpNeeded(0) };
    if (!gameState.companions) gameState.companions = []; gameState.companions.push(newCompanion);
    console.log(`Summoned Companion: ${newCompanion.name} (Lvl ${newCompanion.level}) (${newCompanion.type})`);
    playSfx('summon'); showSuccessModal(`A presence joins you: ${newCompanion.name}, the ${newCompanion.type}.`, "Summoning Successful");
    saveState(); updateCompanionList(); updateUI();
}

function renameCompanion(companionId, newName) { /* ... Same logic ... */ }
function dismissCompanion(companionId) { /* ... Same logic ... */ }

// Spend fragments to level up a companion
function levelUpCompanionWithFragments(companionId, levels = 1) {
    const companion = gameState.companions.find(c => c.id == companionId); if (!companion) { showErrorModal("Companion not found."); return; }
    const currentLevel = companion.level || 0; if (currentLevel >= COMPANION_MAX_LEVEL) { showErrorModal(`${companion.name} is at Max Level.`); return; }
    const costPerLevel = COMPANION_LEVEL_UP_BASE_COST + currentLevel * COMPANION_LEVEL_UP_SCALING_COST; // Use constants
    const totalCost = costPerLevel * levels; // Assume levels = 1 for button click
    if (!spendCurrency('fragments', totalCost)) { return; }
    // Set EXP needed for level up
    companion.exp = companion.expNext || getCompanionExpNeeded(currentLevel);
    checkCompanionLevelUp(companion); // Handles level up, messages, UI update
    saveState(); // Save state after level up attempt
    updateCompanionList(); // Refresh list
}

console.log("Companions Module (Refactored) Loaded OK.");