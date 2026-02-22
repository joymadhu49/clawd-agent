#!/data/data/com.termux/files/usr/bin/bash

# Clawd Agent — Termux Installer
# curl -fsSL https://raw.githubusercontent.com/joymadhu49/clawd-agent/master/install.sh | bash

set -e

echo ""
echo "  Clawd Agent Installer"
echo "  ---------------------"
echo ""

# Update packages
echo "[1/5] Updating packages..."
pkg update -y && pkg upgrade -y

# Install Node.js, git, and termux-api
echo "[2/5] Installing Node.js, git, and termux-api..."
pkg install -y nodejs git termux-api

# Check Node version
NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo ""
  echo "  ERROR: Node.js v18+ required (you have $(node -v))"
  echo "  Try: pkg install nodejs-lts"
  echo ""
  exit 1
fi
echo "  Node.js $(node -v) OK"

# Clone or update repo
REPO_DIR="$HOME/clawd-agent"
echo "[3/5] Setting up project..."
if [ -d "$REPO_DIR" ]; then
  echo "  Found existing install, pulling updates..."
  cd "$REPO_DIR"
  git pull
else
  git clone https://github.com/joymadhu49/clawd-agent.git "$REPO_DIR"
  cd "$REPO_DIR"
fi

# Install dependencies
echo "[4/5] Installing dependencies..."
npm install

# Create data directory
mkdir -p data

# Set up Termux:Boot auto-start
echo "[5/5] Setting up auto-start..."
BOOT_DIR="$HOME/.termux/boot"
mkdir -p "$BOOT_DIR"
cat > "$BOOT_DIR/clawd-agent.sh" << 'BOOTEOF'
#!/data/data/com.termux/files/usr/bin/bash
termux-wake-lock
cd ~/clawd-agent && node index.js
BOOTEOF
chmod +x "$BOOT_DIR/clawd-agent.sh"

echo ""
echo "  ================================"
echo "  Clawd Agent installed!"
echo "  ================================"
echo ""
echo "  Next steps:"
echo ""
echo "    cd ~/clawd-agent"
echo "    node setup.js        # Configure your agent"
echo "    node index.js        # Start it up"
echo ""
echo "  Tips:"
echo "    termux-wake-lock     # Keep running when screen off"
echo "    tmux new -s clawd 'node index.js'  # Survive terminal close"
echo ""
echo "  For device access (battery, camera, location, etc.):"
echo "    Install Termux:API app from F-Droid"
echo ""
echo "  Install Termux:Boot app for auto-start on reboot."
echo ""
echo "  @ClawdTricking | clawdtricking.xyz"
echo ""
