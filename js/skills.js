// js/skills.js
// Version: v1.1.1
// Defines all player skills

// Assumes RARITY is defined globally via constants.js

console.log("Loading Skill Database...");

const skillsDatabase = {
    // --- Active Skills ---
    'skill_mana_infusion': {
        name: 'Mana Infusion', description: 'Channel ambient energy to instantly restore 50 MP.',
        passive: false, active: true, cooldown: 120, manaCost: 0, // Cooldown in seconds
        rarity: RARITY.UNCOMMON, effects: { mpRestore: 50 }, sfx: 'item-use'
    },
    'skill_aura_flare': {
        name: 'Aura Flare', description: 'Briefly intensify your aura, increasing all effective stats by 10% for 15 seconds.',
        passive: false, active: true, cooldown: 300, manaCost: 25,
        rarity: RARITY.RARE, effects: { tempBoost: { type: 'stat_percent_boost', allStatsPercent: 0.1, duration: 15, id:'aura_flare_boost', targetStat: 'all' } },
        sfx: 'divine-sync'
    },
    'skill_shadow_veil': {
        name: 'Shadow Veil', description: 'Temporarily conceal your presence, reducing negative event chance.',
        passive: false, active: true, cooldown: 600, manaCost: 40,
        rarity: RARITY.EPIC, effects: { tempEffect: { name: 'concealment', type: 'utility', duration: 1800, id:'shadow_veil_effect' } },
        sfx: 'item-use' // Placeholder sound
    },
     'skill_seer_glimpse': { // Example Active Companion Skill
         name: 'Seer\'s Glimpse', description: 'Command your Seer companion to grant a brief insight or hint. (Effect not fully implemented)',
         passive: false, active: true, cooldown: 600, manaCost: 10,
         rarity: RARITY.RARE, requiresCompanionType: 'Seer',
         effects: { action: 'revealHint' },
         sfx: 'prompt'
    },

    // --- Passive Skills ---
    'skill_shadow_step': {
        name: 'Shadow Step', description: 'Increases base Evasion by 5% (passive effect placeholder).',
        passive: true, rarity: RARITY.EPIC, effects: { evasionBonusPercent: 0.05 }, // For potential combat system
        sfx: null
    },
    'skill_gate_breaker': {
        name: 'Gate Breaker', description: 'Increases currency rewards from clearing Gates by 10%.',
        passive: true, rarity: RARITY.RARE, effects: { gateCurrencyMod: 0.1 }, // Applied in effects.js
        sfx: null
     },
     'skill_quick_learner': {
         name: 'Quick Learner', description: 'Increases all EXP Gain by 5%.',
         passive: true, rarity: RARITY.RARE, effects: { expGainMod: 0.05 }, // Applied in effects.js
         sfx: null
     },
     'skill_resonant_mind': {
         name: 'Resonant Mind', description: 'Increases maximum MP by 15%.',
         passive: true, rarity: RARITY.UNCOMMON, effects: { mpMaxPercent: 0.15 }, // Applied in effects.js/state.js
         sfx: null
     },
      'skill_iron_will': {
         name: 'Iron Will', description: 'Increases base Willpower by 10%.',
         passive: true, rarity: RARITY.RARE, effects: { willpowerPercent: 0.1 }, // Applied in effects.js
         sfx: null
     }
};

// Function to get skill data by ID
function getSkillData(skillId) {
    // Assumes skillsDatabase is loaded globally
    if (typeof skillsDatabase !== 'undefined') {
        return skillsDatabase[skillId] || null;
    }
    console.error("skillsDatabase not accessible in getSkillData");
    return null;
}

console.log("Skill Database Loaded OK.");