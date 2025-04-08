// js/ui.js
// Version: v1.1.1 - Handles DOM Updates and UI State (Refactored with Utils)

// Assumes constants.js, items.js, skills.js, notifications.js, effects.js, utils.js are loaded first
// Assumes gameState, uiElements defined globally
// Assumes global functions from other files: calculate*, playSfx, increaseStat, useInventoryItem, equipItem,
// unequipItem, activateSkill, levelUpCompanionWithFragments, toggleShop, displayShopItems,
// updateThemeSelector, APP_VERSION, formatTimeRemaining, formatRewardsForMessage, getItemData,
// getSkillData, stripHtml, animateNumberTick, askForPlayerName, hideLoadingOverlay, etc.

console.log("Loading UI Module (Refactored)...");

let soulStatChartInstance = null;
let skillTimerInterval = null; // Handle for cooldown timer updates

// --- Main UI Update Function ---
function updateUI() {
    if (!gameState || typeof uiElements === 'undefined') { console.error("GameState or UI Elements cache not ready."); return; }
    requestAnimationFrame(() => { // Smooth updates
        try {
            updateHUD(); updateSoulWindow(); updateStatsDisplay(); updateMonarchDomainDisplay();
            updateStatChart(); updateQuestList(); updateJournalDisplay(); updateTimelineDisplay();
            updateCompanionList(); updateShopDisplay(); updateSettingsPanel(); updateInventoryDisplay();
            updateEquipmentDisplay(); updateSkillDisplay();
        } catch (error) { console.error("Error during updateUI:", error); }
    });
}

// --- Sub-Update Functions ---
function updateHUD() {
    if (!uiElements.hudLevel) return;
    uiElements.hudLevel.textContent = `Lv. ${gameState.level}`;
    const expPercent = gameState.expNext > 0 ? (gameState.exp / gameState.expNext) * 100 : (gameState.level >= MAX_LEVEL && gameState.currentClassRank === 'M' ? 100 : 0);
    uiElements.hudExpBar.style.width = `${Math.min(expPercent, 100)}%`; uiElements.hudExpBar.setAttribute('aria-valuenow', Math.round(expPercent));
    const effInt = calculateEffectiveStat('intuition'); const effWil = calculateEffectiveStat('willpower'); // Assumes calculateEffectiveStat exists
    uiElements.hudPassiveStats.textContent = `Int: ${effInt} | Wil: ${effWil}`;
    updateBlessingDisplay();
}

function updateBlessingDisplay() { /* ... Same logic using formatTimeRemaining from utils.js ... */ if (uiElements.activeBlessingDisplay) { const blessing = getActiveBlessing(); if (blessing) { const blessingClass = `rarity-${blessing.type === 'Light' ? 'legendary' : 'epic'}`; uiElements.activeBlessingDisplay.innerHTML = `Blessing: <span class="${blessingClass}" title="Expires in approx. ${formatTimeRemaining(blessing.expires - Date.now())}">${blessing.type}</span>`; uiElements.activeBlessingDisplay.style.display = 'inline-block'; } else { uiElements.activeBlessingDisplay.style.display = 'none'; } } }
function updateMonarchDomainDisplay() { /* ... Same logic using formatTimeRemaining from utils.js ... */ if (uiElements.monarchDomainButton) { const monarchUnlocked = gameState.unlockedAbilities?.includes('monarchDomain'); uiElements.monarchDomainButton.style.display = monarchUnlocked ? 'inline-block' : 'none'; if (monarchUnlocked) { const now = Date.now(); const onCooldown = gameState.monarchDomainCooldown && now < gameState.monarchDomainCooldown; const usesLeft = gameState.monarchDomainUses || 0; const isActive = gameState.context?.monarchDomainActive; uiElements.monarchDomainButton.disabled = (usesLeft <= 0 || onCooldown || isActive); if (uiElements.monarchDomainStatus) { if (isActive) { uiElements.monarchDomainStatus.textContent = `Domain Active! (${formatTimeRemaining(gameState.context.monarchDomainEndTime - now)})`; } else if (onCooldown) { uiElements.monarchDomainStatus.textContent = `Recharging... (${formatTimeRemaining(gameState.monarchDomainCooldown - now)})`; } else if (usesLeft > 0) { uiElements.monarchDomainStatus.textContent = `Ready (${usesLeft}/${MONARCH_DOMAIN_MAX_USES})`; } else { uiElements.monarchDomainStatus.textContent = `Depleted`; } uiElements.monarchDomainStatus.style.display = 'inline-block'; } } else if (uiElements.monarchDomainStatus) { uiElements.monarchDomainStatus.style.display = 'none'; } } }
function updateSoulWindow() { /* ... Same logic ... */ }
function updateStatsDisplay() { /* ... Same logic using animateNumberTick ... */ }
function updateStatChart() { /* ... Same logic ... */ }
function updateQuestList() { // *** UPDATED to use formatRewardsForMessage from utils.js ***
    if (!uiElements.activeQuestList || !uiElements.dailyQuestList || !uiElements.synchronicityList) return;
    uiElements.activeQuestList.innerHTML = ''; uiElements.dailyQuestList.innerHTML = ''; uiElements.synchronicityList.innerHTML = '';
    let hasActive = false, hasDaily = false, hasSync = false;
    (gameState.activeQuests || []).forEach(quest => {
        const li = document.createElement('li'); li.dataset.questId = quest.id;
        const baseQuestData = getQuestData(quest.id); // Use getter from utils.js
        const displayRewards = baseQuestData?.rewards || quest.rewards || {}; // Prefer base data for display
        // Use global formatter, hide rarity text for list clarity
        const rewardString = formatRewardsForMessage(displayRewards, 0, false);
        li.innerHTML = `
            <strong>${quest.title} ${quest.type === 'daily' ? '(Daily)' : quest.type === 'synchronicity' ? '(Sync)' : ''}</strong>
            <p>${quest.description}</p>
            ${quest.goal > 1 ? `<p>Progress: ${quest.progress || 0} / ${quest.goal}</p>` : ''}
            <p>Reward: ${rewardString}</p>
            <div class="quest-actions">
                <button class="complete-quest-button" ${(quest.progress || 0) >= quest.goal ? '' : 'disabled'}>Complete</button>
                ${quest.type !== 'daily' && !quest.isAwakeningQuest ? '<button class="abandon-quest-button">Abandon</button>' : ''}
            </div>`;
        if(quest.type === 'daily') { uiElements.dailyQuestList.appendChild(li); hasDaily = true; }
        else if (quest.type === 'synchronicity') { uiElements.synchronicityList.appendChild(li); hasSync = true; }
        else { uiElements.activeQuestList.appendChild(li); hasActive = true; }
    });
    if (!hasActive) uiElements.activeQuestList.innerHTML = '<li>No active quests. Seek guidance.</li>';
    if (!hasDaily) uiElements.dailyQuestList.innerHTML = '<li>No daily rituals active.</li>';
    if (!hasSync) uiElements.synchronicityList.innerHTML = '<li>No synchronicity quests active.</li>';
}
function updateJournalDisplay() { /* ... Same ... */ }
function updateTimelineDisplay() { /* ... Same ... */ }
function getIconForEvent(iconType) { /* ... Same ... */ }
function updateCompanionList() { /* ... Same logic using formatTimeRemaining ... */ }
function updateShopDisplay() { if (uiElements.shopPanel?.style.display === 'block') { displayShopItems(); } }
function updateSettingsPanel() { /* ... Same logic using APP_VERSION ... */ }

// *** UPDATED Inventory Display (Uses Details button) ***
function updateInventoryDisplay() {
     if (!uiElements.inventoryDisplay) return; uiElements.inventoryDisplay.innerHTML = '';
     if (!gameState.inventory || gameState.inventory.length === 0) { uiElements.inventoryDisplay.innerHTML = '<p class="inventory-empty-message">Empty.</p>'; return; }
     const ul = document.createElement('ul'); ul.classList.add('inventory-list');
     gameState.inventory.forEach(itemEntry => { const itemData = getItemData(itemEntry.id); if (!itemData) return; const li = document.createElement('li'); li.dataset.itemId = itemEntry.id; li.tabIndex = 0; const itemRarity = itemData.rarity || RARITY.COMMON; const isEquippable = EQUIPMENT_SLOTS.includes(itemData.slot); const isUsable = ['Consumable', 'Potion', 'Boost', 'Utility', 'SkillBook'].includes(itemData.type); const sellValueText = itemData.sellValue > 0 ? ` | Sell: ${itemData.sellValue} Karma` : ''; li.innerHTML = `<span class="item-name rarity-${itemRarity.toLowerCase()}">${itemData.name}</span> <span class="item-quantity">(x${itemEntry.quantity})</span> <span class="item-desc" title="${itemData.description || ''}">${itemData.type || 'Item'}${sellValueText}</span> <div class="item-actions"><button class="item-details-button" title="View Details">Info</button> ${isEquippable ? `<button class="equip-item-button">Equip</button>` : ''} ${isUsable ? `<button class="use-item-button">Use</button>` : ''} ${itemData.sellValue > 0 ? `<button class="sell-item-button">Sell</button>` : ''}</div>`; ul.appendChild(li); });
     uiElements.inventoryDisplay.appendChild(ul);
}

// *** UPDATED Equipment Display (Uses Details button) ***
function updateEquipmentDisplay() {
    if (!uiElements.equipmentDisplay) return; uiElements.equipmentDisplay.innerHTML = ''; let hasEquipped = false;
    EQUIPMENT_SLOTS.forEach(slot => {
        const itemId = gameState.equipment[slot]; const itemData = itemId ? getItemData(itemId) : null;
        const slotElement = document.createElement('div'); slotElement.classList.add('equipment-slot'); slotElement.dataset.slot = slot;
        const displayName = slot.replace(/([A-Z])/g, ' $1').replace(/(\d)/g,' $1').replace(/^./, str => str.toUpperCase());
        if (itemData) { hasEquipped = true; const itemRarity = itemData.rarity || RARITY.COMMON; let statString = formatItemStatsForDisplay(itemData.effects); // Use shop helper? Or dedicated one?
             slotElement.innerHTML = `<span class="slot-name">${displayName}:</span> <span class="equipped-item rarity-${itemRarity.toLowerCase()}" title="${statString || itemData.description}">${itemData.name}</span> <div class="item-actions"><button class="item-details-button" data-item-id="${itemId}" title="View Details">Info</button><button class="unequip-button" data-slot="${slot}">Unequip</button></div>`;
        } else { slotElement.innerHTML = `<span class="slot-name">${displayName}:</span><span class="equipped-item empty">- Empty -</span>`; }
        uiElements.equipmentDisplay.appendChild(slotElement);
    });
     if (!hasEquipped) { uiElements.equipmentDisplay.innerHTML += '<p class="equipment-empty-message">No items equipped.</p>'; }
}

// *** UPDATED Skill Display (Uses Details button, cooldown visual) ***
function updateSkillDisplay() {
    if (!uiElements.skillsDisplay) return; uiElements.skillsDisplay.innerHTML = '';
    if (!gameState.unlockedSkills || gameState.unlockedSkills.length === 0) { uiElements.skillsDisplay.innerHTML = '<p class="skills-empty-message">No skills learned.</p>'; return; }
    const ul = document.createElement('ul'); ul.classList.add('skills-list');
    gameState.unlockedSkills.forEach(skillId => {
        const skillData = getSkillData(skillId); if (!skillData) return;
        const li = document.createElement('li'); li.dataset.skillId = skillId; li.tabIndex = 0;
        const skillRarity = skillData.rarity || RARITY.UNCOMMON; const now = Date.now(); const cooldownEnd = gameState.activeSkillCooldowns?.[skillId]; const onCooldown = cooldownEnd && now < cooldownEnd; const remainingCooldown = onCooldown ? formatTimeRemaining(cooldownEnd - now) : ''; const manaCostText = skillData.manaCost > 0 ? ` | Cost: ${skillData.manaCost} MP` : ''; const cooldownText = skillData.cooldown > 0 ? ` | CD: ${skillData.cooldown}s` : 'None';
        li.innerHTML = `
            <div class="skill-info">
                <span class="skill-name rarity-${skillRarity.toLowerCase()}">${skillData.name}</span>
                <span class="skill-type">(${skillData.passive ? 'Passive' : `Active${manaCostText}${cooldownText}`})</span>
                <p class="skill-desc">${skillData.description}</p>
                ${skillData.effects ? `<p class="skill-effects">Effect: ${formatSkillEffects(skillData.effects)}</p>` : ''}
            </div>
            <div class="skill-action">
                 <button class="item-details-button" title="View Details">Info</button>
                 ${!skillData.passive ? `<div class="cooldown-timer ${onCooldown ? 'active' : ''}" style="display:inline-block; position:relative; --cd-percent: ${onCooldown ? Math.max(0, 1 - (cooldownEnd - now) / (skillData.cooldown * 1000)) * 100 : 0}%;"><button class="activate-skill-button" ${onCooldown ? 'disabled' : ''}>${onCooldown ? `${remainingCooldown}` : 'Activate'}</button></div>` : ''}
            </div>`;
        ul.appendChild(li);
    }); uiElements.skillsDisplay.appendChild(ul);
    updateSkillCooldownTimers(); // Manage interval timer
}

// --- Skill Cooldown UI Timer ---
function updateSkillCooldownTimers() { /* ... Same logic as last provided ... */ }
// --- Modal Management ---
// ... (showModal, hideModal, setModalContent, showModalMessage, showSuccessModal, showErrorModal - Same logic using notifications.js) ...
// --- Other UI Helpers ---
function hideLoadingOverlay() { /* ... Same ... */ }
function askForPlayerName() { /* ... Same ... */ }
function activateKarmaMirror() { /* ... Same logic ... */ }
function showItemDetailsModal(itemId) { /* ... Same logic using setModalContent ... */ }
function showSkillDetailsModal(skillId) { /* ... Same logic using setModalContent ... */ }
function toggleCommandInput() { /* ... Same logic ... */ }

// --- Formatters previously in this file now assumed global from utils.js ---
// function formatTimeRemaining(ms) { ... }
// function formatRewardsForMessage(...) { ... }
// function formatItemStatsForDisplay(...) { ... } // Maybe keep specific formatters here or move all to utils? Let's assume utils for now.
// function formatSkillEffects(effects) { ... } // Let's assume utils.js

console.log("UI Module (Refactored) Loaded OK.");