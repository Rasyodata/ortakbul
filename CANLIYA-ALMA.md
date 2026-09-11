# ortakbul.org — Canlıya Alma Runbook (web + API + DB + mobil)

Domain türkticaret'te kalır; DNS ile aşağıdaki servislere yönlendirilir.
Kod **deploy'a hazır** (production build geçiyor, render.yaml + env şablonları hazır).

## A. Mimari (kararlaştırılan)
| Parça | Nerede | Adres |
|---|---|---|
| Veritabanı (PostgreSQL) | **Neon.tech** (ücretsiz, kalıcı) | connection string |
| API (NestJS) | **Render** (ücretsiz/ücretli) | `api.ortakbul.org` |
| Web (Next.js) | **Render** (veya Vercel) | `ortakbul.org` + `www` |
| Mobil (Expo) | **App Store + Google Play** | API'yi `api.ortakbul.org`'dan çağırır |

> Not: Ücretsiz Render web'i 15 dk hareketsizlikte uyur (ilk açılış ~30 sn). Kesintisiz istiyorsan Render'ın ~$7/ay "Starter" planı. Neon ücretsiz kalıcı.

## B. Web + API + DB (Render Blueprint)
1. **GitHub**: bu repoyu (`ortakbul`) GitHub'a push et.
2. **Neon.tech** → ücretsiz proje → PostgreSQL → **connection string**'i kopyala.
3. **render.com** → New + → **Blueprint** → repoyu seç (`render.yaml` otomatik okunur: api + web).
4. Render env değişkenleri (api servisi):
   - `DATABASE_URL` = Neon'dan (render.yaml'daki ücretsiz DB yerine Neon önerilir — kalıcı)
   - `WEB_ORIGIN` = `https://ortakbul.org,https://www.ortakbul.org`
   - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` = otomatik (generateValue)
   - `SEED_ADMIN_PASSWORD` = güçlü bir şifre
5. İlk deploy sonrası (api servisi → Shell):
   ```
   pnpm --filter @ortakbul/api exec prisma db push
   pnpm --filter @ortakbul/api exec prisma db seed
   ```

## C. türkticaret.net DNS kayıtları
Panelde **Alan Adı / DNS Yönetimi** → şu kayıtları ekle (Render sana tam hedefi Custom Domain ekranında verir):
| Kayıt | Ad | Hedef |
|---|---|---|
| CNAME | `www` | Render web servisinin adresi (`ortakbul-web.onrender.com`) |
| A / ALIAS | `@` (ortakbul.org) | Render'ın verdiği IP/ALIAS |
| CNAME | `api` | Render api servisinin adresi (`ortakbul-api.onrender.com`) |

Render'da her servise **Custom Domain** ekle (`ortakbul.org`, `www.ortakbul.org`, `api.ortakbul.org`) → SSL otomatik gelir (Let's Encrypt).

## D. Mobil (iOS + Android)
Mobil uygulama API'yi `https://api.ortakbul.org/api`'den çağıracak şekilde ayarlandı (`apps/mobile/app.json`).
1. **EAS** kurulumu: `npm i -g eas-cli` → `eas login` (ücretsiz Expo hesabı).
2. `cd apps/mobile && eas build:configure`
3. **Android**: `eas build -p android` → `.aab` → **Google Play Console** ($25 tek sefer) → yükle.
4. **iOS**: `eas build -p ios` → **Apple Developer** ($99/yıl) → App Store Connect → yükle.
5. (Test için hızlı: `eas build -p android --profile preview` → APK linki, hesap gerekmez.)

## E. Maliyet özeti
- **Tamamen ücretsiz başlangıç**: Neon (DB) + Render free (api+web) + Android APK (test). iOS/store hariç 0 ₺.
- **Profesyonel**: Render Starter ~$7/ay/servis (uyku yok) + Apple $99/yıl + Google $25 tek sefer.

## F. Senden gereken hesaplar (ben senin adına giriş yapamam)
- [ ] GitHub (kodu koymak)
- [ ] Neon.tech (ücretsiz DB)
- [ ] Render.com (api + web)
- [ ] türkticaret paneli (DNS kayıtları — sende)
- [ ] (Mobil için) Expo + Google Play + Apple Developer

Bu hesaplara girişleri sen yaparsın; her adımda ne tıklayacağını birebir söylerim.
Deploy'a hazır dosyalar: `render.yaml`, `YAYIN-REHBERI.md`, `apps/api/.env.production.example`, `apps/web/.env.production.example`.
