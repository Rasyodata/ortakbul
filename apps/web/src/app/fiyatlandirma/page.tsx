'use client';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

// Tek seferlik ilan paketi fiyatları — paylas TIER_PKGS ile birebir aynı olmalı.
const TIERS = [
  { key: 'NORMAL', label: 'tier_normal', price: 0, women: 0, popular: false, feats: ['feat_publish'] },
  { key: 'FEATURED', label: 'tier_featured', price: 950, women: 500, popular: false, feats: ['feat_publish', 'feat_top'] },
  { key: 'PRIVILEGED', label: 'tier_privileged', price: 1950, women: 950, popular: true, feats: ['feat_top', 'feat_freq', 'feat_prio_cons'] },
  { key: 'SHOWCASE', label: 'tier_showcase', price: 4950, women: 2950, popular: false, feats: ['feat_home', 'feat_max_vis', 'feat_all'] },
];

const money = (n: number) => `₺${n.toLocaleString('tr-TR')}`;

export default function Page() {
  const { t } = useI18n();
  return (
    <div className="wrap section-tight">
      <div className="eyebrow">{t('pr_eb')}</div>
      <h1 style={{ fontSize: 'clamp(30px,4vw,42px)', color: 'var(--green)' }}>{t('pr_t')}</h1>
      <p className="kicker">{t('pr_s')}</p>
      <div className="price-grid">
        {TIERS.map((tr) => (
          <div className={`price-card${tr.popular ? ' popular' : ''}`} key={tr.key}>
            {tr.popular && <span className="price-pop-badge">★ {t('pr_popular')}</span>}
            <span className={`tier-badge tier-${tr.key}`}><span className="dot" />{t(tr.label).toUpperCase()}</span>
            <div className="price">
              {tr.price === 0 ? t('pr_free') : <>{money(tr.price)} <span className="per">{t('pr_per_listing')}</span></>}
            </div>
            {tr.women > 0
              ? <div className="women-price">♀ {t('pr_women')}: {money(tr.women)}</div>
              : <div className="price-sub">{tr.price === 0 ? ' ' : t('pr_onetime')}</div>}
            <ul>
              {tr.feats.map((f) => <li key={f}>{t(f)}</li>)}
            </ul>
            <Link href="/paylas" className={`btn btn-block ${tr.popular ? 'btn-primary' : 'btn-ghost'}`}>{t('pr_select')}</Link>
          </div>
        ))}
      </div>
      <div className="alert alert-success" style={{ marginTop: 28 }}>
        <span className="alert-ico">✓</span>
        <div>{t('pr_pay_note')}</div>
      </div>
    </div>
  );
}
