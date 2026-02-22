# Clawd Agent

Lightweight self-hosted AI agent that runs on your phone in Termux. No proot, no Ubuntu, no cloud. One command install, chat via Telegram or Web UI.

**Built by [@ClawdTricking](https://twitter.com/ClawdTricking) | [clawdtricking.xyz](https://clawdtricking.xyz)**

---

## Features

- **Runs natively in Termux** — pure Node.js, no native C++ deps
- **One-command install** — `curl | bash` and you're live
- **Under 100MB** total footprint
- **OpenRouter LLM** — use any model (free or paid)
- **Telegram bot** — chat with your agent from anywhere
- **Web UI** — dark terminal-style chat in your phone browser
- **Device access** — battery, location, camera, clipboard, WiFi, sensors, TTS
- **Skill plugins** — drop a `.js` file in `/skills` to extend
- **Persistent memory** — conversation history across sessions
- **MIT licensed** — fully open source

## Quick Install (Termux)

```bash
pkg install curl -y && curl -fsSL https://raw.githubusercontent.com/joymadhu49/clawd-agent/master/install.sh | bash
```

Then configure and start:

```bash
cd ~/clawd-agent
node setup.js
node index.js
```

## Manual Install

```bash
git clone https://github.com/joymadhu49/clawd-agent.git
cd clawd-agent
npm install
node setup.js
node index.js
```

## Setup

The setup wizard asks 5 questions:

| Field | Description |
|-------|-------------|
| Agent name | Your agent's display name (default: Clawd) |
| OpenRouter API key | Get one free at [openrouter.ai/keys](https://openrouter.ai/keys) |
| Model | Any OpenRouter model ID (default: free model) |
| Telegram token | From [@BotFather](https://t.me/BotFather) — leave empty to skip |
| Web port | Default: 3000 |

Config is saved to `config.json` (gitignored).

## Usage

### Web UI

Open `http://localhost:3000` in your browser (or `http://PHONE_IP:3000` from another device on the same WiFi).

### Telegram

Message your bot directly. It supports all commands and skills.

### Commands

| Command | Description |
|---------|-------------|
| `/help` | Show available commands |
| `/skills` | List loaded skill plugins |
| `/device` | Show device access commands |
| `/reset` | Clear conversation memory |

### Device Access

**Web UI** — click the "Device" button to access:
- Location (GPS)
- Camera (capture photo)
- Microphone (record audio)
- Battery status
- Network info
- Device info
- Notifications

**Telegram (Termux)** — just type naturally:
- `battery` — battery level and charging status
- `where am i` — GPS location with Google Maps link
- `take a photo` — capture from camera
- `clipboard` — read clipboard contents
- `wifi` — WiFi connection info
- `volume` — volume levels
- `sensors` — accelerometer data
- `say hello` — text-to-speech

Requires [Termux:API](https://f-droid.org/en/packages/com.termux.api/) app from F-Droid.

## Skills

Skills are `.js` files in the `/skills` directory. Drop one in and restart.

### Built-in Skills

| Skill | Trigger | Description |
|-------|---------|-------------|
| `clawd-scan` | Any `0x` + 40 hex char address | Token/contract scanner via clawdtricking.xyz |
| `remember` | `remember that...` | Save notes to persistent memory |
| `device-info` | `battery`, `location`, `wifi`, etc. | Access device hardware (Termux) |

### Writing a Skill

```js
module.exports = {
  name: 'my-skill',
  description: 'What it does',

  trigger(text) {
    return text.includes('keyword');
  },

  async run(text, ctx) {
    // ctx = { userId, config }
    return 'Result string';
  }
};
```

## Project Structure

```
clawd-agent/
├── index.js            Entry point (Bionic patch + startup)
├── setup.js            Interactive setup wizard
├── install.sh          Termux one-liner installer
├── package.json
├── config.json         Created by setup (gitignored)
├── LICENSE             MIT
│
├── src/
│   ├── agent.js        Core message processor
│   ├── llm.js          OpenRouter API caller
│   ├── memory.js       Conversation history (lowdb)
│   ├── skills.js       Skill plugin loader
│   ├── telegram.js     Telegram bot (grammy)
│   └── webui.js        Express web server
│
├── public/
│   └── index.html      Web UI (single file, no build)
│
├── skills/
│   ├── clawd-scan.js   Token scanner
│   ├── device-info.js  Device hardware access
│   └── remember.js     Note saving
│
└── data/
    └── memory.json     Auto-created on first run
```

## Tech Stack

| Package | Purpose |
|---------|---------|
| [grammy](https://grammy.dev) | Telegram bot — pure JS, zero native deps |
| [express](https://expressjs.com) | Web UI server |
| [lowdb](https://github.com/typicode/lowdb) | JSON file database — no SQLite binaries |
| [axios](https://axios-http.com) | HTTP client for OpenRouter |
| [enquirer](https://github.com/enquirer/enquirer) | CLI setup wizard |
| [dotenv](https://github.com/motdotla/dotenv) | Optional .env config |

> **Why these?** `grammy` over telegraf, `lowdb` over better-sqlite3 — the alternatives have native C++ deps that break on Termux ARM64.

## Free Models

Get a free API key at [openrouter.ai](https://openrouter.ai) and use any of these:

| Model | Notes |
|-------|-------|
| `meta-llama/llama-3.3-70b-instruct:free` | Strong general purpose |
| `deepseek/deepseek-r1-0528:free` | Reasoning model |
| `google/gemma-3-27b-it:free` | Fast and capable |
| `mistralai/mistral-small-3.1-24b-instruct:free` | Good for instructions |
| `qwen/qwen3-coder:free` | Best for code |

## Keep Alive on Termux

```bash
# Prevent Android from killing the process
termux-wake-lock

# Run in tmux so it survives terminal close
tmux new -s clawd 'node index.js'

# Auto-start on boot (install.sh sets this up)
# Requires Termux:Boot app from F-Droid
```

## License

[MIT](LICENSE) — do whatever you want with it.

---

**@ClawdTricking | [clawdtricking.xyz](https://clawdtricking.xyz)**
