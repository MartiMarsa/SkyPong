#!/bin/sh
set -e

echo "🔹 Stopping and removing Docker container..."
docker rm -f player-service 2>/dev/null || true

echo "🔹 Removing Docker image..."
docker rmi player-service 2>/dev/null || true

echo "🔹 Cleaning build artifacts..."
rm -rf dist
rm -rf data

echo "🔹 Removing generated JWT keys..."
rm -f jwt-private.pem jwt-public.pem

echo "✅ Cleanup complete. Project returned to initial state."

