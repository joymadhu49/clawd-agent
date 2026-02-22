const { execSync } = require('child_process');

const COMMANDS = {
  battery: {
    cmd: 'termux-battery-status',
    format: (data) => {
      const d = JSON.parse(data);
      return [
        '*Battery Status*',
        '',
        `Level: ${d.percentage}%`,
        `Status: ${d.status}`,
        `Health: ${d.health}`,
        `Temperature: ${d.temperature}\u00b0C`,
        d.plugged !== 'UNPLUGGED' ? `Plugged: ${d.plugged}` : 'Unplugged',
      ].join('\n');
    },
  },
  location: {
    cmd: 'termux-location -p gps',
    timeout: 30000,
    format: (data) => {
      const d = JSON.parse(data);
      return [
        '*Device Location*',
        '',
        `Latitude: ${d.latitude}`,
        `Longitude: ${d.longitude}`,
        `Altitude: ${d.altitude || 'N/A'}m`,
        `Accuracy: ${d.accuracy || 'N/A'}m`,
        `Provider: ${d.provider || 'gps'}`,
        '',
        `Maps: https://maps.google.com/?q=${d.latitude},${d.longitude}`,
      ].join('\n');
    },
  },
  camera: {
    cmd: 'termux-camera-photo -c 0 /data/data/com.termux/files/home/clawd-agent/data/photo.jpg',
    format: () => 'Photo captured and saved to data/photo.jpg',
  },
  clipboard: {
    cmd: 'termux-clipboard-get',
    format: (data) => `*Clipboard Contents*\n\n${data.trim() || '(empty)'}`,
  },
  brightness: {
    cmd: 'termux-brightness',
    format: (data) => `Current brightness: ${data.trim()}`,
  },
  wifi: {
    cmd: 'termux-wifi-connectioninfo',
    format: (data) => {
      const d = JSON.parse(data);
      return [
        '*WiFi Info*',
        '',
        `SSID: ${d.ssid || 'N/A'}`,
        `BSSID: ${d.bssid || 'N/A'}`,
        `IP: ${d.ip || 'N/A'}`,
        `Link Speed: ${d.link_speed || 'N/A'} Mbps`,
        `RSSI: ${d.rssi || 'N/A'} dBm`,
        `Frequency: ${d.frequency || 'N/A'} MHz`,
      ].join('\n');
    },
  },
  volume: {
    cmd: 'termux-volume',
    format: (data) => {
      const vols = JSON.parse(data);
      const lines = ['*Volume Levels*', ''];
      for (const v of vols) {
        lines.push(`${v.stream}: ${v.volume}/${v.max_volume}`);
      }
      return lines.join('\n');
    },
  },
  sensors: {
    cmd: 'termux-sensor -s accelerometer -n 1',
    timeout: 10000,
    format: (data) => {
      try {
        const d = JSON.parse(data);
        const vals = d.accelerometer?.values || d.values || [];
        return [
          '*Accelerometer*',
          '',
          `X: ${vals[0]?.toFixed(2) || 'N/A'}`,
          `Y: ${vals[1]?.toFixed(2) || 'N/A'}`,
          `Z: ${vals[2]?.toFixed(2) || 'N/A'}`,
        ].join('\n');
      } catch {
        return `Sensor data: ${data.trim()}`;
      }
    },
  },
  tts: {
    // Special — handled differently in run()
    format: () => 'Speaking...',
  },
};

// Keywords that map to device commands
const TRIGGERS = {
  battery: ['battery', 'charge', 'power level'],
  location: ['location', 'where am i', 'gps', 'coordinates'],
  camera: ['take photo', 'take a photo', 'capture photo', 'snap', 'take picture', 'take a picture'],
  clipboard: ['clipboard', 'paste', 'what did i copy'],
  wifi: ['wifi', 'wi-fi', 'network info', 'connection info', 'internet info'],
  volume: ['volume', 'sound level'],
  sensors: ['sensor', 'accelerometer', 'motion'],
  tts: ['say ', 'speak ', 'read aloud'],
};

function isTermux() {
  return process.env.PREFIX === '/data/data/com.termux/files/usr' ||
    process.env.TERMUX_VERSION != null;
}

module.exports = {
  name: 'device-info',
  description: 'Access device hardware: battery, location, camera, clipboard, wifi, volume, sensors, TTS (Termux only)',

  trigger(text) {
    const lower = text.toLowerCase();

    // Check for /device command
    if (lower.startsWith('/device')) return true;

    // Check trigger keywords
    for (const [, keywords] of Object.entries(TRIGGERS)) {
      for (const kw of keywords) {
        if (lower.includes(kw)) return true;
      }
    }
    return false;
  },

  async run(text, ctx) {
    const lower = text.toLowerCase();

    // /device command — show available commands
    if (lower === '/device' || lower === '/device help') {
      return [
        '*Device Commands*',
        '',
        'Ask me about any of these:',
        '\u2022 "battery" \u2014 Battery level & status',
        '\u2022 "location" / "where am i" \u2014 GPS location',
        '\u2022 "take a photo" \u2014 Capture from camera',
        '\u2022 "clipboard" \u2014 Read clipboard contents',
        '\u2022 "wifi" \u2014 WiFi connection info',
        '\u2022 "volume" \u2014 Volume levels',
        '\u2022 "sensors" \u2014 Accelerometer data',
        '\u2022 "say [text]" \u2014 Text-to-speech',
        '',
        isTermux() ? '_Running on Termux \u2014 all commands available_' : '_Not on Termux \u2014 commands will fail on this device_',
      ].join('\n');
    }

    // Detect which command to run
    let matched = null;
    for (const [cmd, keywords] of Object.entries(TRIGGERS)) {
      for (const kw of keywords) {
        if (lower.includes(kw)) {
          matched = cmd;
          break;
        }
      }
      if (matched) break;
    }

    if (!matched) {
      return 'I detected a device request but couldn\'t determine which one. Try "battery", "location", "wifi", etc.';
    }

    // Handle TTS separately
    if (matched === 'tts') {
      const ttsText = text.replace(/^(say|speak|read aloud)\s+/i, '').trim();
      if (!ttsText) return 'What should I say? Example: "say hello world"';

      try {
        execSync(`termux-tts-speak "${ttsText.replace(/"/g, '\\"')}"`, {
          timeout: 15000,
        });
        return `Speaking: "${ttsText}"`;
      } catch (err) {
        return `TTS failed: ${err.message}. Make sure termux-api is installed.`;
      }
    }

    // Run the Termux API command
    const cmdInfo = COMMANDS[matched];
    if (!cmdInfo || !cmdInfo.cmd) {
      return `Command "${matched}" is not configured.`;
    }

    try {
      const output = execSync(cmdInfo.cmd, {
        timeout: cmdInfo.timeout || 15000,
        encoding: 'utf-8',
      });

      return cmdInfo.format(output);
    } catch (err) {
      if (err.message.includes('ETIMEDOUT') || err.killed) {
        return `"${matched}" timed out. The device might not support this or permissions are needed.`;
      }
      if (err.message.includes('not found') || err.message.includes('ENOENT')) {
        return `"${matched}" requires the Termux:API app and \`pkg install termux-api\`. Install both and try again.`;
      }
      return `Device command failed: ${err.message}\n\nMake sure you have Termux:API app installed from F-Droid and ran \`pkg install termux-api\`.`;
    }
  },
};
