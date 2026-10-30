#!/bin/bash
cd /home/z/my-project
./node_modules/.bin/next dev -p 3000 > /tmp/verify-dev3.log 2>&1 &
SRV=$!
for i in $(seq 1 40); do
  code=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ 2>/dev/null)
  [ "$code" = "200" ] && break
  sleep 1
done
B="agent-browser"
$B set viewport 390 844
$B open http://localhost:3000
$B wait --load networkidle
$B wait 9000
$B screenshot /tmp/v3-mobile-hero.png
kill $SRV 2>/dev/null
echo "DONE"
