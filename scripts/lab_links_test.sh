#!/bin/bash
# Per-project link audit + real click-through for Project Hologram.
set -u
AB="agent-browser"

AUDIT_JS='(() => {
  const vp = [...document.querySelectorAll("section#work .meta-panel")].find(el => getComputedStyle(el).visibility === "visible");
  if (!vp) return JSON.stringify({none: true});
  const title = vp.querySelector("h3") ? vp.querySelector("h3").textContent : "?";
  const btns = [...vp.querySelectorAll("a")].map(a => {
    const r = a.getBoundingClientRect();
    const t = document.elementFromPoint(r.left + r.width/2, r.top + r.height/2);
    return { label: a.textContent.trim().slice(0, 13), href: a.href, target: a.target, rel: a.rel,
             hitOK: (a === t || a.contains(t)) };
  });
  const privateChip = [...vp.querySelectorAll("span")].some(s => /Private build/i.test(s.textContent));
  return JSON.stringify({ title: title, btns: btns, privateChip: privateChip });
})()'

MARK_JS='(() => {
  document.querySelectorAll("[data-vptest]").forEach(el => el.removeAttribute("data-vptest"));
  const vp = [...document.querySelectorAll("section#work .meta-panel")].find(el => getComputedStyle(el).visibility === "visible");
  if (vp) vp.setAttribute("data-vptest", "1");
  return "marked";
})()'

UNMARK_JS='(() => { document.querySelectorAll("[data-vptest]").forEach(el => el.removeAttribute("data-vptest")); return "ok"; })()'

echo "════════ JOURNEY PANELS — 8 STATIONS ════════"
$AB open http://localhost:3000 > /dev/null 2>&1
$AB set viewport 1600 900
sleep 14

i=0
for P in 0.20 0.3207 0.4021 0.4836 0.5650 0.6464 0.7279 0.8093; do
  i=$((i+1))
  $AB eval "(() => { const w = document.querySelector('section#work > div'); const top = w.getBoundingClientRect().top + window.scrollY; const max = w.offsetHeight - window.innerHeight; window.scrollTo(0, top + $P * max); return 'ok'; })()" > /dev/null
  sleep 4.5
  echo "--- Station $i ---"
  $AB eval "$AUDIT_JS"
  echo ""
done

echo "════════ REAL CLICK-THROUGH ════════"
$AB eval "window.scrollTo(0, 0)" > /dev/null
i=0
for P in 0.20 0.3207 0.4021 0.4836 0.5650 0.6464 0.7279 0.8093; do
  i=$((i+1))
  $AB eval "(() => { const w = document.querySelector('section#work > div'); const top = w.getBoundingClientRect().top + window.scrollY; const max = w.offsetHeight - window.innerHeight; window.scrollTo(0, top + $P * max); return 'ok'; })()" > /dev/null
  sleep 4
  $AB eval "$MARK_JS" > /dev/null
  for KIND in Live Code; do
    if [ "$KIND" = "Live" ]; then NAME="View project"; else NAME="Source"; fi
    RES=$($AB find first "[data-vptest] a[data-cursor='$KIND']" click --timeout 5000 2>&1 | tail -1)
    if echo "$RES" | grep -qiE 'error|failed|timeout|No element|not found'; then
      echo "Station $i [$NAME]: (button not present)"
    else
      sleep 3
      TABS=$($AB tab 2>&1 | grep -c '')
      URL=$($AB tab 2 > /dev/null 2>&1 && $AB get url 2>/dev/null)
      TITLE=$($AB tab 2 > /dev/null 2>&1 && $AB get title 2>/dev/null | head -c 60)
      if [ -n "$URL" ]; then
        echo "Station $i [$NAME]: OPENED -> $URL  (title: $TITLE)"
        $AB tab close > /dev/null 2>&1
        sleep 1
        $AB tab 1 > /dev/null 2>&1
      else
        echo "Station $i [$NAME]: click done but no new tab detected (tabs=$TABS) — $RES"
      fi
    fi
  done
  $AB eval "$UNMARK_JS" > /dev/null
done

echo "════════ LEDGER — ALL 8 ROWS ════════"
$AB eval "(() => { document.querySelector('#work-ledger').scrollIntoView(); return 'ok'; })()" > /dev/null
sleep 3
$AB eval '(() => {
  const rows = [...document.querySelectorAll("#work-ledger article")];
  const out = rows.map(r => {
    const t = r.querySelector("h3") ? r.querySelector("h3").textContent : "?";
    const as = [...r.querySelectorAll("a")].map(a => a.textContent.trim().slice(0,10) + "=>" + a.href);
    const priv = [...r.querySelectorAll("span")].some(s => /Private build/i.test(s.textContent));
    return t + " | " + (as.length ? as.join(" ; ") : (priv ? "Private build chip" : "NO ACTION"));
  });
  return out.join("\n");
})()'

echo "════════ EXTERNAL REACHABILITY ════════"
for U in \
  "https://9929-90.github.io/E-commerce-Analytics-Pipeline/" \
  "https://github.com/9929-90/E-commerce-Analytics-Pipeline" \
  "https://github.com/9929-90/UPI-Transactions-Monitor" \
  "https://aapnokaam.netlify.app" \
  "https://sqlpilott.netlify.app" \
  "https://rohitsfoundation.netlify.app" \
  "https://pinorabyrohit.netlify.app/"; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -L -A "Mozilla/5.0" "$U")
  echo "$CODE  $U"
done

echo "════════ CONSOLE / ERRORS ════════"
$AB errors 2>&1 | tail -5
$AB close
echo DONE
