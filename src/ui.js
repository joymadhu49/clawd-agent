/**
 * Terminal UI helpers — ANSI colors, boxes, sections
 * Zero dependencies — works in any terminal including Termux
 */

// ANSI color codes
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',

  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',

  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
};

// Styled text helpers
const red = (t) => `${c.red}${t}${c.reset}`;
const green = (t) => `${c.green}${t}${c.reset}`;
const yellow = (t) => `${c.yellow}${t}${c.reset}`;
const blue = (t) => `${c.blue}${t}${c.reset}`;
const cyan = (t) => `${c.cyan}${t}${c.reset}`;
const magenta = (t) => `${c.magenta}${t}${c.reset}`;
const gray = (t) => `${c.gray}${t}${c.reset}`;
const bold = (t) => `${c.bold}${t}${c.reset}`;
const dim = (t) => `${c.dim}${t}${c.reset}`;

const LOBSTER = '\u{1F99E}';

// ASCII art banner
function banner() {
  const art = `
${c.red}${c.bold}   ██████╗██╗      █████╗ ██╗    ██╗██████╗ 
  ██╔════╝██║     ██╔══██╗██║    ██║██╔══██╗
  ██║     ██║     ███████║██║ █╗ ██║██║  ██║
  ██║     ██║     ██╔══██║██║███╗██║██║  ██║
  ╚██████╗███████╗██║  ██║╚███╔███╔╝██████╔╝
   ╚═════╝╚══════╝╚═╝  ╚═╝ ╚══╝╚══╝ ╚═════╝${c.reset}`;

  console.log(art);
  console.log(`         ${LOBSTER} ${c.bold}${c.red}CLAWD AGENT${c.reset} ${LOBSTER}`);
  console.log('');
}

// Section header like OpenClaw style
function section(title) {
  const line = '─'.repeat(Math.max(50 - title.length - 3, 10));
  console.log(`\n${c.yellow}◇${c.reset}  ${c.red}${c.bold}${title}${c.reset} ${c.gray}${line}${c.reset}`);
}

// Info box with gray border
function box(lines) {
  const maxLen = Math.max(...lines.map(l => stripAnsi(l).length), 40);
  const top = `  ${c.gray}┌${'─'.repeat(maxLen + 2)}┐${c.reset}`;
  const bot = `  ${c.gray}└${'─'.repeat(maxLen + 2)}┘${c.reset}`;

  console.log(top);
  for (const line of lines) {
    const pad = ' '.repeat(Math.max(maxLen - stripAnsi(line).length, 0));
    console.log(`  ${c.gray}│${c.reset} ${line}${pad} ${c.gray}│${c.reset}`);
  }
  console.log(bot);
}

// Step indicator
function step(label, value) {
  console.log(`${c.yellow}◇${c.reset}  ${c.green}${c.bold}${label}${c.reset}`);
  if (value !== undefined) {
    console.log(`${c.gray}│${c.reset}  ${value}`);
  }
}

// Status line
function status(label, value, color = 'green') {
  const colorFn = { green, red, yellow, blue, cyan, gray }[color] || green;
  console.log(`  ${colorFn('●')} ${c.bold}${label}${c.reset}: ${value}`);
}

// Divider
function divider() {
  console.log(`${c.gray}${'─'.repeat(55)}${c.reset}`);
}

// Spinner (simple dots animation)
function spinner(text) {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  const id = setInterval(() => {
    process.stdout.write(`\r${c.yellow}${frames[i % frames.length]}${c.reset} ${text}`);
    i++;
  }, 80);

  return {
    stop(finalText) {
      clearInterval(id);
      process.stdout.write(`\r${c.green}✓${c.reset} ${finalText || text}\n`);
    },
    fail(finalText) {
      clearInterval(id);
      process.stdout.write(`\r${c.red}✗${c.reset} ${finalText || text}\n`);
    },
  };
}

// Strip ANSI codes for length calculation
function stripAnsi(str) {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

// Blank line
function nl() {
  console.log('');
}

module.exports = {
  c, red, green, yellow, blue, cyan, magenta, gray, bold, dim,
  banner, section, box, step, status, divider, spinner, nl, LOBSTER,
};
