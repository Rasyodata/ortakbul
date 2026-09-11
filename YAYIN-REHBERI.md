# ortakbul.org — Yayına Alma Rehberi

## ⚠️ Önce önemli gerçek
Bu site **iki sunucu bileşeni** + **veritabanı** ister:
- **Next.js (web)** — Node.js sunucusu
- **NestJS (API)** — Node.js sunucusu
- **PostgreSQL** — veritabanı

**türkticaret.net'in standart (paylaşımlı PHP) hosting'i bunları çalıştıramaz** (Node.js yok, PostgreSQL yok — sadece PHP/MySQL + statik dosya). Yani proje dosyalarını FTP ile atmak **çalışmaz**.

İki gerçek yol var 👇

---

## ✅ YOL 1 — Önerilen: Render'a kur, ortakbul.org'u ona yönlendir (tamamen ücretsiz)
türkticaret.net'i sadece **domain** için kullanırsın; site Render'da çalışır.

1. **Kodu GitHub'a koy** (Render kodu oradan çeker). Repo: `ortakbul`.
2. **Neon.tech**'ten ücretsiz PostgreSQL al → `DATABASE_URL`'i kopyala (kalıcı ücretsiz).
3. **render.com**'a ücretsiz kaydol → "New +" → "Blueprint" → GitHub repoyu seç. Depodaki `render.yaml` iki servisi (api + web) otomatik kurar.
4. Render'da env değişkenlerini gir (`apps/api/.env.production.example`'daki gibi): `DATABASE_URL` (Neon'dan), `JWT_*` (rastgele), `WEB_ORIGIN=https://ortakbul.org`.
5. İlk deploy sonrası veritabanını hazırla (Render Shell'de):
   ```
   pnpm --filter api exec prisma db push
   pnpm --filter api exec prisma db seed
   ```
6. **DNS yönlendirmesi (türkticaret.net panelinde):**
   - `A` veya `CNAME` kaydını Render'ın verdiği adrese yönlendir (Render → Settings → Custom Domain → `ortakbul.org` ekle, sana hedefi söyler).
   - `www` için de `CNAME` → aynı hedef.
   - SSL sertifikası Render tarafından otomatik (Let's Encrypt).

Sonuç: **https://ortakbul.org** kalıcı, bilgisayarın kapalıyken de çalışan gerçek site.

---

## 🔶 YOL 2 — türkticaret.net hosting'inde Node.js DESTEĞİ varsa
(Plesk/cPanel'de "Node.js" uygulaması kurabiliyorsan. PostgreSQL yine dışarıdan gerekir — Neon ücretsiz.)

1. **Neon.tech**'ten ücretsiz PostgreSQL → `DATABASE_URL`.
2. Kodu sunucuya yükle (Git veya FTP). Node 20+ gerekli.
3. Kurulum (SSH):
   ```
   corepack enable && pnpm install
   cp apps/api/.env.production.example apps/api/.env   # değerleri doldur
   pnpm --filter api build
   pnpm --filter api exec prisma db push
   pnpm --filter api exec prisma db seed
   pnpm --filter web build
   ```
4. İki Node uygulaması tanımla (Plesk "Node.js"):
   - **API**: başlangıç dosyası `apps/api/dist/main.js`, port 4000.
   - **WEB**: `apps/web` → `pnpm --filter web start` (port'u Plesk verir).
5. `apps/web/.env.local` → `NEXT_PUBLIC_API_URL="https://ortakbul.org/api"` (veya API alt alanı).
6. Reverse proxy: `ortakbul.org` → web (Next), `ortakbul.org/api` → API (4000). (Plesk'te Apache/nginx yönlendirme kuralı.)
7. `apps/api/.env` → `WEB_ORIGIN="https://ortakbul.org"`.

---

## 🔑 Her iki yolda da unutma
- **JWT gizli anahtarlarını** rastgele değerlerle değiştir (`openssl rand -hex 32`).
- **SEED_ADMIN_PASSWORD**'ü güçlü yap. Admin panel: `https://ortakbul.org/y-panel-8f3a`.
- Mail/SMS/iyzico anahtarları gelince `.env`'e ekle (boşsa güvenli dev-mock çalışır).
- Production web build'i `pnpm.overrides` (kök package.json) sayesinde geçer — `pnpm install` şart.

---

## Özet karar
- **En kolay + kalıcı + ücretsiz:** YOL 1 (Render + domain yönlendirme).
- türkticaret.net paketinde **Node.js varsa** ve illa orada olsun istiyorsan: YOL 2.
- Paketin **sadece PHP/paylaşımlı** ise: uygulama orada çalışmaz; domaini YOL 1'e yönlendir.
