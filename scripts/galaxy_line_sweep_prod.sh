#!/bin/bash
# Visual sweep of the Skill Galaxy at every scroll position after line removal.
set -e
mkdir -p /tmp/shots/prod
AB="agent-browser"

$AB open http://localhost:3100
$AB set viewport 1600 900
sleep 13   # preloader + first paint

for P in 0 0.12 0.25 0.35 0.50 0.65 0.80 0.92 1.00; do
  TAG=$(echo $P | tr -d '.')
  $AB eval "(() => { const w = document.querySelector('section#skills > div'); const top = w.getBoundingClientRect().top + window.scrollY; const max = w.offsetHeight - window.innerHeight; window.scrollTo(0, top + $P * max); return 'ok ' + $P; })()" > /dev/null
  sleep 4.5   # let GSAP scrub + rig lerp settle
  $AB screenshot /tmp/shots/prod/d_${TAG}.png
  echo "captured p=$P"
done

echo "=== CONSOLE ==="
$AB console 2>&1 | tail -30
echo "=== ERRORS ==="
$AB errors 2>&1 | tail -30
$AB close
echo DONE
