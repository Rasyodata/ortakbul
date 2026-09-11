#!/usr/bin/env bash
# ortakbul.org — siteyi internete public bir linkle aç (Cloudflare Tunnel).
# Kullanım: ./share.sh        → stack'i başlatır + tünel açar, public URL'yi yazar
#           ./share.sh stop   → tüneli kapatır (site local'de kalmaya devam eder)
set -uo pipefail
NODE_BIN="$HOME/opt/node-v20.20.2-linux-x64/bin"
PG_BIN="$HOME/opt/pg/bin"
CF="$HOME/opt/bin/cloudflared"
TLOG="$HOME/opt/tunnel.log"
WEB_PORT=3100
export PATH="$NODE_BIN:$PG_BIN:$PATH"
g(){ printf '\033[32m%s\033[0m\n' "$1"; }; y(){ printf '\033[33m%s\033[0m\n' "$1"; }; r(){ printf '\033[31m%s\033[0m\n' "$1"; }

if [ "${1:-}" = "stop" ]; then
  pkill -f "cloudflared tunnel" 2>/dev/null && g "✓ Tünel kapatıldı." || y "Tünel zaten kapalı."
  exit 0
fi

# 1) Stack ayakta mı? Değilse başlat.
DIR="$(cd "$(dirname "$0")" && pwd)"
if [ "$(curl -s -m4 -o /dev/null -w '%{http_code}' http://127.0.0.1:$WEB_PORT/ 2>/dev/null)" != "200" ]; then
  y "→ Site kapalı, başlatılıyor..."
  "$DIR/start.sh" start >/dev/null 2>&1
  for i in $(seq 1 30); do
    [ "$(curl -s -m4 -o /dev/null -w '%{http_code}' http://127.0.0.1:$WEB_PORT/ 2>/dev/null)" = "200" ] && break
    sleep 1
  done
fi
[ "$(curl -s -m4 -o /dev/null -w '%{http_code}' http://127.0.0.1:$WEB_PORT/ 2>/dev/null)" = "200" ] \
  && g "✓ Site local'de çalışıyor (:$WEB_PORT)" || { r "✗ Site başlatılamadı — önce ./start.sh çalıştır."; exit 1; }

# 2) Eski tüneli kapat, yenisini aç.
pkill -f "cloudflared tunnel" 2>/dev/null; sleep 1
rm -f "$TLOG"
y "→ Cloudflare tüneli açılıyor..."
setsid bash -c "exec '$CF' tunnel --url http://localhost:$WEB_PORT --no-autoupdate > '$TLOG' 2>&1" </dev/null &
disown

# 3) URL'yi bekle ve yaz.
URL=""
for i in $(seq 1 60); do
  URL=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$TLOG" 2>/dev/null | head -1)
  [ -n "$URL" ] && break; sleep 1
done
echo
if [ -n "$URL" ]; then
  g "════════════════════════════════════════════════════════════"
  g "  🔗 PUBLIC LİNK (arkadaşına gönder):"
  g "     $URL"
  g "════════════════════════════════════════════════════════════"
  echo "  Admin panel:  $URL/y-panel-8f3a  (admin@ortakbul.org / Admin!2026)"
  echo
  y "  NOT: Bu link, bu bilgisayar açık ve bu betik çalışırken geçerlidir."
  y "       Kod güncellemelerin canlı yansır (yenile yeter). Kapatmak: ./share.sh stop"
else
  r "✗ Tünel URL'si alınamadı — bkz: $TLOG"; exit 1
fi
