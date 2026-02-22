const { Bot } = require('grammy');
const { processMessage } = require('./agent');

/**
 * Start the Telegram bot gateway
 * @param {Object} config - App configuration
 */
function startTelegram(config) {
  if (!config.telegramToken) {
    console.log('[telegram] No token configured — Telegram bot disabled');
    return;
  }

  const bot = new Bot(config.telegramToken);

  bot.on('message:text', async (ctx) => {
    const userId = `tg-${ctx.from.id}`;
    const text = ctx.message.text;

    try {
      // Send typing indicator
      await ctx.replyWithChatAction('typing');

      const reply = await processMessage(userId, text, config);

      // Send reply with Markdown formatting
      try {
        await ctx.reply(reply, { parse_mode: 'Markdown' });
      } catch {
        // If Markdown parsing fails, send as plain text
        await ctx.reply(reply);
      }
    } catch (err) {
      console.error('[telegram] Error handling message:', err.message);
      await ctx.reply('Something went wrong. Try again.');
    }
  });

  // Global error handler — log but don't crash
  bot.catch((err) => {
    console.error('[telegram] Bot error:', err.message || err);
  });

  bot.start();
  console.log('[telegram] Bot started and listening');
}

module.exports = { startTelegram };
