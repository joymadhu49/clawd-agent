const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'memory.json');
const MAX_HISTORY = 20;

let db = null;

/**
 * Initialize the lowdb database (ESM dynamic import)
 */
async function initDB() {
  if (db) return db;

  const { JSONFilePreset } = await import('lowdb/node');
  db = await JSONFilePreset(DB_PATH, { users: {} });
  return db;
}

/**
 * Get conversation history for a user
 * @param {string} userId
 * @returns {Array} Array of { role, content } messages
 */
async function getHistory(userId) {
  const db = await initDB();
  return db.data.users[userId]?.history || [];
}

/**
 * Add a message to a user's conversation history
 * @param {string} userId
 * @param {string} role - 'user', 'assistant', or 'system'
 * @param {string} content
 */
async function addMessage(userId, role, content) {
  const db = await initDB();

  if (!db.data.users[userId]) {
    db.data.users[userId] = { history: [] };
  }

  db.data.users[userId].history.push({ role, content });

  // Trim to last MAX_HISTORY messages
  if (db.data.users[userId].history.length > MAX_HISTORY) {
    db.data.users[userId].history = db.data.users[userId].history.slice(-MAX_HISTORY);
  }

  await db.write();
}

/**
 * Clear conversation history for a user
 * @param {string} userId
 */
async function clearHistory(userId) {
  const db = await initDB();

  if (db.data.users[userId]) {
    db.data.users[userId].history = [];
    await db.write();
  }
}

module.exports = { getHistory, addMessage, clearHistory };
