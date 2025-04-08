// js/ui_interactions.js
// Version: v1.1.1 - Handles detailed UI interactions (Refactored)

// Assumes gameState, uiElements defined globally
// Assumes Necessary functions defined globally: equipItem, unequipItem, useInventoryItem,
// activateSkill, sellInventoryItem, showItemDetailsModal, showSkillDetailsModal,
// showErrorModal, levelUpCompanionWithFragments, increaseStat

console.log("Loading UI Interactions Module...");

// --- Setup Main Event Listeners (Called from main.js) ---
function setupInteractionListeners() {
    // Use event delegation on parent elements
    uiElements.equipmentDisplay?.addEventListener('click', handleEquipmentInteraction);
    uiElements.inventoryDisplay?.addEventListener('click', handleInventoryInteraction);
    uiElements.skillsDisplay?.addEventListener('click', handleSkillInteraction);
    uiElements.companionList?.addEventListener('click', handleCompanionInteraction);
    uiElements.statsAllocationSection?.addEventListener('click', handleStatAllocationInteraction);
    console.log("UI Interaction listeners set up.");
}

// --- Interaction Handlers ---

function handleEquipmentInteraction(event) {
    const target = event.target;
    const slotDiv = target.closest('.equipment-slot[data-slot]');
    if (!slotDiv) return;
    const slot = slotDiv.dataset.slot;
    const itemId = gameState.equipment[slot];

    if (target.classList.contains('unequip-button')) {
        console.log(`Unequip action on slot: ${slot}`);
        unequipItem(slot); // Call state function
    } else if (target.classList.contains('item-details-button') && itemId) {
        console.log(`Details action on equipped item: ${itemId}`);
        showItemDetailsModal(itemId); // Call UI function
    } else if (target.classList.contains('equipped-item') && itemId) {
         // Clicking the item name itself shows details
         console.log(`Details action (click name) on equipped item: ${itemId}`);
         showItemDetailsModal(itemId);
    }
}

function handleInventoryInteraction(event) {
    const target = event.target;
    const itemLi = target.closest('li[data-item-id]');
    if (!itemLi) return;
    const itemId = itemLi.dataset.itemId;

    if (target.classList.contains('equip-item-button')) {
        console.log(`Equip action for item: ${itemId}`);
        equipItem(itemId); // Call state function
    } else if (target.classList.contains('use-item-button')) {
        console.log(`Use action for item: ${itemId}`);
        useInventoryItem(itemId); // Call state function
    } else if (target.classList.contains('sell-item-button')) {
         console.log(`Sell action for item: ${itemId}`);
         // Add confirmation for valuable items?
         const itemData = getItemData(itemId);
         if (itemData && (itemData.rarity === RARITY.EPIC || itemData.rarity === RARITY.LEGENDARY)) {
              showModal('prompt'); // Use modal for confirmation
              setModalContent('Confirm Sell', `Are you sure you want to sell the ${itemData.rarity} item "${itemData.name}" for ${itemData.sellValue || 0} Karma?`,
              `<button id="confirm-sell-yes" data-item-id="${itemId}" style="background-color: var(--error-color);">Yes, Sell</button> <button class="modal-close">Cancel</button>`);
              // Add specific listener for this confirmation button maybe in main.js delegation or here temporarily
              document.getElementById('confirm-sell-yes')?.addEventListener('click', (e) => {
                   sellInventoryItem(e.target.dataset.itemId); // Call sell function
                   hideModal();
              }, { once: true });
         } else {
             sellInventoryItem(itemId); // Sell directly if not Epic/Legendary
         }
    } else if (target.classList.contains('item-details-button') || target.classList.contains('item-name')) {
         console.log(`Details action for inventory item: ${itemId}`);
         showItemDetailsModal(itemId); // Call UI function
    }
}

function handleSkillInteraction(event) {
    const target = event.target;
    const skillLi = target.closest('li[data-skill-id]');
    if (!skillLi) return;
    const skillId = skillLi.dataset.skillId;

    if (target.classList.contains('activate-skill-button')) {
        console.log(`Activate action for skill: ${skillId}`);
        activateSkill(skillId); // Call state function
    } else if (target.classList.contains('item-details-button') || target.classList.contains('skill-name') || target.classList.contains('skill-info') ) {
         // Clicking name, info button or info area shows details
         console.log(`Details action for skill: ${skillId}`);
         showSkillDetailsModal(skillId); // Call UI function
    }
}

function handleCompanionInteraction(event) {
    // Only handle level up here, rename/dismiss handled in main.js for now
    const target = event.target;
    const companionLi = target.closest('li[data-companion-id]');
    if (!companionLi) return;
    const companionId = companionLi.dataset.companionId;

    if (target.classList.contains('level-up-companion-button')) {
        const companion = gameState.companions.find(c => c.id == companionId);
        const currentLevel = companion?.level || 0;
        const cost = COMPANION_LEVEL_UP_BASE_COST + currentLevel * COMPANION_LEVEL_UP_SCALING_COST;
        // Confirmation modal for spending fragments
        showModal('prompt');
        setModalContent('Confirm Companion Training', `Spend ${cost} Fragments to train ${companion?.name || 'Companion'} to the next level?`,
         `<button id="confirm-train-yes" data-companion-id="${companionId}">Train</button> <button class="modal-close">Cancel</button>`);
         // Add listener
         document.getElementById('confirm-train-yes')?.addEventListener('click', (e) => {
              levelUpCompanionWithFragments(e.target.dataset.companionId);
              hideModal();
         }, { once: true });
    }
}

function handleStatAllocationInteraction(event) {
     const target = event.target;
     if (target.classList.contains('allocate-stat-button')) {
        const stat = target.dataset.stat;
        if (stat) {
             console.log(`Allocate action for stat: ${stat}`);
             increaseStat(stat, 1); // Call state function
        }
    }
}

console.log("UI Interactions Module Loaded OK.");