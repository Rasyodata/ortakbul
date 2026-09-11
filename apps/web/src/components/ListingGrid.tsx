'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useI18n, taxoName, lz } from '@/lib/i18n';
import GatedContent from './GatedContent';

export interface Listing {
  id: string; type: string; title: string; short: string;
  category?: string; sector?: string; city?: string; countryCode?: string;
  tier: string; stage?: string; amountText?: string; price?: string;
  partnershipType?: string; audited?: boolean; createdAt?: string; salePaymentType?: string; amountTL?: number; owner?: { fullName?: string; city?: string };
  details?: any; favorites?: number; identityProtected?: boolean;
}

export const PAYMENT_LABEL: Record<string, string> = {
  CASH: 'Peşin', INSTALLMENT: 'Vadeli', BARTER: 'Takas',
};
// Kısa tutar biçimi: 2.500.000 → "2,5 Milyon", 750.000 → "750 Bin"
export function moneyShort(n?: number): string {
  if (!n || n <= 0) return '';
  if (n >= 1_000_000) return `${(n / 1_000_000).toLocaleString('tr-TR', { maximumFractionDigits: 1 })} Milyon`;
  if (n >= 1_000) return `${Math.round(n / 1_000).toLocaleString('tr-TR')} Bin`;
  return n.toLocaleString('tr-TR');
}
export const tryShort = (n?: number) => (n ? `${moneyShort(n)} ₺` : '');
export const usdShort = (tl?: number, fx = 41) => (tl ? `$${moneyShort(Math.round(tl / fx))}` : '');

const FLAG: Record<string, string> = {
  TR: '🇹🇷', US: '🇺🇸', GB: '🇬🇧', DE: '🇩🇪', FR: '🇫🇷', ES: '🇪🇸', PT: '🇵🇹',
  RU: '🇷🇺', SA: '🇸🇦', AE: '🇦🇪', QA: '🇶🇦', IR: '🇮🇷', AZ: '🇦🇿', NL: '🇳🇱', IT: '🇮🇹',
};

const TIER_LABEL: Record<string, string> = {
  NORMAL: 'NORMAL', FEATURED: 'ÖNE ÇIKAN', PRIVILEGED: 'AYRICALIKLI', SHOWCASE: 'VİTRİN',
};

// Favori sayısı = kayıt tarihinin günü (örn. 25.09 → 25, 03.09 → 03)
export function favFromDate(iso?: string): string {
  if (!iso) return '00';
  return String(new Date(iso).getDate()).padStart(2, '0');
}
function fmtDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}

export function ListingCard({ l }: { l: Listing }) {
  const { t, lang } = useI18n();
  const TIER_T: Record<string, string> = {
    NORMAL: t('tier_normal').toUpperCase(), FEATURED: t('tier_featured').toUpperCase(),
    PRIVILEGED: t('tier_privileged').toUpperCase(), SHOWCASE: t('tier_showcase').toUpperCase(),
  };
  const PAY_T: Record<string, string> = { CASH: t('pay_cash'), INSTALLMENT: t('pay_installment'), BARTER: t('pay_barter') };
  const loc = [(l.countryCode && FLAG[l.countryCode]) || (l.countryCode ? l.countryCode : ''), l.city].filter(Boolean).join(' ');
  const meta = [taxoName(l.category || l.sector, lang), loc].filter(Boolean).join(' · ');
  const value = l.amountTL ? tryShort(l.amountTL) : (l.price || l.amountText || l.stage || '');
  return (
    <Link href={`/ilan/${l.id}`} className={`compact-card tier-${l.tier}`}>
      <div className="compact-row">
        <span className="compact-title">{l.identityProtected && <span title={t('identity_masked')}>🔒 </span>}{lz(l, 'title', lang)}</span>
        <span className="compact-sub">{meta}</span>
      </div>
      <div className="compact-row">
        <span className="compact-value">{value}</span>
        <span className="compact-sub">
          <span className={`tier-badge tier-${l.tier}`}><span className="dot" />{TIER_T[l.tier] || l.tier}</span>
        </span>
      </div>
      <div className="compact-row">
        <span className="compact-sub" style={{ color: 'var(--pink)' }}>❤ {l.favorites ?? favFromDate(l.createdAt)} {t('lc_fav')}</span>
        {l.salePaymentType
          ? <span className="tag struct" style={{ fontSize: 10 }}>{PAY_T[l.salePaymentType] || l.salePaymentType}</span>
          : <span className="compact-sub">{fmtDate(l.createdAt)}</span>}
      </div>
    </Link>
  );
}

export default function ListingGrid({
  type, title, subtitle, addHref, addLabel,
}: { type: string; title: string; subtitle?: string; addHref?: string; addLabel?: string }) {
  const { t } = useI18n();
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get<Listing[]>(`/listings?type=${type}${search ? `&search=${encodeURIComponent(search)}` : ''}`)
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [type, search]);

  return (
    <div className="wrap">
      <div className="listing-head">
        <div>
          <div className="eyebrow">Keşfet</div>
          <h1 style={{ fontSize: 'clamp(26px,3.4vw,34px)' }}>{title}</h1>
          {subtitle && <p className="kicker">{subtitle}</p>}
        </div>
        {addHref && <Link href={addHref} className="btn btn-primary btn-sm">{addLabel}</Link>}
      </div>
      <div className="filters">
        <input
          type="text"
          placeholder="Ara..."
          defaultValue={search}
          onKeyDown={(e) => { if (e.key === 'Enter') setSearch((e.target as HTMLInputElement).value); }}
        />
      </div>
      {loading ? (
        <div className="spinner">{t('loading')}</div>
      ) : error ? (
        <div className="empty-state">API'ye ulaşılamadı: {error}<br /><small>Backend çalışıyor mu? (http://localhost:4000)</small></div>
      ) : (
        <GatedContent>
          <div className="idea-list-grid">
            {items.length ? items.map((l) => <ListingCard key={l.id} l={l} />) : <div className="empty-state">Sonuç bulunamadı.</div>}
          </div>
        </GatedContent>
      )}
    </div>
  );
}
