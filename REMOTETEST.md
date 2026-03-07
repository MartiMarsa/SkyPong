# Remote Network Testing Setup Guide

This document explains how to test the 42-transcendence project between two computers on the same local network, enabling multiplayer game testing across different machines.

## Prerequisites

- Docker and Docker Compose installed on the host machine
- Two computers on the same local network (LAN)
- Basic familiarity with terminal commands
- The LAN IP address of the host computer (e.g., `192.168.1.100`)

---

## Quick Summary

| Component | Host Computer (Computer A) | Client Computer (Computer B) |
|-----------|---------------------------|------------------------------|
| Role      | Runs all Docker services | Browser-based client         |
| Services  | nginx-gateway, frontend, auth-service, profile-service, statistics-service, game-service | None (browser only)          |
| Access    | https://localhost:8443    | https://<HOST-IP>:8443      |

---

## Step 1: Find Your LAN IP Address

On the host computer (Computer A), run:

```bash
# macOS
ifconfig | grep -E "en0|en1" -A 5 | grep "inet " | awk '{print $2}'

# Linux
ip addr show | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | cut -d'/' -f1
```

Note this IP address (e.g., `192.168.1.100`). You will need it for all subsequent steps.

---

## Step 2: Configure Environment Variables

### 2.1 Edit the `.env` File

Open the `.env` file in the project root and add the `HOST_IP` variable:

```bash
# Add these lines to your .env file
HOST_IP=192.168.1.100   # Replace with your actual LAN IP
EXTERNAL_DOMAIN=192.168.1.100
```

### 2.2 Verify Service URLs

Ensure your `.env` has the correct internal service URLs (these should remain as Docker service names):

```bash
AUTH_SERVICE_URL=http://auth-service:8081
PROFILE_SERVICE_URL=http://profile-service:5000
STATS_SERVICE_URL=http://statistics-service:6000
```

---

## Step 3: Update TLS Certificate Generation

The default TLS certificate only works for `localhost`. You need a certificate that includes your LAN IP address.

### 3.1 Modify the Certificate Generator

Edit `nginx-gateway/tools/ssl_cert_generator.sh`:

**Find this section (around line 14-17):**

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "$KEY_FILE" \
  -out "$CRT_FILE" \
  -subj "/C=ES/ST=Barcelona/L=Barcelona/O=42/OU=Education/CN=localhost"
```

**Replace with:**

```bash
# Get HOST_IP from environment or use default
HOST_IP="${HOST_IP:-127.0.0.1}"

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "$KEY_FILE" \
  -out "$CRT_FILE" \
  -subj "/C=ES/ST=Barcelona/L=Barcelona/O=42/OU=Education/CN=${HOST_IP}" \
  -addext "subjectAltName=DNS:localhost,DNS:nginx-gateway,IP:${HOST_IP}"
```

### 3.2 Pass HOST_IP to Docker Build

Edit `docker-compose.yml` and add the HOST_IP environment variable to the nginx-gateway service:

**Find (around line 70-86):**

```yaml
nginx-gateway:
  container_name: nginx-gateway
  build: ./nginx-gateway
  ports:
    - "8443:443"
```

**Add environment section:**

```yaml
nginx-gateway:
  container_name: nginx-gateway
  build: ./nginx-gateway
  ports:
    - "8443:443"
  environment:
    - HOST_IP=${HOST_IP}
```

---

## Step 4: Update Game Frontend Configuration

The game frontend (React/Vite) needs to know the server address at build time.

### 4.1 Modify Docker Compose Build Args

Edit `docker-compose.yml` and find the `game-frontend` service (around line 190-207):

**Find:**

```yaml
game-frontend:
  container_name: game-frontend
  build:
    context: ./game
    dockerfile: Dockerfile.client
    args:
      VITE_SERVER_HOST: localhost
      VITE_SERVER_PORT: "8443"
      VITE_WS_PROTOCOL: wss
      VITE_SERVER_PATH: /ws
      VITE_BASE_PATH: /game-engine/
```

**Replace with:**

```yaml
game-frontend:
  container_name: game-frontend
  build:
    context: ./game
    dockerfile: Dockerfile.client
    args:
      VITE_SERVER_HOST: ${HOST_IP}
      VITE_SERVER_PORT: "8443"
      VITE_WS_PROTOCOL: wss
      VITE_SERVER_PATH: /ws
      VITE_BASE_PATH: /game-engine/
```

---

## Step 5: Update NGINX Configuration

Edit `nginx-gateway/nginx.conf` to accept connections from any hostname.

### 5.1 Update Server Name

**Find (around line 44-46):**

```nginx
server {
    listen 443 ssl;
    server_name localhost;
```

**Replace with:**

```nginx
server {
    listen 443 ssl;
    server_name localhost ${HOST_IP} _;
```

---

## Step 6: Rebuild and Start Services

### 6.1 Clean Previous Build (Recommended)

```bash
# Stop all containers
make down

# Remove old compose file to regenerate
rm -f docker-compose.yml
```

### 6.2 Rebuild with New Configuration

```bash
# Regenerate compose file and apply configuration
make config

# Rebuild all images (this applies the new certificate and configurations)
make rebuild
```

### 6.3 Verify Services are Running

```bash
make ps
```

You should see all services running (nginx-gateway, frontend, auth-service, game-service, profile-service, statistics-service, etc.).

---

## Step 7: Configure Firewall (If Needed)

### 7.1 macOS

```bash
# Allow incoming connections on port 8443
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/docker
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/local/bin/docker
```

Alternatively, temporarily disable the firewall:
```bash
# Temporarily disable (NOT recommended for production)
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off
```

### 7.2 Linux (UFW)

```bash
# Allow port 8443
sudo ufw allow 8443/tcp
sudo ufw reload
```

---

## Step 8: Testing from Computer B

### 8.1 Access the Application

On Computer B, open a web browser and navigate to:

```
https://192.168.1.100:8443
```

Replace `192.168.1.100` with your actual LAN IP address.

### 8.2 Accept Certificate Warning

Since we're using a self-signed certificate, your browser will show a security warning. This is expected:

- **Chrome/Edge**: Click "Advanced" → "Proceed to <IP> (unsafe)"
- **Firefox**: Click "Advanced" → "Accept the Risk and Continue"
- **Safari**: Click "Show Details" → "visit this website"

### 8.3 Create Test Accounts

**On Computer A:**
1. Open `https://localhost:8443`
2. Create account: `player1`

**On Computer B:**
1. Open `https://<HOST-IP>:8443`
2. Create account: `player2`

---

## Step 9: Test Multiplayer Game

### 9.1 Start a Game Room (Computer A)

1. Log in as `player1`
2. Navigate to the game section
3. Create a new game room or select "Play PvP"
4. Wait for an opponent to join

### 9.2 Join the Game (Computer B)

1. Log in as `player2`
2. Navigate to the game section
3. Join the room created by player1
4. The game should start with both players seeing each other's paddles in real-time

### 9.3 Verify Real-Time Communication

- Both players should see synchronized ball movement
- Paddle movements should be reflected in real-time on both screens
- Score updates should be visible to both players

---

## Troubleshooting

### Issue: Computer B Cannot Connect

**Check 1: Firewall**
```bash
# On Computer A, test if port is listening
telnet localhost 8443

# On Computer B, test connectivity
telnet 192.168.1.100 8443
```

**Check 2: Services Running**
```bash
make ps
```

**Check 3: Docker Network**
```bash
docker network ls
docker network inspect transcendence_frontend_v2
```

### Issue: Game Client Cannot Connect to Server

The game frontend may still be pointing to `localhost`. Check the built configuration:

```bash
# Access the game-frontend container
make exec-game-front

# Check the built JavaScript for hardcoded localhost
grep -r "localhost" /usr/share/nginx/html/assets/*.js
```

### Issue: WebSocket Connection Fails

WebSocket connections require special NGINX configuration. Ensure your nginx.conf has:

```nginx
location /ws/ {
    proxy_pass http://game_backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_read_timeout 86400;
}
```

### Issue: Certificate Warnings on Computer B

This is expected with self-signed certificates. For a cleaner experience:

**Option A:** Add the certificate to your OS trust store (Computer B)
- Export the certificate from Computer A: `docker cp nginx-gateway:/etc/nginx/certs/cert.pem ~/cert.pem`
- Import it into Computer B's trusted certificates

**Option B:** Use a proper domain with Let's Encrypt (for production)

---

## Quick Reference Commands

### Host Computer (Computer A)

```bash
# Initial setup
make config              # Apply environment configuration
make rebuild             # Rebuild and start everything

# Runtime
make ps                  # Check container status
make logs                # View all logs
make logs -f nginx-gateway  # View specific service logs

# Stop
make down                # Stop all services
```

### Testing Commands

```bash
# Verify port is accessible from other machine (run on Computer B)
curl -k https://192.168.1.100:8443

# Test WebSocket connection (run on Computer B)
wss://192.168.1.100:8443/ws/
```

---

## Summary

| Step | Action | Computer |
|------|--------|----------|
| 1    | Find LAN IP | A |
| 2    | Update .env with HOST_IP | A |
| 3    | Update certificate generator | A |
| 4    | Update docker-compose.yml | A |
| 5    | Update nginx.conf | A |
| 6    | Rebuild services | A |
| 7    | Configure firewall | A |
| 8    | Access from browser | B |
| 9    | Test multiplayer game | A + B |

---

## Cleanup

When testing is complete, to return to normal development:

```bash
# Restore original files
git checkout nginx-gateway/tools/ssl_cert_generator.sh
git checkout docker-compose.yml
git checkout nginx-gateway/nginx.conf

# Remove HOST_IP from .env (optional)
# Edit .env and remove HOST_IP and EXTERNAL_DOMAIN lines

# Rebuild
make clean
make config
make up
```
