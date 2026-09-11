# ortakbul.org — Production Kod Tabanı

Ortak arayanla ortak olmak isteyeni buluşturan platform. Web + mobil + yönetim paneli, tek monorepo.

> Bu, demonun (`../ortakbul-demo`) production'a taşınmış halidir. Bu turda **backend omurgası** kuruldu: veri modeli, kimlik doğrulama, RBAC güvenlik, ilan onay akışı ve yönetici işlemleri. Web/mobil sonraki turlarda.

## Mimari

```
ortakbul/
├─ apps/
│  ├─ api/      NestJS + Prisma + PostgreSQL  (REST API) ✅
│  ├─ web/      Next.js 14 (App Router)        (web arayüzü) ✅
│  └─ mobile/   Expo / React Native            (sonraki tur)
├─ packages/
│  └─ shared/   Ortak domain sabitleri (ülkeler, paketler, diller...)
└─ docker-compose.yml   PostgreSQL + Redis
```

**Stack:** NestJS (modüler, RBAC guard'lı), PostgreSQL + Prisma (tip güvenli ORM), JWT (access+refresh) auth, argon2 şifreleme, helmet + rate-limit, ülke/vergi/fatura, mail+SMS doğrulama altyapısı, ödeme sağlayıcı soyutlaması (iyzico/PayTR/Stripe), KVKK denetim logu.

## Kurulum (senin makinende)

Gerekli: **Node.js 20+**, **pnpm 9+**, **Docker** (Postgres/Redis için — ya da yerel Postgres).

```bash
# 1) Node & pnpm (yoksa)
#    Node: https://nodejs.org  |  pnpm: npm i -g pnpm

cd ortakbul

# 2) Ortam dosyaları
cp .env.example .env
cp apps/api/.env.example apps/api/.env

# 3) Bağımlılıklar
pnpm install

# 4) Veritabanı (Docker ile)
pnpm db:up                    # postgres + redis ayağa kalkar

# 5) Şema + migration + seed
pnpm prisma:migrate           # tabloları oluşturur
pnpm prisma:seed              # izinler, roller, süper admin, örnek veri

# 6) API'yi başlat
pnpm dev:api                  # http://localhost:4000/api

# 7) Web arayüzünü başlat (ayrı terminal)
cp apps/web/.env.example apps/web/.env.local
pnpm dev:web                  # http://localhost:3000
```

Seed sonrası **süper admin**: `admin@ortakbul.org` / `Admin!2026` (.env'den değiştir).

## Öne çıkan API uçları

| Yöntem | Uç | Açıklama | Yetki |
|---|---|---|---|
| POST | `/api/auth/register` | Üye ol (PENDING; ilan verebilir) | herkese açık |
| POST | `/api/auth/login` | Giriş | herkese açık |
| POST | `/api/auth/verify` | Mail/SMS kod doğrula | üye |
| POST | `/api/auth/refresh` | Token yenile | herkese açık |
| GET | `/api/auth/me` | Profilim | üye |
| GET | `/api/listings?type=IDEA` | İlanları listele (onaylı) | herkese açık |
| GET | `/api/listings/:id` | İlan detayı | herkese açık |
| POST | `/api/listings` | İlan ver (PENDING) | üye |
| GET | `/api/listings/mine` | İlanlarım | üye |
| GET | `/api/listings/assigned` | Bana atanan ilanlar | danışman |
| POST | `/api/admin/listings` | **Üye adına ilan** (ücretli paket ücretsiz) | `listing.write` |
| POST | `/api/admin/listings/:id/approve` | İlan onayla | `listing.approve` |
| POST | `/api/admin/listings/:id/assign` | Danışman/denetçi ata | `assignment.manage` |
| POST | `/api/admin/users/member` | Üye oluştur | `user.write` |
| POST | `/api/admin/users/consultant` | Danışman oluştur | `user.write` |
| POST | `/api/admin/users/:id/approve` | Üyelik onayla | `user.approve` |
| POST | `/api/admin/users/:id/roles` | Rol ata (RBAC) | `role.manage` |

## Güvenlik & yetki (RBAC)

- Her istek `JwtAuthGuard`'tan geçer (`@Public()` hariç).
- Yönetici uçları `@RequirePermissions(...)` + `PermissionsGuard` ile korunur.
- Roller ve izinler veritabanında (`Role`, `Permission`, `RolePermission`) — admin panelinden düzenlenebilir (izin matrisi: Görme / Yazma / Onaylama / Ödeme).
- Kritik işlemler `AuditLog`'a yazılır (kim, ne, ne zaman).
- Admin paneli yolu `.env` içindeki `ADMIN_PATH` ile gizlenir.

## Ek uçlar (tam-özellikli backend)

| Yöntem | Uç | Açıklama |
|---|---|---|
| POST | `/api/auth/social` | Sosyal giriş (Google/Apple/FB/IG/TikTok) |
| GET | `/api/auth/social/:provider/url` | OAuth yetkilendirme linki |
| GET | `/api/consultants` · `/:userId` | Danışman dizini / detay |
| POST | `/api/consultants/apply` | Danışman başvurusu |
| POST | `/api/consultants/:userId/questions` | Danışmana soru |
| GET | `/api/consultants/questions/mine` | Danışman: bana gelen sorular |
| POST | `/api/admin/consultants/:userId/approve` | Danışman onayı (`consultant.approve`) |
| GET | `/api/partners` | Partner firmalar |
| GET | `/api/agent/reports` · POST `/api/admin/agent/run` | AI ajan raporları / tarama (`agent.run`) |
| GET | `/api/i18n/:locale` · PUT `/api/admin/i18n` | Çeviriler / düzenleme (`i18n.manage`) |
| GET | `/api/fx` | Döviz kuru (USD dönüşümü) |
| POST | `/api/consent` | KVKK çerez onayı kaydı |
| GET | `/api/meta` | Ana sayfa istatistikleri |
| POST | `/api/payments/checkout` | Paket satın alma başlat |
| POST | `/api/payments/webhook/:provider` | Ödeme webhook (iyzico/paytr/stripe) |
| GET | `/api/admin/payments` | Ödemeler (`payment.read`) |
| GET | `/api/admin/audit` | Denetim logları (`audit.read`) |

## Kapsam durumu

**Backend TAMAMLANDI (✅):** veri modeli (20+ tablo) · auth (kayıt/giriş/refresh/mail+SMS doğrulama/**sosyal OAuth soyutlaması**) · RBAC (rol/izin matrisi) · ilan onay akışı (tüm ilanlar+üyelikler admin onayı) · üye adına ilan + ücretsiz paket · danışman/denetçi atama · danışman başvuru+onay+soru-cevap · yönetici üye/danışman oluşturma · **ödeme (iyzico/PayTR/Stripe soyutlaması + webhook + paket yükseltme)** · partner firmalar · AI ajan raporları · **i18n (DB tabanlı çeviri)** · döviz · KVKK çerez onayı + denetim logu · seed.

**Sırada:** Next.js web (demo tasarımını gerçek API'ye bağlama, 9 dil+RTL, gizli admin) · Expo mobil · gerçek OAuth/ödeme SDK entegrasyonları · canlı döviz API · dosya yükleme (S3) · AI ajan zamanlanmış iş (BullMQ+LLM).
