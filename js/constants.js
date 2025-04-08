// js/constants.js
// Version: v1.1.1 - Centralized Constants

console.log("Loading Constants..."); // Log to check loading order

const APP_VERSION = '1.1.1'; // Defined once here
const MAX_LEVEL = 100;
const STATS = ['awakening', 'intuition', 'energy', 'willpower', 'resonance']; // Core stats
const STAT_POINTS_PER_LEVEL = 2; // Grant 2 points per level up
const CLASSES = { // Rank definitions & unlocks
    0: { rank: 'C', name: 'Seeker', nextLevel: 20 },
    20: { rank: 'B', name: 'Adept', nextLevel: 40, unlocks: ['statBoostMinor'] }, // Placeholder ability keys
    40: { rank: 'A', name: 'Master', nextLevel: 60, unlocks: ['fasterEXP', 'hpMpBoost'] },
    60: { rank: 'S', name: 'Grandmaster', nextLevel: 80, unlocks: ['deeperQuests', 'karmaBoost', 'shadowSoldierUI'] },
    80: { rank: 'SS', name: 'Awakened', nextLevel: 100, unlocks: ['divineSyncBoost', 'auraDetection'] },
    100: { rank: 'M', name: 'Monarch', nextLevel: Infinity, unlocks: ['shadowEmbrace', 'multiverseGlimpse', 'monarchDomain'] }
};
const SOUL_CLASSES = ['Soul Traveler', 'Shadow Healer', 'Dream Guide', 'Light Bearer', 'Void Walker', 'Star Weaver']; // Example Soul Classes
const TITLES = { // Title objects with effects
    lightwalker: { name: "Lightwalker", description: "Boosts Resonance gain (+10%).", effects: { resonanceGainMod: 0.1 } },
    gateborn: { name: "Gateborn", description: "Increases currency rewards from Gates (+15%).", effects: { gateCurrencyMod: 0.15 } },
    soulArchitect: { name: "Soul Architect", description: "Grants 1 extra Stat Point every 5 levels.", effects: { bonusStatPointsLevelMod: 5 } },
    woundedHealer: { name: "Wounded Healer", description: "Heals 5% Max HP after clearing Shadow-type Gates.", effects: { shadowGateHealPercent: 0.05 } },
    breakerOfLoops: { name: "Breaker of Loops", description: "Reduces negative effect durations by 10%.", effects: { debuffDurationMod: 0.9 } },
};
const AWAKENING_QUEST_ID = 'q_awakening_01'; // ID for the special Awakening quest
const MONARCH_DOMAIN_COOLDOWN_MS = 1000 * 60 * 60 * 24; // 24 hours cooldown
const MONARCH_DOMAIN_MAX_USES = 1;
const EQUIPMENT_SLOTS = ['mainHand', 'offHand', 'armor', 'accessory1', 'accessory2'];
const RARITY = { COMMON: 'Common', UNCOMMON: 'Uncommon', RARE: 'Rare', EPIC: 'Epic', LEGENDARY: 'Legendary' };
const ALIGNMENT_CHANGE = { LIGHT_SMALL: 5, LIGHT_MEDIUM: 10, DARK_SMALL: -5, DARK_MEDIUM: -10 };
const COMPANION_MAX_LEVEL = 10;
const SAVE_KEY = 'soulLevelingSystemState_v1_1_1'; // Use specific key for this version

// UI Related Constants
const MAX_VISIBLE_NOTIFICATIONS = 3;
const NOTIFICATION_DURATION = 4000; // ms
const TYPING_SPEED = 35; // ms per character

// Game Balance Constants
const RED_GATE_CHANCE = 0.15; // 15%
const SHADOW_INTEGRATION_GOAL = 3; // Shadow gates needed
const SUMMON_COMPANION_COST = 10; // Fragments
const COMPANION_LEVEL_UP_BASE_COST = 5; // Fragments
const COMPANION_LEVEL_UP_SCALING_COST = 2; // Fragments per level

console.log("Constants Loaded OK.");