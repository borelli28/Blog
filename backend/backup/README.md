# Blog Backup System

## Daily Backup Schedule
# Runs every day at 2 AM
0 2 * * * /blog/backend/backup/backup.sh >> /blog/backend/backup/backup.log 2>&1

## To install cron job:
# 1. Open crontab editor:
#    crontab -e
#
# 2. Add the above line
#
# 3. Save and exit
#
# 4. Verify installation:
#    crontab -l

## Backup Locations:
# - Daily backups: /blog/backend/backups/daily
# - Monthly backups: /blog/backend/backups/monthly

## Retention Policy:
# - Daily backups: 7 days
# - Monthly backups: 3 months