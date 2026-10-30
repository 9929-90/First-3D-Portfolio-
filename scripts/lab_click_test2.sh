#!/bin/bash
# Corrected real click-through: popup URL parsed from tab list (arrow marks active).
set -u
AB="agent-browser"

MARK_JS='(() => {
  document.querySelectorAll("[data-vptest]").forEach(el => el.removeAttribute("data-vptest"));
  const vp = [...document.querySelectorAll("section#work .meta-panel")].find(el => getComputedStyle(el).visibility === "visible");
  if (vp) vp.setAttribute("data-vptest", "1");
  return "marked";
})()'
UNMARK_JS='(() => { document.querySelectorAll("[data-vptest]").forEach(el => el.removeAttribute("data-vptest")); return "ok"; })()'

BACK_TO_SITE() {
  # ensure the app tab is active; close any stray popup tabs
  local LIST LINE URL
  LIST=$($AB tab 2>/dev/null)
  echo "$LIST" | grep -oP '\[t\d+\]' | tr -d '[]' | tail -n +2 | while read -r T; do
    $AB tab "$T" > /dev/null 2>&1 && $AB tab close > /dev/null 2>&1
  done
  $AB tab t1 > /dev/null 2>&1
}

CLICK_AND_REPORT() { # $1 = data-cursor kind, $2 = label, $3 = station no
  local RES TABS NEWURL
  RES=$($AB find first "[data-vptest] a[data-cursor='$1']" click --timeout 5000 2>&1 | tail -1)
  if echo "$RES" | grep -qiE 'error|failed|timeout|no element|not found|unable'; then
    echo "Station $3 [$2]: not present (expected)"
    return
  fi
  sleep 3
  TABS=$($AB tab 2>/dev/null)
  NEWURL=$(echo "$TABS" | grep '^\s*→' | grep -oP 'https?://\S+' | head -1)
  if [ -n "$NEWURL" ] && [ "$NEWURL" != "http://localhost:3000/" ]; then
    echo "Station $3 [$2]: OPENS -> $NEWURL"
  else
    echo "Station $3 [$2]: click ok but popup URL unclear: $NEWURL"
  fi
  BACK_TO_SITE
  sleep 1
}

$AB open http://localhost:3000 > /dev/null 2>&1
$AB set viewport 1600 900
sleep 14

i=0
for P in 0.20 0.3207 0.4021 0.4836 0.5650 0.6464 0.7279 0.8093; do
  i=$((i+1))
  $AB eval "(() => { const w = document.querySelector('section#work > div'); const top = w.getBoundingClientRect().top + window.scrollY; const max = w.offsetHeight - window.innerHeight; window.scrollTo(0, top + $P * max); return 'ok'; })()" > /dev/null
  sleep 4.2
  $AB eval "$MARK_JS" > /dev/null
  CLICK_AND_REPORT "Live" "View project" "$i"
  CLICK_AND_REPORT "Code" "Source" "$i"
  $AB eval "$UNMARK_JS" > /dev/null
done

echo "════════ LEDGER — ALL 8 ROWS ════════"
$AB eval "(() => { const el = document.querySelector('#work-ledger'); el.scrollIntoView(); return 'ok'; })()" > /dev/null
sleep 3
$AB eval '(() => {
  const rows = [...document.querySelectorAll("#work-ledger article")];
  const out = rows.map(r => {
    const t = r.querySelector("h3") ? r.querySelector("h3").textContent : "?";
    const as = [...r.querySelectorAll("a")].map(a => a.textContent.trim().slice(0,10) + " => " + a.href);
    const priv = [...r.querySelectorAll("span")].some(s => /Private build/i.test(s.textContent));
    return t + " | " + (as.length ? as.join(" ; ") : (priv ? "Private build chip" : "NO ACTION"));
  });
  return out.join("\n");
})()'
