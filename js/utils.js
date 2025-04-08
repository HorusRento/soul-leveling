// js/utils.js
// Version: v1.1.1 - Utility Helper Functions

console.log("Loading Utilities Module...");

// --- Type Checking ---
function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

// --- Object Merging ---
// Merges source object into target object recursively (for state loading)
function deepMerge(target, source) {
  let output = Object.assign({}, target); // Start with target's properties
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      const targetValue = target[key];
      const sourceValue = source[key];
      if (isObject(sourceValue) && !Array.isArray(sourceValue)) {
        // If target doesn't have the key, or it's not an object, just assign source's object
        if (!(key in target) || !isObject(targetValue) || Array.isArray(targetValue)) {
          Object.assign(output, { [key]: sourceValue });
        } else {
          // Both are objects, merge recursively
          output[key] = deepMerge(targetValue, sourceValue);
        }
      } else {
        // Assign primitive values, arrays, or null directly from source
        Object.assign(output, { [key]: sourceValue });
      }
    });
  }
  return output;
}

// --- Formatting ---

// Formats milliseconds into a readable time string (h m s)
function formatTimeRemaining(ms) {
    if (ms <= 0) return "Ready";
    let seconds = Math.floor(ms / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    seconds %= 60; minutes %= 60;
    let parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    // Show seconds only if less than 10 minutes remaining for more precision
    if (hours === 0 && minutes < 10 && seconds > 0) parts.push(`${seconds}s`);
    else if (hours === 0 && minutes === 0 && seconds > 0) parts.push(`${seconds}s`); // Always show seconds if only seconds left
    else if (hours === 0 && minutes === 0 && seconds <= 0) return "<1s"; // Handle very short remaining time

    return parts.join(' ') || '<1m'; // Fallback if only minutes/hours > 0 shown
}

// Formats reward objects into a display string (moved from quests.js/ui.js)
// Includes items, skills, handles rarity display option
function formatRewardItemForDisplay(itemRef, showRarity) {
    const itemData = getItemData(itemRef.id); // Assumes getItemData accessible
    const name = itemData?.name || itemRef.id;
    const rarity = itemRef.rarity || itemData?.rarity || RARITY.COMMON;
    let text = name;
    if (showRarity) {
        text += ` <span class="rarity-${rarity.toLowerCase()}">(${rarity})</span>`;
    }
    return text;
}
function formatSkillForDisplay(skillRef, showRarity) {
    const skillData = getSkillData(skillRef.id); // Assumes getSkillData accessible
    const name = skillData?.name || skillRef.id;
    const rarity = skillRef.rarity || skillData?.rarity || RARITY.UNCOMMON;
    let text = name;
    if (showRarity) {
        text += ` <span class="rarity-${rarity.toLowerCase()}">(${rarity})</span>`;
    }
    return text;
}

function formatRewardsForMessage(rewards = {}, bonusExp = 0, showRarity = true) {
    let parts = [];
    // EXP
    if (rewards.exp?.amount > 0) { parts.push(`+${rewards.exp.amount} Base EXP${showRarity ? ` (${rewards.exp.rarity || RARITY.COMMON})` : ''}`); }
    if (bonusExp > 0) { parts.push(`+${bonusExp} Bonus EXP (Child)`); }
    // Stats
    if (rewards.stats?.length > 0) { rewards.stats.forEach(sr => { if (sr.amount > 0) { parts.push(`+${sr.amount} ${sr.name.charAt(0).toUpperCase() + sr.name.slice(1)}${showRarity ? ` (${sr.rarity || RARITY.COMMON})` : ''}`); } }); }
    // Currency
    if (rewards.currency?.length > 0) { rewards.currency.forEach(cr => { if (cr.amount > 0) { parts.push(`+${cr.amount} ${cr.type.charAt(0).toUpperCase() + cr.type.slice(1)}${showRarity ? ` (${cr.rarity || RARITY.COMMON})` : ''}`); } }); }
    // Items
    if (rewards.items?.length > 0) { const items = rewards.items.map(i => formatRewardItemForDisplay(i, showRarity)); parts.push(`Item${items.length > 1 ? 's' : ''}: ${items.join(', ')}`); }
    // Skills
    if (rewards.skills?.length > 0) { const skills = rewards.skills.map(s => formatSkillForDisplay(s, showRarity)); parts.push(`Skill${skills.length > 1 ? 's' : ''} Unlocked: ${skills.join(', ')}`); }

    return parts.length > 0 ? parts.join(', ') : "None";
}


// Helper to strip HTML tags for console logging or plain text display
function stripHtml(html){
   // Create a temporary element to parse the HTML
   let tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   // Use textContent or innerText to get the text, handling potential nulls
   return (tmp.textContent || tmp.innerText || "").trim();
}


// --- Data Access Helpers (Example - getters for global databases) ---
// These ensure consistent access if databases are loaded differently later
function getItemData(itemId) {
    // Assumes itemDatabase is loaded globally (e.g., from items.js or main.js)
    if (typeof itemDatabase !== 'undefined') { return itemDatabase[itemId] || null; }
    console.error("itemDatabase not accessible in getItemData"); return null;
}

function getSkillData(skillId) {
    // Assumes skillsDatabase is loaded globally
    if (typeof skillsDatabase !== 'undefined') { return skillsDatabase[skillId] || null; }
    console.error("skillsDatabase not accessible in getSkillData"); return null;
}

function getQuestData(questId) {
    // Assumes questDatabase is loaded globally
    if (typeof questDatabase !== 'undefined') { return questDatabase.find(q => q.id === questId) || null; }
    console.error("questDatabase not accessible in getQuestData"); return null;
}

console.log("Utilities Module Loaded OK.");