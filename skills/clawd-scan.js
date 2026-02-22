const axios = require('axios');

module.exports = {
  name: 'clawd-scan',
  description: 'Scan a token/contract address',

  trigger(text) {
    // Match Ethereum-style addresses: 0x followed by 40 hex characters
    return /0x[a-fA-F0-9]{40}/.test(text);
  },

  async run(text, ctx) {
    const match = text.match(/0x[a-fA-F0-9]{40}/);
    if (!match) return 'No valid address found.';

    const address = match[0];

    try {
      const res = await axios.get(`https://api.gopluslabs.io/api/v1/token_security/1?contract_addresses=${address}`, {
        timeout: 10000,
      });

      const data = res.data;

      if (data.error) {
        return `Scan failed: ${data.error}`;
      }

      // Format the scan result
      const lines = [
        `*Clawd Scan Result*`,
        '',
        `Address: \`${address}\``,
      ];

      if (data.name) lines.push(`Name: ${data.name}`);
      if (data.symbol) lines.push(`Symbol: ${data.symbol}`);
      if (data.risk) lines.push(`Risk: ${data.risk}`);
      if (data.score !== undefined) lines.push(`Score: ${data.score}/100`);
      if (data.details) lines.push(`\n${data.details}`);

      return lines.join('\n');
    } catch (err) {
      if (err.response?.status === 404) {
        return `No data found for \`${address}\`. It may not be indexed yet.`;
      }
      return `Scan error: ${err.message}`;
    }
  },
};
