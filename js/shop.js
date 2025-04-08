// js/shop.js
// Version: v1.1.1 - Handles Shop UI and Purchase/Sell Logic (Refactored)

// Assumes constants (RARITY, EQUIPMENT_SLOTS), gameState, uiElements defined globally
// Assumes global databases: itemDatabase, skillsDatabase
// Assumes global functions: getItemData, getSkillData, isActiveOrCompleted, spendCurrency,
// addInventoryItem, removeInventoryItem, addCurrency, updateThemeSelector, addQuest,
// updateSkillDisplay, updateInventoryDisplay, saveState, showErrorModal, showSuccessModal,
// notifyInfo, notifySuccess, playSfx, formatItemStatsForDisplay (this file), displayShopItems (this file)

console.log("Loading Shop Module (Refactored)...");

// --- Shop Display Logic ---
function displayShopItems() {
    const container = uiElements.shopItemsContainer; if (!container) return;
    container.innerHTML = '<h3>Available Items</h3>';

    // Use itemDatabase directly, filter for items with a cost
    const purchasableItems = Object.values(itemDatabase).filter(item => item.cost);
    if (purchasableItems.length === 0) { container.innerHTML += '<p>No items currently available for purchase.</p>'; return; }

    // Group items
    const groupedItems = purchasableItems.reduce((acc, item) => {
         const type = item.type || 'Misc'; if (!acc[type]) acc[type] = []; acc[type].push(item); return acc;
    }, {});
    const categoryOrder = ['Weapon', 'Armor', 'Accessory', 'Potion', 'Consumable', 'Boost', 'Utility', 'SkillBook', 'Theme', 'Audio', 'QuestUnlock', 'Misc'];

    // Render items by category
    categoryOrder.forEach(type => {
        if (groupedItems[type]) {
             const typeHeader = document.createElement('h4'); typeHeader.textContent = type.replace(/([A-Z])/g, ' $1').trim(); typeHeader.classList.add('shop-category-header'); container.appendChild(typeHeader);
             groupedItems[type].forEach(item => {
                let isOwnedOrUnlocked = false; // Check ownership status
                if (item.type === 'Theme' && gameState.settings.unlockedThemes?.includes(item.effect?.unlocks)) isOwnedOrUnlocked = true;
                else if (item.type === 'QuestUnlock' && isActiveOrCompleted(item.effect?.unlocksQuest)) isOwnedOrUnlocked = true; // Assumes isActiveOrCompleted exists
                else if (item.type === 'SkillBook' && gameState.unlockedSkills?.includes(item.effect?.unlocksSkill)) isOwnedOrUnlocked = true;

                const itemDiv = document.createElement('div'); itemDiv.classList.add('shop-item'); if (isOwnedOrUnlocked) itemDiv.classList.add('owned');
                itemDiv.dataset.itemId = item.id;
                let costString = Object.entries(item.cost || {}).map(([t, a]) => `${a} ${t.charAt(0).toUpperCase() + t.slice(1)}`).join(', ');
                const itemRarity = item.rarity || RARITY.COMMON; const rarityClass = `rarity-${itemRarity.toLowerCase()}`;
                let statString = ''; if (item.effects && ['Weapon', 'Armor', 'Accessory'].includes(item.type)) { statString = formatItemStatsForDisplay(item.effects); } // Use local helper

                itemDiv.innerHTML = `
                    <strong class="${rarityClass}">${item.name} <span class="item-rarity">(${itemRarity})</span></strong>
                    <p>${item.description || ''}</p>
                    ${statString ? `<p class="item-stats">Stats: ${statString}</p>` : ''}
                    <p>Cost: ${costString}</p>
                    <div class="item-actions"> {/* Wrapper for button */}
                        <button class="buy-item-button" ${isOwnedOrUnlocked ? 'disabled' : ''}>${isOwnedOrUnlocked ? 'Owned' : 'Purchase'}</button>
                    </div>`;
                container.appendChild(itemDiv);
            });
        }
    });
}

// Helper to format item stats for display within shop
function formatItemStatsForDisplay(effects) {
    if (!effects) return '';
    return Object.entries(effects)
        .map(([stat, value]) => {
             if (typeof value === 'number' && !stat.includes('Percent') && !stat.includes('Mod')) { // Only simple flat bonuses for now
                  const statName = stat.replace(/^./, c => c.toUpperCase());
                  return `${statName}: +${value}`;
             } else if (stat.includes('Percent')) {
                  const statName = stat.replace('Percent',' %').replace(/^./, c => c.toUpperCase());
                  return `${statName}: +${value*100}%`;
             }
             return null; // Ignore complex effects like duration/target here
        }).filter(s => s !== null).join(', ');
}

// --- Shop Action Logic ---

function purchaseItem(itemId) {
    const itemData = getItemData(itemId); // Use global getter
    if (!itemData || !itemData.cost) { showErrorModal("Item cannot be purchased or data not found."); return; }

    // Check ownership
    let isOwnedOrUnlocked = false; if (itemData.type === 'Theme' && gameState.settings.unlockedThemes?.includes(itemData.effect?.unlocks)) isOwnedOrUnlocked = true; else if (itemData.type === 'QuestUnlock' && isActiveOrCompleted(itemData.effect?.unlocksQuest)) isOwnedOrUnlocked = true; else if (itemData.type === 'SkillBook' && gameState.unlockedSkills?.includes(itemData.effect?.unlocksSkill)) isOwnedOrUnlocked = true; if (isOwnedOrUnlocked) { showErrorModal("You already possess this item or its content."); return; }
    // Check cost
    let canAfford = true; for (const type in itemData.cost) { if ((gameState.currency[type] || 0) < itemData.cost[type]) { canAfford = false; break; } } if (!canAfford) { showErrorModal("Insufficient currency."); return; }
    // Deduct cost
    let costDeducted = true; for (const type in itemData.cost) { if (!spendCurrency(type, itemData.cost[type])) { costDeducted = false; break; } } if (!costDeducted) return;

    // Apply effect OR add to inventory
    applyShopItemPurchaseEffect(itemData); // Handles unlocks
    if (['Weapon', 'Armor', 'Accessory', 'Consumable', 'Potion', 'Utility', 'Boost'].includes(itemData.type)) { addInventoryItem({...itemData}); } // Add item copy

    displayShopItems(); // Refresh shop display
    showSuccessModal(`Purchased: ${itemData.name}`, "Purchase Successful");
}

// Apply effects specific to purchasing (unlocks)
function applyShopItemPurchaseEffect(itemData) {
    console.log(`Applying purchase effect for item: ${itemData.name}`);
    let stateChanged = false;
    switch (itemData.type) {
        case 'Theme':
            if (!gameState.settings.unlockedThemes) gameState.settings.unlockedThemes = []; if (!gameState.settings.unlockedThemes.includes(itemData.effect.unlocks)) { gameState.settings.unlockedThemes.push(itemData.effect.unlocks); updateThemeSelector(); console.log(`Theme unlocked: ${itemData.effect.unlocks}`); stateChanged = true; } break;
        case 'QuestUnlock':
            const questToUnlock = getQuestData(itemData.effect.unlocksQuest); if (questToUnlock && !isActiveOrCompleted(questToUnlock.id)) { addQuest({ ...questToUnlock, progress: 0 }); console.log(`Quest unlocked: ${questToUnlock.title}`); stateChanged = true; } else if (isActiveOrCompleted(questToUnlock?.id || itemData.effect.unlocksQuest)){ console.log(`Quest already unlocked/completed.`); } else { console.error(`Quest ID not found: ${itemData.effect.unlocksQuest}`); } break;
        case 'SkillBook':
             if (!gameState.unlockedSkills) gameState.unlockedSkills = []; if (!gameState.unlockedSkills.includes(itemData.effect.unlocksSkill)) { gameState.unlockedSkills.push(itemData.effect.unlocksSkill); console.log(`Skill learned: ${itemData.effect.unlocksSkill}`); notifySuccess(`Skill Learned: ${getSkillData(itemData.effect.unlocksSkill)?.name || itemData.effect.unlocksSkill}`); updateSkillDisplay(); stateChanged = true; } break;
        case 'Audio': console.log(`Audio track unlocked: ${itemData.effect.unlocks}`); stateChanged = true; break;
        default: break;
    }
    if (stateChanged) { saveState(); }
}

// Toggle Shop Visibility
function toggleShop() { if (!uiElements.shopPanel) return; if (uiElements.shopPanel.style.display === 'none') { uiElements.shopPanel.style.display = 'block'; updateShopDisplay(); playSfx('click'); } else { uiElements.shopPanel.style.display = 'none'; playSfx('click'); } }

// Sell Item Function
function sellInventoryItem(itemId, quantity = 1) {
     if (!gameState.inventory) { showErrorModal("Inventory is empty."); return; }
     const itemIndex = gameState.inventory.findIndex(i => i.id === itemId); if (itemIndex === -1) { showErrorModal("Item not found in inventory."); return; }
     const itemToSellInv = gameState.inventory[itemIndex]; const sellQuantity = Math.min(quantity, itemToSellInv.quantity);
     const itemDefinition = getItemData(itemId); const sellValuePerItem = itemDefinition?.sellValue;
     if (sellValuePerItem === undefined || sellValuePerItem <= 0) { showErrorModal(`Item '${itemDefinition?.name || itemId}' cannot be sold.`); return; }
     // Check if equipped
     let isEquipped = false; for (const slot in gameState.equipment) { if (gameState.equipment[slot] === itemId) { isEquipped = true; break; } } if (isEquipped) { showErrorModal(`Cannot sell '${itemDefinition?.name || itemId}' while equipped.`); return; }
     const totalGain = sellValuePerItem * sellQuantity; const currencyType = 'karma'; // Default sell currency
     if (!removeInventoryItem(itemId, sellQuantity)) { showErrorModal("Failed to remove item for selling."); return; }
     addCurrency(currencyType, totalGain);
     showSuccessModal(`Sold ${sellQuantity}x ${itemDefinition?.name || itemId} for ${totalGain} ${currencyType}.`);
}

console.log("Shop Module (Refactored) Loaded OK.");