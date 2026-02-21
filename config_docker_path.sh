#!/usr/bin/env bash
set -euo pipefail

cat > .env <<EOF
UID=$(id -u)
GID=$(id -g)
EOF
DOCKCOMPS="docker-compose.yml"

# CAMBIAR BASE DEPENDIENDO DEL HOST (42 O TU CASA)
#BASE="/sgoinfre/students/${USER}/transcendence-dev/volumes/"
# BASE=$PWD/volumes/
BASE=/media/fdi-cecc/Untitled/volumes/
echo $BASE
AUTH="sqlite_auth"
FRONT="front-dev"
STATISTICS="statistics"
PROFILE="profile"
GAME_SERVICE="game"

# Crear directorios host para todos los volúmenes y aplicar permisos
mkdir -p \
  "${BASE}${AUTH}" \
  "${BASE}${FRONT}" \
  "${BASE}${STATISTICS}" \
  "${BASE}${PROFILE}" 2>/dev/null || true

chmod 777 \
  "${BASE}${AUTH}" \
  "${BASE}${FRONT}" \
  "${BASE}${STATISTICS}" \
  "${BASE}${PROFILE}" 2>/dev/null || true


# Intentar chown (puede fallar en 42/rootless o ciertos FS) sin romper el script
chown -R "$USER:$USER" \
  "${BASE}${AUTH}" \
  "${BASE}${FRONT}" \
  "${BASE}${STATISTICS}" \
  "${BASE}${PROFILE}" 2>/dev/null || true

# Asegurar permisos mínimos para tu usuario
chmod -R u+rwX \
  "${BASE}${AUTH}" \
  "${BASE}${FRONT}" \
  "${BASE}${STATISTICS}" \
  "${BASE}${PROFILE}" 2>/dev/null || true

echo "✅ Directorios OK:"
ls -ld "${BASE}${AUTH}" "${BASE}${FRONT}" "${BASE}${STATISTICS}" "${BASE}${PROFILE}"

# 3) SUSTITUIR PLACEHOLDERS EN docker-compose.yml
echo "🧩 Sustituyendo placeholders de paths..."

# LINUX
system=$(uname -s)
if [[ $system == "Linux" ]]; then
    sed -i "s|PLACEHOLDER_SQLITE_AUTH|${BASE}${AUTH}|g" "$DOCKCOMPS"
    sed -i "s|PLACEHOLDER_STATISTICS|${BASE}${STATISTICS}|g" "$DOCKCOMPS"
    sed -i "s|PLACEHOLDER_GAME_SERVICE|${BASE}${GAME_SERVICE}|g" "$DOCKCOMPS"
    sed -i "s|PLACEHOLDER_PROFILE|${BASE}${PROFILE}|g" "$DOCKCOMPS"
    sed -i "s|PLACEHOLDER_FRONT|${BASE}${FRONT}|g" "$DOCKCOMPS"
fi

# MacOS
if [[ $system == "Darwin" ]]; then
    sed -i '' "s|PLACEHOLDER_SQLITE_AUTH|${BASE}${AUTH}|g" "$DOCKCOMPS"
    sed -i '' "s|PLACEHOLDER_STATISTICS|${BASE}${STATISTICS}|g" "$DOCKCOMPS"
    sed -i '' "s|PLACEHOLDER_GAME_SERVICE|${BASE}${GAME_SERVICE}|g" "$DOCKCOMPS"
    sed -i '' "s|PLACEHOLDER_PROFILE|${BASE}${PROFILE}|g" "$DOCKCOMPS"
    sed -i '' "s|PLACEHOLDER_FRONT|${BASE}${FRONT}|g" "$DOCKCOMPS"
fi

echo "✅ Placeholders sustituidos en '$DOCKCOMPS'."
echo "👉 Ya puedes hacer: make up"
