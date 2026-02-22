```
   ██████╗██╗      █████╗ ██╗    ██╗██████╗ 
  ██╔════╝██║     ██╔══██╗██║    ██║██╔══██╗
  ██║     ██║     ███████║██║ █╗ ██║██║  ██║
  ██║     ██║     ██╔══██║██║███╗██║██║  ██║
  ╚██████╗███████╗██║  ██║╚███╔███╔╝██████╔╝
   ╚═════╝╚══════╝╚═╝  ╚═╝ ╚══╝╚══╝ ╚═════╝
```

**Self-hosted AI agent for your phone.** Runs in Termux. No root, no cloud, no bloat.

Chat via Telegram or Web UI. Access device hardware. Extend with plugins.

[![License: MIT](https://img.shields.io/badge/License-MIT-red.svg)](LICENSE)

---

## Install (30 seconds)

Open **Termux** and paste:

```bash
pkg install curl -y && curl -fsSL https://raw.githubusercontent.com/joymadhu49/clawd-agent/master/install.sh | bash
```

That's it. It installs everything: Node.js, git, dependencies, auto-start.

When done:

```bash
cd ~/clawd-agent
node cli.js
```

> **On PC?** `git clone https://github.com/joymadhu49/clawd-agent.git && cd clawd-agent && npm install && node cli.js`

---

## 3-Step Setup

```bash
cd ~/clawd-agent
node cli.js onboard
```

The interactive wizard walks you through everything:

```
Step 1  →  Pick a model (arrow keys, free options included)
Step 2  →  Paste your OpenRouter API key
Step 3  →  Done. Type "node cli.js start"
```

**Get a free API key** at [openrouter.ai/keys](https://openrouter.ai/keys) — takes 10 seconds, no credit card.

**Telegram bot** is optional. Create one via [@BotFather](https://t.me/BotFather) if you want it.

---

## CLI Commands

Everything happens in the terminal. No config files to edit.

```bash
node cli.js              # Interactive menu (arrow keys)
node cli.js onboard      # Setup wizard
node cli.js start        # Launch the agent
node cli.js config       # Change API key, model, etc.
node cli.js status       # Check health + test API connection
node cli.js skills       # See installed plugins
node cli.js reset        # Clear memory or config
node cli.js help         # All commands + links
```

---

## Chat

### Web UI

After starting, open in your browser:

```
http://localhost:3000
```

From another device on the same WiFi:

```
http://YOUR_PHONE_IP:3000
```

Dark terminal-style chat. Works on phone and desktop.

### Telegram

Message your bot directly. All commands and skills work there too.

### Chat Commands

| Command | What it does |
|---------|-------------|
| `/help` | Show commands |
| `/skills` | List plugins |
| `/device` | Device access options |
| `/reset` | Clear memory |

---

## Device Access

### Web UI

Click the **Device** button at the bottom:

| Button | Permission | What you get |
|--------|-----------|-------------|
| Location | GPS | Lat/long + Google Maps link |
| Camera | Camera | Captures a photo, shows in chat |
| Microphone | Mic | Records 5s audio clip |
| Battery | None | Level, charging, time remaining |
| Network | None | Type, speed, RTT |
| Device Info | None | Platform, screen, cores, memory |
| Notifications | Push | Enable browser alerts |

### Telegram (Termux only)

Just type naturally:

| Say this | Get this |
|----------|---------|
| `battery` | Battery level + charging status |
| `where am i` | GPS coordinates + Maps link |
| `take a photo` | Camera capture |
| `clipboard` | What you last copied |
| `wifi` | Network name, IP, speed |
| `volume` | All volume levels |
| `say hello world` | Text-to-speech |

> Needs [Termux:API app](https://f-droid.org/en/packages/com.termux.api/) from F-Droid.

---

## Free Models

All free, no credit card needed:

| Model | Best for |
|-------|---------|
| `meta-llama/llama-3.3-70b-instruct:free` | General chat |
| `deepseek/deepseek-r1-0528:free` | Reasoning + logic |
| `google/gemma-3-27b-it:free` | Fast responses |
| `qwen/qwen3-coder:free` | Code + dev |
| `mistralai/mistral-small-3.1-24b-instruct:free` | Instructions |
| `nvidia/nemotron-3-nano-30b-a3b:free` | Lightweight |
| `openai/gpt-oss-120b:free` | Large context |

Pick one during `node cli.js onboard` or change anytime with `node cli.js config`.

---

## Skills (Plugins)

Drop a `.js` file into `skills/` and restart. That's it.

### Built-in

| Skill | Trigger | Does |
|-------|---------|------|
| `clawd-scan` | Paste any `0x...` address | Scans token/contract |
| `remember` | `remember that...` | Saves notes to memory |
| `device-info` | `battery`, `location`, etc. | Reads phone hardware |

### Make Your Own

```js
// skills/my-skill.js
module.exports = {
  name: 'my-skill',
  description: 'What it does',

  trigger(text) {
    return text.includes('keyword');
  },

  async run(text, ctx) {
    // ctx = { userId, config }
    return 'Response to user';
  }
};
```

---

## Keep Running on Termux

```bash
# Prevent Android from killing it
termux-wake-lock

# Survive closing the terminal
tmux new -s clawd 'node cli.js start'

# Auto-start on phone reboot (installer sets this up)
# Just install Termux:Boot from F-Droid
```

Disable battery optimization for Termux in Android Settings for best results.

---

## Project Structure

```
clawd-agent/
├── cli.js              Interactive terminal UI
├── index.js            Direct start (no UI)
├── setup.js            Legacy setup wizard
├── install.sh          Termux one-liner installer
├── package.json
│
├── src/
│   ├── agent.js        Core message processor
│   ├── llm.js          OpenRouter API
│   ├── memory.js       Conversation history (lowdb)
│   ├── skills.js       Plugin loader
│   ├── telegram.js     Telegram bot (grammy)
│   ├── webui.js        Express web server
│   └── ui.js           Terminal colors + formatting
│
├── public/
│   └── index.html      Web UI (single file)
│
├── skills/
│   ├── clawd-scan.js   Token scanner
│   ├── device-info.js  Device hardware access
│   └── remember.js     Note saving
│
└── data/
    └── memory.json     Auto-created
```

## Tech Stack

Pure JS, no native binaries, Termux-safe:

| Package | Why |
|---------|-----|
| [grammy](https://grammy.dev) | Telegram bot (not telegraf — native deps) |
| [express](https://expressjs.com) | Web server |
| [lowdb](https://github.com/typicode/lowdb) | JSON DB (not sqlite — native deps) |
| [axios](https://axios-http.com) | HTTP client |
| [enquirer](https://github.com/enquirer/enquirer) | Interactive CLI prompts |
| [dotenv](https://github.com/motdotla/dotenv) | Env config |

---

## License

[MIT](LICENSE) — use it, fork it, ship it.

---

**[@zx_joy_](https://x.com/zx_joy_)**
