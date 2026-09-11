#!/usr/bin/env bash
# ortakbul.org — tek komutla tüm stack'i ayağa kaldırır.
# Kullanım:  ./start.sh          (başlat)
#            ./start.sh status   (durum)
#            ./start.sh stop      (durdur)
#            ./start.sh restart   (yeniden başlat)
#            ./start.sh logs [api|web|pg]  (log takip)
set -uo pipefail

# ---- Sabitler (ortama göre) --------------------------------------------------
NODE_BIN="$HOME/opt/node-v20.20.2-linux-x64/bin"
PG_BIN="$HOME/opt/pg/bin"
PGDATA="$HOME/opt/pgdata"
PGPORT=5432
API_DIR="$HOME/LabAI/ortakbul/apps/api"
WEB_DIR="$HOME/LabAI/ortakbul/apps/web"
ROOT="$HOME/LabAI/ortakbul"
API_PORT=4000
WEB_PORT=3100
LOGDIR="$HOME/opt"
API_LOG="$LOGDIR/apilog.txt"
WEB_LOG="$LOGDIR/weblog.txt"
PG_LOG="$LOGDIR/pglog.txt"

export PATH="$NODE_BIN:$PG_BIN:$PATH"

# ---- Renkler -----------------------------------------------------------------
g(){ printf '\033[32m%s\033[0m\n' "$1"; }
y(){ printf '\033[33m%s\033[0m\n' "$1"; }
r(){ printf '\033[31m%s\033[0m\n' "$1"; }

# ---- Yardımcılar -------------------------------------------------------------
port_up(){ (ss -tlnp 2>/dev/null || netstat -tlnp 2>/dev/null) | grep -q ":$1[[:space:]]"; }
http_ok(){ curl -s -m 5 -o /dev/null -w "%{http_code}" "$1" 2>/dev/null; }

# ---- Postgres ----------------------------------------------------------------
start_pg(){
  if pg_ctl -D "$PGDATA" status >/dev/null 2>&1; then
    g "✓ PostgreSQL zaten çalışıyor (port $PGPORT)"
  else
    y "→ PostgreSQL başlatılıyor..."
    pg_ctl -D "$PGDATA" -o "-p $PGPORT -k /tmp" -l "$PG_LOG" start >/dev/null 2>&1
    sleep 3
    if pg_ctl -D "$PGDATA" status >/dev/null 2>&1; then
      g "✓ PostgreSQL başladı (port $PGPORT)"
    else
      r "✗ PostgreSQL başlatılamadı — bkz: $PG_LOG"; return 1
    fi
  fi
}

# ---- API ---------------------------------------------------------------------
start_api(){
  if port_up "$API_PORT"; then
    g "✓ API zaten çalışıyor (port $API_PORT)"
    return
  fi
  if [ ! -f "$API_DIR/dist/main.js" ]; then
    y "→ API derlenmemiş, nest build çalıştırılıyor..."
    ( cd "$ROOT" && pnpm --filter api build ) || { r "✗ API build başarısız"; return 1; }
  fi
  y "→ API başlatılıyor..."
  ( cd "$API_DIR" && nohup node dist/main.js > "$API_LOG" 2>&1 & )
  for i in $(seq 1 15); do
    sleep 1
    [ "$(http_ok http://127.0.0.1:$API_PORT/api/meta)" = "200" ] && { g "✓ API hazır → http://localhost:$API_PORT/api"; return; }
  done
  r "✗ API 15 sn içinde yanıt vermedi — bkz: $API_LOG"; return 1
}

# ---- Web ---------------------------------------------------------------------
start_web(){
  if port_up "$WEB_PORT"; then
    g "✓ Web zaten çalışıyor (port $WEB_PORT)"
    return
  fi
  [ -f "$WEB_DIR/.env.local" ] || cp "$WEB_DIR/.env.example" "$WEB_DIR/.env.local"
  y "→ Web (Next.js dev) başlatılıyor..."
  ( cd "$WEB_DIR" && nohup node "$ROOT/node_modules/next/dist/bin/next" dev -p "$WEB_PORT" -H 127.0.0.1 > "$WEB_LOG" 2>&1 & )
  for i in $(seq 1 30); do
    sleep 1
    [ "$(http_ok http://127.0.0.1:$WEB_PORT/)" = "200" ] && { g "✓ Web hazır → http://localhost:$WEB_PORT"; return; }
  done
  r "✗ Web 30 sn içinde yanıt vermedi — bkz: $WEB_LOG"; return 1
}

# ---- Durdur ------------------------------------------------------------------
stop_all(){
  y "→ Web durduruluyor..."
  pkill -f "next/dist/bin/next dev -p $WEB_PORT" 2>/dev/null && g "✓ Web durdu" || y "  (çalışmıyordu)"
  y "→ API durduruluyor..."
  pkill -f "$API_DIR/dist/main.js" 2>/dev/null || pkill -f "node dist/main.js" 2>/dev/null
  g "✓ API durdu"
  y "→ PostgreSQL durduruluyor..."
  pg_ctl -D "$PGDATA" stop >/dev/null 2>&1 && g "✓ PostgreSQL durdu" || y "  (çalışmıyordu)"
}

# ---- Durum -------------------------------------------------------------------
status(){
  echo "─────────── ortakbul durum ───────────"
  pg_ctl -D "$PGDATA" status >/dev/null 2>&1 && g "● PostgreSQL  çalışıyor (5432)" || r "○ PostgreSQL  kapalı"
  [ "$(http_ok http://127.0.0.1:$API_PORT/api/meta)" = "200" ] && g "● API         çalışıyor  → http://localhost:$API_PORT/api" || r "○ API         kapalı"
  [ "$(http_ok http://127.0.0.1:$WEB_PORT/)" = "200" ] && g "● Web         çalışıyor  → http://localhost:$WEB_PORT" || r "○ Web         kapalı"
  echo "──────────────────────────────────────"
}

# ---- Ana akış ----------------------------------------------------------------
case "${1:-start}" in
  start)
    start_pg && start_api && start_web
    echo
    status
    echo
    g "🚀 Tarayıcıda aç:  http://localhost:$WEB_PORT"
    echo   "   Admin panel:    http://localhost:$WEB_PORT/y-panel-8f3a  (admin@ortakbul.org / Admin!2026)"
    ;;
  stop)    stop_all ;;
  restart) stop_all; sleep 2; "$0" start ;;
  status)  status ;;
  logs)
    case "${2:-}" in
      api) tail -f "$API_LOG" ;;
      web) tail -f "$WEB_LOG" ;;
      pg)  tail -f "$PG_LOG" ;;
      *)   echo "Kullanım: $0 logs [api|web|pg]" ;;
    esac
    ;;
  *) echo "Kullanım: $0 [start|stop|restart|status|logs]" ;;
esac
