#!/usr/bin/env bash
# ortakbul.org — KALICI tünel + servis bekçisi.
# Servisler (pg/api/web) veya Cloudflare tüneli düşerse otomatik yeniden kaldırır.
# Güncel public URL'yi daima ~/LabAI/ortakbul/CANLI-LINK.txt dosyasına yazar.
# Başlat:  nohup ~/LabAI/ortakbul/tunnel-keep.sh >> ~/opt/watchdog.log 2>&1 &
# Durdur:  ~/LabAI/ortakbul/tunnel-keep.sh stop
export PATH="$HOME/opt/node-v20.20.2-linux-x64/bin:$HOME/opt/pg/bin:$PATH"
CF="$HOME/opt/bin/cloudflared"
TLOG="$HOME/opt/tunnel.log"
LINKF="$HOME/LabAI/ortakbul/CANLI-LINK.txt"
PIDF="$HOME/opt/watchdog.pid"
DIR="$HOME/LabAI/ortakbul"
WEB=3100

if [ "${1:-}" = "stop" ]; then
  [ -f "$PIDF" ] && kill "$(cat "$PIDF")" 2>/dev/null
  pkill -f "tunnel-keep.sh" 2>/dev/null
  pkill -x cloudflared 2>/dev/null
  echo "Bekçi + tünel durduruldu."
  exit 0
fi

cur_url(){ grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$TLOG" 2>/dev/null | tail -1; }

write_link(){
  local url="$1"; [ -z "$url" ] && return
  {
    echo "$url"
    echo "Admin: $url/y-panel-8f3a  (admin@ortakbul.org / Admin!2026)"
    echo "Son güncelleme: $(date '+%Y-%m-%d %H:%M:%S')"
  } > "$LINKF"
  echo "[$(date '+%H:%M:%S')] Link: $url"
}

start_tunnel(){
  pkill -x cloudflared 2>/dev/null
  : > "$TLOG"
  setsid bash -c "exec '$CF' tunnel --url http://localhost:$WEB --no-autoupdate >> '$TLOG' 2>&1" </dev/null &
  disown
  local url="" i
  for i in $(seq 1 90); do
    url="$(cur_url)"; [ -n "$url" ] && break; sleep 1
  done
  [ -n "$url" ] && write_link "$url" || echo "[$(date '+%H:%M:%S')] UYARI: tünel URL alınamadı"
}

echo $$ > "$PIDF"
echo "[$(date '+%H:%M:%S')] Bekçi başladı (pid $$)"

# Servisler ayakta mı?
[ "$(curl -s -m4 -o /dev/null -w '%{http_code}' http://127.0.0.1:$WEB/ 2>/dev/null)" = "200" ] || "$DIR/start.sh" start >/dev/null 2>&1

# Sağlıklı tünel zaten varsa ÖLDÜRME, benimse (yeniden başlatınca URL değişmesin).
if pgrep -x cloudflared >/dev/null && [ -n "$(cur_url)" ]; then
  write_link "$(cur_url)"
else
  start_tunnel
fi

# Bekçi döngüsü — her 20 sn kontrol
while true; do
  sleep 20
  # 1) Web/API ayakta mı?
  if [ "$(curl -s -m5 -o /dev/null -w '%{http_code}' http://127.0.0.1:$WEB/ 2>/dev/null)" != "200" ]; then
    echo "[$(date '+%H:%M:%S')] Servis düşmüş — yeniden başlatılıyor"
    "$DIR/start.sh" start >/dev/null 2>&1
  fi
  # 2) Tünel ayakta mı?
  if ! pgrep -x cloudflared >/dev/null; then
    echo "[$(date '+%H:%M:%S')] Tünel düşmüş — yeniden açılıyor"
    start_tunnel
  else
    # Ayakta — güncel URL'yi dosyaya senkronla (yavaş yakalanmışsa kendini düzeltir)
    u="$(cur_url)"
    if [ -n "$u" ] && ! grep -qF "$u" "$LINKF" 2>/dev/null; then write_link "$u"; fi
  fi
done
