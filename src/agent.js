const { callLLM } = require('./llm');
const { getHistory, addMessage, clearHistory } = require('./memory');
const { runSkill, listSkills } = require('./skills');

/**
 * Build the system prompt for the agent
 */
function buildSystemPrompt(config) {
  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return {
    role: 'system',
    content: [
      `You are ${config.agentName || 'Clawd'}, a sharp and knowledgeable AI agent.`,
      `You were built by @ClawdTricking and run on clawdtricking.xyz.`,
      `You are helpful, concise, and have deep knowledge of Web3, crypto, DeFi, and blockchain.`,
      `You speak in a confident, slightly edgy tone — never boring, never corporate.`,
      `Keep responses short and punchy unless the user asks for detail.`,
      `You can access device hardware (battery, location, camera, etc.) when users ask. On Termux, use natural language triggers. On Web UI, users have a Device panel.`,
      `Today is ${date}.`,
    ].join(' '),
  };
}

/**
 * Process an incoming message and return a reply
 * @param {string} userId - Unique user identifier
 * @param {string} text - The user's message text
 * @param {Object} config - App configuration
 * @returns {string} The reply to send back
 */
async function processMessage(userId, text, config) {
  const trimmed = text.trim();

  // Handle commands
  if (trimmed === '/start') {
    return `Yo, I'm ${config.agentName || 'Clawd'}. Your on-device AI agent.\n\nType anything to chat. Use /help for commands.`;
  }

  if (trimmed === '/help') {
    return [
      `*${config.agentName || 'Clawd'} Commands*`,
      '',
      '/help \u2014 Show this message',
      '/skills \u2014 List loaded skills',
      '/device \u2014 Device access commands',
      '/reset \u2014 Clear conversation memory',
      '',
      `Model: \`${config.model}\``,
      `Built by @ClawdTricking`,
    ].join('\n');
  }

  if (trimmed === '/reset') {
    await clearHistory(userId);
    return 'Memory cleared. Fresh start.';
  }

  if (trimmed === '/skills') {
    const list = listSkills();
    return `*Loaded Skills*\n\n${list}`;
  }

  // Try skills first
  const skillResult = await runSkill(trimmed, { userId, config });
  if (skillResult) {
    await addMessage(userId, 'user', trimmed);
    await addMessage(userId, 'assistant', skillResult);
    return skillResult;
  }

  // Build message array for LLM
  const history = await getHistory(userId);
  const systemPrompt = buildSystemPrompt(config);
  const messages = [
    systemPrompt,
    ...history,
    { role: 'user', content: trimmed },
  ];

  // Call LLM
  let reply;
  try {
    reply = await callLLM(messages, config);
  } catch (err) {
    console.error('[agent] LLM error:', err.message);
    return `Something went wrong: ${err.message}`;
  }

  // Save to memory
  await addMessage(userId, 'user', trimmed);
  await addMessage(userId, 'assistant', reply);

  return reply;
}

module.exports = { processMessage };
