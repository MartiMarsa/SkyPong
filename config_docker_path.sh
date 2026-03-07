#!/usr/bin/env bash
set -euo pipefail

GRAFANA_ADMIN_USER_VALUE=${GRAFANA_ADMIN_USER:-grafana_admin}
GRAFANA_ADMIN_PASSWORD_VALUE=${GRAFANA_ADMIN_PASSWORD:-change_me_please}

cat > .env <<EOF
UID=$(id -u)
GID=$(id -g)
GRAFANA_ADMIN_USER=${GRAFANA_ADMIN_USER_VALUE}
GRAFANA_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD_VALUE}
EOF
DOCKCOMPS="docker-compose.yml"

# CAMBIAR BASE DEPENDIENDO DEL HOST (42 O TU CASA)
#BASE="/sgoinfre/students/${USER}/transcendence-dev/volumes/"
BASE=$PWD/volumes/
echo $BASE
AUTH="sqlite_auth"
FRONT="front-dev"
STATISTICS="statistics"
PROFILE="profile"
GAME_SERVICE="game"
STATIC="${PWD}/static"
UPLOADS="${PWD}/uploads"
AVATARS="${UPLOADS}/avatars"

# Crear directorios host para todos los volúmenes y aplicar permisos
mkdir -p \
  "${BASE}${AUTH}" \
  "${BASE}${FRONT}" \
  "${BASE}${STATISTICS}" \
  "${BASE}${PROFILE}" \
  "${STATIC}" \
  "${AVATARS}" 2>/dev/null || true

chmod 777 \
  "${BASE}${AUTH}" \
  "${BASE}${FRONT}" \
  "${BASE}${STATISTICS}" \
  "${BASE}${PROFILE}" \
  "${STATIC}" \
  "${UPLOADS}" 2>/dev/null || true


# Intentar chown (puede fallar en 42/rootless o ciertos FS) sin romper el script
chown -R "$USER:$USER" \
  "${BASE}${AUTH}" \
  "${BASE}${FRONT}" \
  "${BASE}${STATISTICS}" \
  "${BASE}${PROFILE}" \
  "${STATIC}" \
  "${UPLOADS}" 2>/dev/null || true

# Asegurar permisos mínimos para tu usuario
chmod -R u+rwX \
  "${BASE}${AUTH}" \
  "${BASE}${FRONT}" \
  "${BASE}${STATISTICS}" \
  "${BASE}${PROFILE}" \
  "${STATIC}" \
  "${UPLOADS}" 2>/dev/null || true

echo "✅ Directorios OK:"
ls -ld "${BASE}${AUTH}" "${BASE}${FRONT}" "${BASE}${STATISTICS}" "${BASE}${PROFILE}" "${UPLOADS}" "${STATIC}" "${AVATARS}"

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
