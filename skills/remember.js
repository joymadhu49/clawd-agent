const { addMessage } = require('../src/memory');

module.exports = {
  name: 'remember',
  description: 'Save a note to your memory (usage: "remember that...")',

  trigger(text) {
    return text.toLowerCase().startsWith('remember ');
  },

  async run(text, ctx) {
    // Strip the "remember" prefix and clean up
    const note = text.replace(/^remember\s+/i, '').trim();

    if (!note) {
      return 'What should I remember? Try: "remember that ETH gas is low on Sundays"';
    }

    // Save as a system message so it persists in context
    await addMessage(ctx.userId, 'system', `[Saved note] ${note}`);

    return `Got it. I'll remember: "${note}"`;
  },
};
