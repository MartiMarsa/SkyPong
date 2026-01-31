#!/bin/sh
set -e

echo "🔹 Step 1: Install npm dependencies"
npm ci

echo "🔹 Step 2: Generate JWT keys (if missing)"
npm run generate-keys

echo "🔹 Step 3: Compile TypeScript"
npm run build

# --- Check if Docker is installed ---
if ! command -v docker >/dev/null 2>&1; then
    echo "⚠️ Docker not found. Attempting to install Docker..."
    if [ -f /etc/debian_version ]; then
        echo "🔹 Installing Docker for Debian/Ubuntu..."
        sudo apt update
        sudo apt install -y docker.io
        sudo systemctl enable --now docker
        sudo usermod -aG docker $USER
        echo "✅ Docker installed. Log out and log back in to use Docker without sudo."
        exit 0
    else
        echo "❌ Automatic Docker installation is not supported for this OS. Please install Docker manually."
        exit 1
    fi
else
    echo "✅ Docker found: $(docker --version)"
fi

# --- Check if user has permissions to access Docker socket ---
if ! docker info >/dev/null 2>&1; then
    echo "⚠️ You do not have permission to access Docker."
    echo "Try running the script as root (sudo) or add your user to the 'docker' group:"
    echo "  sudo usermod -aG docker \$USER"
    echo "Then log out and log back in."
    exit 1
fi

echo "🔹 Step 4: Build Docker image"
docker build -t auth-service .

echo "🔹 Step 5: Run Docker container"
docker rm -f auth-service 2>/dev/null || true
docker run -d \
  -p 8081:8081 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/jwt-private.pem:/app/jwt-private.pem \
  -v $(pwd)/jwt-public.pem:/app/jwt-public.pem \
  --name auth-service \
  auth-service

echo "✅ Auth service is running at http://localhost:8081"

