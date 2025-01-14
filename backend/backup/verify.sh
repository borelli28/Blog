#!/bin/bash

# Check if backup file provided
if [ -z "$1" ]; then
    echo "Usage: ./verify.sh <backup_file>"
    exit 1
fi

BACKUP_FILE="$1"

# Check if file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Backup file not found!"
    exit 1
fi

# Run SQLite integrity check
sqlite3 "$BACKUP_FILE" "PRAGMA integrity_check;" > /dev/null

if [ $? -eq 0 ]; then
    echo "Backup integrity verified"
    exit 0
else
    echo "Backup integrity check failed"
    exit 1
fi