#!/usr/bin/env bash

DOCKCOMPS="docker-compose.yml"

# SI YA EXISTE, PEDIR CONFIRMACIÓN
if [[ -f "$DOCKCOMPS" ]]; then
    echo "⚠️  El archivo '$DOCKCOMPS' ya existe."
    read -p "¿Quieres recrearlo? (y/N): " confirm

    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        echo "❌ Operación cancelada."
        exit 0
    fi

    echo "🔄 Recreando '$DOCKCOMPS'..."
fi

# CAMBIAR BASE DEPENDIENDO DEL HOST (42 O TU CASA)
BASE="/sgoinfre/students/${USER}/transcendence-dev/volumes/"
#BASE="TUCASA"

AUTH="sqlite_auth"
FRONT="front-dev"
STATISTICS="statistics"
GAME_SERVICE="game-service"
PROFILE="profile"

sed -i "s|PLACEHOLDER_SQLITE_AUTH|$BASE$AUTH|g" "$DOCKCOMPS"
sed -i "s|PLACEHOLDER_STATISTICS|$BASE$STATISTICS|g" "$DOCKCOMPS"
sed -i "s|PLACEHOLDER_GAME_SERVICE|$BASE$GAME_SERVICE|g" "$DOCKCOMPS"
sed -i "s|PLACEHOLDER_PROFILE|$BASE$PROFILE|g" "$DOCKCOMPS"
sed -i "s|PLACEHOLDER_FRONT|$BASE$FRONT|g" "$DOCKCOMPS"
