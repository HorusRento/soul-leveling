// js/items.js
// Version: v1.1.1
// Defines all game items (weapons, armor, consumables, etc.)

// Assumes RARITY, EQUIPMENT_SLOTS are defined globally (e.g., from constants.js)

console.log("Loading Item Database...");

const itemDatabase = {
    // --- Consumables ---
    'boost001': { name: 'Moment of Clarity', type: 'Boost', rarity: RARITY.UNCOMMON, description: 'Temporarily sharpens Intuition (+10 for 1 hour).', stackable: true, sellValue: 1, cost: { fragments: 5 }, effects: { tempStat: 'intuition', amount: 10, duration: 3600 } },
    'boost002': { name: 'Wellspring Dew', type: 'Potion', rarity: RARITY.COMMON, description: 'Instantly restores 50 MP.', stackable: true, sellValue: 2, cost: { karma: 10 }, effects: { target: 'mp', amount: 50 } },
    'boost003': { name: 'Shadow Ward', type: 'Utility', rarity: RARITY.RARE, description: 'Temporarily reduces chance of negative gate trigger for 2 hours.', stackable: true, sellValue: 5, cost: { tokens: 2 }, effects: { name: 'gateWard', duration: 7200 } },
    'item_instant_dungeon_01': { name: 'Instant Dungeon Key', type: 'Consumable', rarity: RARITY.LEGENDARY, description: 'Forces a Gate to manifest upon use.', stackable: false, sellValue: 100, cost: { fragments: 100, tokens: 10}, effects: { action: 'triggerGate' } },
    'item_minor_wisdom_orb': { name: 'Minor Wisdom Orb', type: 'Consumable', rarity: RARITY.RARE, description: 'Grants 100 EXP when used.', stackable: true, effects: { target: 'exp', amount: 100 }, sellValue: 20 },
    'item_hp_potion_small': { name: 'Lesser Healing Potion', type: 'Potion', rarity: RARITY.COMMON, description: 'Instantly restores 75 HP.', stackable: true, sellValue: 3, cost: { karma: 15 }, effects: { target: 'hp', amount: 75 } },

    // --- Weapons (mainHand/offHand) ---
    'wpn_seeker_dagger': { name: 'Seeker\'s Dagger', type: 'Weapon', slot: EQUIPMENT_SLOTS[0], rarity: RARITY.COMMON, description: 'A simple blade, sharpens intuition.', effects: { intuition: 2 }, sellValue: 5, cost: { karma: 25 } },
    'wpn_shadow_knife': { name: 'Shadow Knife', type: 'Weapon', slot: EQUIPMENT_SLOTS[0], rarity: RARITY.RARE, description: 'Drawn from the rifts, boosts resonance.', effects: { resonance: 5, energy: 3 }, sellValue: 30, cost: { tokens: 15 } },
    'wpn_aether_blade': { name: 'Aether Blade', type: 'Weapon', slot: EQUIPMENT_SLOTS[0], rarity: RARITY.EPIC, description: 'Humming blade channeling raw energy.', effects: { energy: 10, awakening: 5 }, sellValue: 75 }, // Drop/reward only
    'orb_whispering_echo': { name: 'Whispering Echo Orb', type: 'Catalyst', slot: EQUIPMENT_SLOTS[1], rarity: RARITY.RARE, description: 'Amplifies resonance and reveals faint insights.', effects: { resonance: 7, intuitionPercent: 0.05 }, sellValue: 40 }, // Drop/reward only

    // --- Armor ---
    'arm_adept_robes': { name: 'Adept Robes', type: 'Armor', slot: EQUIPMENT_SLOTS[2], rarity: RARITY.UNCOMMON, description: 'Flowing robes enhancing energy flow.', effects: { energy: 4, mpMaxPercent: 0.1 }, sellValue: 10, cost: { fragments: 30 } },
    'arm_guardian_plate': { name: 'Guardian Plate', type: 'Armor', slot: EQUIPMENT_SLOTS[2], rarity: RARITY.RARE, description: 'Sturdy plate fostering willpower.', effects: { willpower: 6, hpMaxPercent: 0.15 }, sellValue: 50 }, // Drop/reward only

    // --- Accessories ---
    'acc_ring_will': { name: 'Ring of Will', type: 'Accessory', slot: EQUIPMENT_SLOTS[3], rarity: RARITY.RARE, description: 'A focus that strengthens willpower.', effects: { willpower: 5 }, sellValue: 25, cost: { karma: 75 } },
    'acc_amulet_insight': { name: 'Amulet of Insight', type: 'Accessory', slot: EQUIPMENT_SLOTS[4], rarity: RARITY.UNCOMMON, description: 'Sharpens the inner eye.', effects: { intuition: 3 }, sellValue: 15 }, // Drop/reward only
    'acc_pendant_resonance': { name: 'Pendant of Resonance', type: 'Accessory', slot: EQUIPMENT_SLOTS[3], rarity: RARITY.EPIC, description: 'Deeply attunes the wearer to surrounding energies.', effects: { resonance: 8, energyPercent: 0.05 }, sellValue: 60 }, // Drop/reward only

    // --- Skill Books & Unlocks ---
    'skillbook_mana_infusion': { name: 'Tome: Mana Infusion', type: 'SkillBook', rarity: RARITY.UNCOMMON, description: 'Learn the skill: Mana Infusion.', cost: { fragments: 40 }, effect: { unlocksSkill: 'skill_mana_infusion' }, sellValue: 10 },
    'skillbook_gate_breaker': { name: 'Codex: Gate Breaker', type: 'SkillBook', rarity: RARITY.RARE, description: 'Learn the passive skill: Gate Breaker.', cost: { tokens: 20, karma: 50 }, effect: { unlocksSkill: 'skill_gate_breaker' }, sellValue: 25 },
    'unlock001': { name: 'Meditation Track: Astral Tides', type: 'Audio', rarity: RARITY.UNCOMMON, description: 'Unlocks a new background track.', cost: { fragments: 20 }, effect: { unlocks: 'bgm-astral' }, sellValue: 0 },
    'unlock002': { name: 'Aura Skin: Celestial Radiance', type: 'Theme', rarity: RARITY.RARE, description: 'Change interface theme to white-gold.', cost: { karma: 50 }, effect: { unlocks: 'celestial' }, sellValue: 0 },
    'unlock003': { name: 'Aura Skin: Shadow Sovereign', type: 'Theme', rarity: RARITY.RARE, description: 'Change interface theme to black-violet.', cost: { tokens: 15 }, effect: { unlocks: 'shadow' }, sellValue: 0 },
    'unlock004': { name: 'Aura Skin: Monarch of Light', type: 'Theme', rarity: RARITY.EPIC, description: 'Change interface theme to blue-silver.', cost: { karma: 75, fragments: 25 }, effect: { unlocks: 'monarch' }, sellValue: 0 },
    'quest001': { name: 'Quest: Ancestral Echoes', type: 'QuestUnlock', rarity: RARITY.EPIC, description: 'Unlock a quest about ancestral patterns.', cost: { karma: 100 }, effect: { unlocksQuest: 'a001' }, sellValue: 0 },
};

// Function to get item data by ID (Ensures consistency)
function getItemData(itemId) {
    // Assumes itemDatabase is loaded globally
    if (typeof itemDatabase !== 'undefined') {
         return itemDatabase[itemId] || null;
    }
    console.error("itemDatabase not accessible in getItemData");
    return null;
}

console.log("Item Database Loaded OK.");