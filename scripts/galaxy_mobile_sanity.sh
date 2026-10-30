#!/bin/bash
# Mobile galaxy check + rocket hero & lab (projects) sanity on the production build.
set -e
mkdir -p /tmp/shots/mob /tmp/shots/sec
AB="agent-browser"

$AB open http://localhost:3100
$AB set viewport 390 844
sleep 13  # mobile preloader is slower

for P in 0.25 0.65 1.00; do
  TAG=$(echo $P | tr -d '.')
  $AB eval "(() => { const w = document.querySelector('section#skills > div'); const top = w.getBoundingClientRect().top + window.scrollY; const max = w.offsetHeight - window.innerHeight; window.scrollTo(0, top + $P * max); return 'ok'; })()" > /dev/null
  sleep 4.5
  $AB screenshot /tmp/shots/mob/m_${TAG}.png
  echo "mobile p=$P"
done

# rocket hero — page top
$AB eval "window.scrollTo(0, 0)" > /dev/null
sleep 4
$AB screenshot /tmp/shots/sec/rocket.png
echo "rocket ok"

# lab / projects section — centre of its sticky wrapper
$AB eval "(() => { const w = document.querySelector('section#work > div'); const top = w.getBoundingClientRect().top + window.scrollY; const max = w.offsetHeight - window.innerHeight; window.scrollTo(0, top + 0.45 * max); return 'ok'; })()" > /dev/null
sleep 4.5
$AB screenshot /tmp/shots/sec/lab.png
echo "lab ok"

$AB close
echo DONE
