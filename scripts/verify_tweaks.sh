#!/bin/bash
# Visual verification of all FINAL tweaks — runs server + screenshots in one session
cd /home/z/my-project

./node_modules/.bin/next dev -p 3000 > /tmp/verify-dev.log 2>&1 &
SRV=$!

# wait until server responds (first compile can take ~10s)
for i in $(seq 1 40); do
  code=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ 2>/dev/null)
  [ "$code" = "200" ] && break
  sleep 1
done
echo "server ready: $code"

B="agent-browser"
$B set viewport 1600 900
$B open http://localhost:3000
$B wait --load networkidle
$B wait 5000

echo "--- seg-rail position ---"
$B eval "const r=document.querySelector('.seg-rail');const s=getComputedStyle(r);JSON.stringify({left:s.left,right:s.right,dir:s.flexDirection})"

$B screenshot /tmp/v-desktop-hero.png

# scroll to About/Journey area
$B eval "document.getElementById('about').scrollIntoView({behavior:'instant'})"
$B wait 2500
$B screenshot /tmp/v-desktop-about.png

# scroll to footer
$B eval "document.getElementById('contact').scrollIntoView({behavior:'instant'})"
$B wait 3500
$B screenshot /tmp/v-desktop-footer.png
$B eval "window.scrollBy(0, 600)"
$B wait 2000
$B screenshot /tmp/v-desktop-footer2.png

# ---- mobile pass ----
$B set viewport 390 844
$B open http://localhost:3000
$B wait --load networkidle
$B wait 5000
$B screenshot /tmp/v-mobile-hero.png
$B eval "document.getElementById('contact').scrollIntoView({behavior:'instant'})"
$B wait 3500
$B screenshot /tmp/v-mobile-footer.png

echo "--- leftover text audit ---"
$B eval "JSON.stringify({has2025brand: /Portfolio © 2025|© 2025/.test(document.body.innerText), hasOpenTo: /open to opportunities/i.test(document.body.innerText), hasWelcome: /welcome/i.test(document.body.innerText), hasDevelopedBy: /DEVELOPED BY/i.test(document.body.innerText)})"

kill $SRV 2>/dev/null
echo "ALL SHOTS DONE"
