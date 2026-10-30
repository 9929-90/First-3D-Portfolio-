#!/bin/bash
cd /home/z/my-project
./node_modules/.bin/next dev -p 3000 > /tmp/verify-dev2.log 2>&1 &
SRV=$!
for i in $(seq 1 40); do
  code=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ 2>/dev/null)
  [ "$code" = "200" ] && break
  sleep 1
done
echo "server ready: $code"

B="agent-browser"
$B set viewport 390 844
$B open http://localhost:3000
$B wait --load networkidle
$B wait 5000
$B screenshot /tmp/v2-mobile-hero.png

# open hamburger menu
$B eval "document.querySelector('button[aria-label=\"Toggle menu\"]').click()"
$B wait 1200
$B screenshot /tmp/v2-mobile-menu.png
$B eval "document.querySelector('button[aria-label=\"Toggle menu\"]').click()"
$B wait 800

# scroll deep to the credit area
$B eval "document.getElementById('contact').scrollIntoView({behavior:'instant'})"
$B wait 2500
$B eval "window.scrollBy(0, 1200)"
$B wait 2500
$B screenshot /tmp/v2-mobile-credit.png

kill $SRV 2>/dev/null
echo "DONE"
