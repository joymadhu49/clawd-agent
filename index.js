// Android Bionic patch — MUST be first line before any other require
const os = require('os');
const _orig = os.networkInterfaces.bind(os);
os.networkInterfaces = () => { try { return _orig(); } catch { return {}; } };

// Now safe to require everything else
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { loadSkills } = require('./src/skills');
const { startTelegram } = require('./src/telegram');
const { startWebUI } = require('./src/webui');

const CONFIG_PATH = path.join(__dirname, 'config.json');

// Check config exists
if (!fs.existsSync(CONFIG_PATH)) {
  console.error('No config.json found. Run "node setup.js" first.');
  process.exit(1);
}

let config;
try {
  config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
} catch (err) {
  console.error('Failed to parse config.json:', err.message);
  process.exit(1);
}

// Validate required fields
if (!config.openrouterKey) {
  console.error('Missing openrouterKey in config.json. Run "node setup.js" to fix.');
  process.exit(1);
}

if (!config.model) {
  config.model = 'google/gemini-2.0-flash-exp:free';
}

console.log(`\n  Clawd Agent v1.0.0`);
console.log(`  Agent: ${config.agentName || 'Clawd'}`);
console.log(`  Model: ${config.model}`);
console.log('');

// Load skill plugins
loadSkills();

// Start gateways
startTelegram(config);
startWebUI(config);

console.log('\n  All systems go.\n');
