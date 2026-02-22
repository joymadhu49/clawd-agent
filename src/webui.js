const express = require('express');
const path = require('path');
const { processMessage } = require('./agent');
const { addMessage } = require('./memory');

/**
 * Start the Web UI Express server
 * @param {Object} config - App configuration
 */
function startWebUI(config) {
  const app = express();
  const port = config.webPort || 3000;

  // Middleware
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '..', 'public')));

  // Chat endpoint
  app.post('/api/chat', async (req, res) => {
    const { message, sessionId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const userId = `web-${sessionId || 'anonymous'}`;

    try {
      const reply = await processMessage(userId, message, config);
      res.json({ reply });
    } catch (err) {
      console.error('[webui] Chat error:', err.message);
      res.status(500).json({ error: 'Something went wrong' });
    }
  });

  // Device data endpoint — receives browser device info and stores in memory
  app.post('/api/device', async (req, res) => {
    const { sessionId, type, data } = req.body;

    if (!type || !data) {
      return res.status(400).json({ error: 'type and data required' });
    }

    const userId = `web-${sessionId || 'anonymous'}`;

    try {
      // Store device data as system context in memory
      await addMessage(userId, 'system', `[Device ${type}] ${data}`);
      console.log(`[webui] Device data received: ${type} from ${userId}`);
      res.json({ ok: true });
    } catch (err) {
      console.error('[webui] Device data error:', err.message);
      res.status(500).json({ error: 'Failed to store device data' });
    }
  });

  // Info endpoint
  app.get('/api/info', (req, res) => {
    res.json({
      agentName: config.agentName || 'Clawd',
      model: config.model,
      version: '1.0.0',
    });
  });

  app.listen(port, '0.0.0.0', () => {
    console.log(`[webui] Server running at http://0.0.0.0:${port}`);
  });
}

module.exports = { startWebUI };
