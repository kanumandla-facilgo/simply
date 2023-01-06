PROCESS_NUM=$(ps -ef | grep "node server_production.js" | grep -v "grep" | grep -v "sh -c" | wc -l)
if [ $PROCESS_NUM -lt 1 ]; then
  echo "not running fine" `date` >> /var/app/textile/out.txt
  cd /var/app/textile
#  echo `nohup grunt` > /dev/null
  echo `export NODE_ENV=production`
  echo `node server_production.js >> /var/app/textile/out1.txt &`
else
  echo "running fine" `date`
fi

