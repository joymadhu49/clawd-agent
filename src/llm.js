const axios = require('axios');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Call OpenRouter LLM API
 * @param {Array} messages - Array of { role, content } message objects
 * @param {Object} config - Config with openrouterKey and model
 * @returns {string} The assistant's reply text
 */
async function callLLM(messages, config) {
  try {
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: config.model,
        messages,
        max_tokens: 1024,
      },
      {
        headers: {
          'Authorization': `Bearer ${config.openrouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/joymadhu49/clawd-agent',
          'X-Title': 'Clawd Agent',
        },
      }
    );

    const choice = response.data?.choices?.[0];
    if (!choice || !choice.message?.content) {
      throw new Error('No response content from model');
    }

    return choice.message.content.trim();
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        throw new Error('Invalid OpenRouter API key. Check your config.');
      }
      if (status === 429) {
        throw new Error('Rate limited by OpenRouter. Wait a moment and try again.');
      }
      throw new Error(`OpenRouter API error (${status}): ${error.response.data?.error?.message || 'Unknown error'}`);
    }
    throw new Error(`Failed to reach OpenRouter: ${error.message}`);
  }
}

module.exports = { callLLM };
