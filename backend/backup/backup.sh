#!/bin/bash

# Load environment variables
source /backend/.env

# Configuration
BACKUP_DIR="/backend/backups"
DB_PATH="/backend/blog.db"
UPLOADS_DIR="/backend/uploads"
DATE=$(date +%Y%m%d)
MONTH=$(date +%Y%m)
REMOTE_SERVER="$BACKUP_SERVER_USER@$BACKUP_SERVER_HOST"
REMOTE_PATH="$BACKUP_SERVER_PATH"

# Log start
echo "$(date): Starting backup process" >> backup.log

# Create backup directories
mkdir -p "$BACKUP_DIR/daily"
mkdir -p "$BACKUP_DIR/monthly"

# Database backup
sqlite3 "$DB_PATH" ".backup '$BACKUP_DIR/daily/blog_$DATE.db'"

# Run verification
./verify.sh "$BACKUP_DIR/daily/blog_$DATE.db"
if [ $? -ne 0 ]; then
    echo "$(date): Backup verification failed!" >> backup.log
    exit 1
fi

# Compress and encrypt database and uploads
tar -czf - "$BACKUP_DIR/daily/blog_$DATE.db" "$UPLOADS_DIR" | \
gpg --encrypt --recipient "$BACKUP_GPG_KEY" \
    --trust-model always \
    --output "$BACKUP_DIR/daily/backup_$DATE.tar.gz.gpg"

# Monthly backup (modified for encrypted file)
if [ "$(date +%d)" = "01" ]; then
    cp "$BACKUP_DIR/daily/backup_$DATE.tar.gz.gpg" \
       "$BACKUP_DIR/monthly/backup_$MONTH.tar.gz.gpg"
fi

# Cleanup old backups
# Keep last 7 daily backups
find "$BACKUP_DIR/daily" -type f -mtime +7 -delete

# Keep last 3 monthly backups
cd "$BACKUP_DIR/monthly" && ls -t | tail -n +4 | xargs -r rm

# Transfer to backup server
rsync -avz --delete "$BACKUP_DIR/" "$REMOTE_SERVER:$REMOTE_PATH"
if [ $? -ne 0 ]; then
    echo "$(date): Rsync transfer failed!" >> backup.log
    exit 1
fi

# Cleanup temporary database backup
rm "$BACKUP_DIR/daily/blog_$DATE.db"

echo "$(date): Backup completed successfully" >> backup.log