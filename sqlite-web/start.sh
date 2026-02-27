#!/bin/sh

DATA_DIR="/data"
PORT="${PORT:-8080}"

DBS=""

# Searching for all .db in all folders and get one list of dbs for sqlite-web
for db in $(find "$DATA_DIR" -type f -name "*.db"); do
  DBS="$DBS $db"
done

if [ -z "$DBS" ]; then
  echo "There is no database in $DATA_DIR"
  exit 1
fi

echo "Starting sqlite-web on $PORT for databases: $DBS"

# Launching sqlite-web
exec sqlite_web --host=0.0.0.0 --port="$PORT" $DBS
