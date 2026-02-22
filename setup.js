const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'config.json');

async function main() {
  // Dynamic import for enquirer (works with both CJS and ESM)
  const { prompt } = require('enquirer');

  console.log('\n  Clawd Agent Setup');
  console.log('  -----------------\n');

  const answers = await prompt([
    {
      type: 'input',
      name: 'agentName',
      message: 'Agent name',
      initial: 'Clawd',
    },
    {
      type: 'password',
      name: 'openrouterKey',
      message: 'OpenRouter API key',
      validate: (v) => v.length > 0 || 'API key is required',
    },
    {
      type: 'input',
      name: 'model',
      message: 'Model ID (see openrouter.ai/models)',
      initial: 'google/gemini-2.0-flash-exp:free',
    },
    {
      type: 'input',
      name: 'telegramToken',
      message: 'Telegram bot token (leave empty to skip)',
      initial: '',
    },
    {
      type: 'input',
      name: 'webPort',
      message: 'Web UI port',
      initial: '3000',
      result: (v) => parseInt(v, 10),
    },
  ]);

  // Clean up empty telegram token
  if (!answers.telegramToken || answers.telegramToken.trim() === '') {
    delete answers.telegramToken;
  }

  // Write config
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(answers, null, 2));

  console.log('\n  Config saved to config.json');
  console.log('');
  console.log('  Next steps:');
  console.log('    node index.js          Start the agent');
  console.log('    termux-wake-lock       Prevent Android from killing it');
  console.log(`    http://localhost:${answers.webPort || 3000}   Open Web UI`);
  console.log('');
}

main().catch((err) => {
  if (err.message === '' || err.code === 'ERR_USE_AFTER_CLOSE') {
    // User pressed Ctrl+C
    console.log('\n  Setup cancelled.\n');
  } else {
    console.error('Setup error:', err.message);
  }
  process.exit(1);
});
