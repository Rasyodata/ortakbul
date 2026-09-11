# @ortakbul/web — Next.js Web Arayüzü

Demonun tasarımını gerçek API'ye bağlayan production web uygulaması.

- **Next.js 14** (App Router) + TypeScript
- **9 dil + RTL** (Arapça/Farsça) + dile göre renk/font teması — `src/lib/i18n.tsx`
- Tasarım sistemi demodan portlandı — `src/app/globals.css`
- API istemcisi (JWT) — `src/lib/api.ts` · Auth context — `src/lib/auth.tsx`
- **Gizli admin paneli**: `/y-panel-8f3a` (nav'da görünmez; `.env` ile eşleşir)

## Çalıştırma

```bash
# önce API çalışıyor olmalı (../api) — http://localhost:4000
cp .env.example .env.local     # NEXT_PUBLIC_API_URL ayarla
pnpm install                   # (kök dizinden pnpm install da yeterli)
pnpm --filter @ortakbul/web dev
# → http://localhost:3000
```

## Sayfalar
Ana sayfa · Fikirler · Ortak Arayanlar · Satılık Şirketler · İlan detay (giriş kapılı) ·
Danışmanlar · Melek Yatırımcı (sermaye kademeleri + $ + AI ajan) · Fiyatlandırma ·
Giriş / Kayıt (ülke+fatura+sosyal) · İlan Ver · Profil · Yasal · Gizli Admin Paneli.

## Sırada
Kalan sayfalar (franchise/e-ticaret/kadın/partner detay), i18n içerik çevirisinin tamamı,
ödeme akışı UI, admin panelinin tüm modülleri, dosya yükleme.
