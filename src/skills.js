const fs = require('fs');
const path = require('path');

const SKILLS_DIR = path.join(__dirname, '..', 'skills');
const skills = [];

/**
 * Load all skill plugins from the /skills directory
 */
function loadSkills() {
  skills.length = 0; // Clear existing

  if (!fs.existsSync(SKILLS_DIR)) {
    console.log('[skills] No skills directory found');
    return;
  }

  const files = fs.readdirSync(SKILLS_DIR).filter(f => f.endsWith('.js'));

  for (const file of files) {
    try {
      const skillPath = path.join(SKILLS_DIR, file);
      // Clear require cache so skills can be reloaded
      delete require.cache[require.resolve(skillPath)];
      const skill = require(skillPath);

      if (skill.name && typeof skill.trigger === 'function' && typeof skill.run === 'function') {
        skills.push(skill);
        console.log(`[skills] Loaded: ${skill.name}`);
      } else {
        console.log(`[skills] Skipped ${file} — missing name, trigger, or run`);
      }
    } catch (err) {
      console.error(`[skills] Error loading ${file}:`, err.message);
    }
  }

  console.log(`[skills] ${skills.length} skill(s) loaded`);
}

/**
 * Try to run a matching skill for the given text
 * @param {string} text - User's message text
 * @param {Object} ctx - Context: { userId, config }
 * @returns {string|null} Skill result or null if no skill matched
 */
async function runSkill(text, ctx) {
  for (const skill of skills) {
    try {
      if (skill.trigger(text)) {
        const result = await skill.run(text, ctx);
        return result;
      }
    } catch (err) {
      console.error(`[skills] Error running ${skill.name}:`, err.message);
      return `Skill "${skill.name}" encountered an error: ${err.message}`;
    }
  }
  return null;
}

/**
 * Get a formatted list of loaded skills
 * @returns {string} Formatted skill list
 */
function listSkills() {
  if (skills.length === 0) {
    return 'No skills loaded.';
  }

  return skills
    .map(s => `\u2022 ${s.name} \u2014 ${s.description || 'No description'}`)
    .join('\n');
}

module.exports = { loadSkills, runSkill, listSkills };
