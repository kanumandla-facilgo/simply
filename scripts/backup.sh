today=`date +%Y%m%d%H%M%S`
find /home/service/apps/textile/backups/* -mtime 2 -exec rm {} \;
mysqldump -u$TEXTILE_DB_USER -p$TEXTILE_DB_PASS textile --routines --triggers --no-tablespaces | sed -e 's/DEFINER[ ]*=[ ]*[^*]*PROCEDURE/PROCEDURE/' | sed -e 's/DEFINER[ ]*=[ ]*[^*]*FUNCTION/FUNCTION/' > /home/service/apps/textile/backups/$today.sql
rsync -avz --ignore-existing --recursive --delete -e "ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" --progress /home/service/apps/textile/backups/ root@138.68.249.74:/var/app/backups/textile/
