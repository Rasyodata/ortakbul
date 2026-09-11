'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { api } from '@/lib/api';
import { ListingCard, Listing, moneyShort } from '@/components/ListingGrid';
import ContinentListings from '@/components/ContinentListings';
import CountUp from '@/components/CountUp';

// Kategori bazlı yatırım fırsatı kartları — her biri ilgili sayfaya götürür
// title/desc birer çeviri anahtarıdır (t ile çözülür)
const OPP_CATS: { key: string; icon: string; title: string; href: string; desc: string; accent: string }[] = [
  { key: 'PARTNERSHIP', icon: '🤝', title: 'nav_seekers', href: '/ortak-arayanlar', desc: 'opp_seekers_d', accent: '#0f5d4e' },
  { key: 'COMPANY_SALE', icon: '🏢', title: 'nav_companies', href: '/sirketler', desc: 'opp_comp_d', accent: '#b08428' },
  { key: 'FRANCHISE', icon: '🔑', title: 'nav_franchise', href: '/franchise', desc: 'opp_fr_d', accent: '#a85f34' },
  { key: 'ECOM', icon: '🛒', title: 'nav_ecom', href: '/eticaret', desc: 'opp_ecom_d', accent: '#2f7d7a' },
];

export default function Home() {
  const { t } = useI18n();
  const [meta, setMeta] = useState<any>(null);
  const [featured, setFeatured] = useState<Listing[]>([]);

  useEffect(() => {
    api.get('/meta').then(setMeta).catch(() => {});
    api.get<Listing[]>('/listings?type=PARTNERSHIP').then((r) => setFeatured(r.slice(0, 4))).catch(() => {});
  }, []);

  const fx = meta?.fx?.usdTry || 41;
  const totalTL = meta?.totals?.valueTL || 0;
  const byType = meta?.byType || {};
  const c = meta?.counts || {};
  const usdNum = (tl: number) => Math.round(tl / fx);

  const structures = [
    ['💰', t('s_capital')], ['🏦', t('s_collateral')], ['📈', t('s_credit')], ['🧾', t('s_cheque')],
  ];
  const audiences = [
    ['🚀', t('aud1_t'), t('aud1_d')],
    ['😇', t('aud2_t'), t('aud2_d')],
    ['👔', t('aud3_t'), t('aud3_d')],
  ];

  return (
    <>
      <div className="wrap"><div className="hero">
        <div className="hero-copy">
          <div className="eyebrow">{t('h_hero_eb')}</div>
          <h1>{t('hero_title')}</h1>
          <p>{t('hero_sub')}</p>
          <div className="hero-actions">
            <Link href="/paylas" className="btn btn-primary">{t('hero_cta1')}</Link>
            <Link href="/bana-uygun" className="btn btn-ghost">{t('hero_cta2')}</Link>
          </div>
          <div className="hero-badges">
            <div className="hero-badge">✓ <b>{t('free')}</b></div>
            <div className="hero-badge">🔒 <b>{t('badge_kvkk')}</b></div>
            <div className="hero-badge">🌍 <b>{t('badge_langs')}</b></div>
          </div>
        </div>
        <div className="hero-panel">
          <div className="flow-item"><span className="flow-num">1</span><div><h4>{t('flow1_t')}</h4><p>{t('flow1_d')}</p></div></div>
          <div className="flow-item"><span className="flow-num">2</span><div><h4>{t('flow2_t')}</h4><p>{t('flow2_d')}</p></div></div>
          <div className="flow-item"><span className="flow-num">3</span><div><h4>{t('flow3_t')}</h4><p>{t('flow3_d')}</p></div></div>
        </div>
      </div></div>

      {/* Yatırımcıyı çeken canlı analiz bandı */}
      <div className="wrap section-tight" style={{ paddingTop: 0 }}>
        <div className="mega-band">
          <div className="mega-eyebrow">{t('mega_eb')}</div>
          <div className="mega-total">
            <CountUp value={totalTL} format={moneyShort} /> ₺ <span className="usd">/ <CountUp value={usdNum(totalTL)} format={moneyShort} /> $</span>
          </div>
          <div className="mega-sub">{t('mega_sub')}</div>
          <div className="mega-mini">
            <div><div className="mv"><CountUp value={c.listings || 0} /></div><div className="ml">{t('m_listings')}</div></div>
            <div><div className="mv"><CountUp value={c.consultants || 0} /></div><div className="ml">{t('m_consultants')}</div></div>
            <div><div className="mv"><CountUp value={c.sectors || 0} /></div><div className="ml">{t('st_sector')}</div></div>
            <div><div className="mv"><CountUp value={c.countries || 0} /></div><div className="ml">{t('m_countries')}</div></div>
            <div><div className="mv"><CountUp value={c.women || 0} /></div><div className="ml">{t('m_women')}</div></div>
          </div>
        </div>

        <div className="opp-grid">
          {OPP_CATS.map((cat) => {
            const v = byType[cat.key] || { count: 0, valueTL: 0 };
            return (
              <Link href={cat.href} className="opp-card" key={cat.key} style={{ ['--oc-accent' as any]: cat.accent }}>
                <span className="oc-arrow">→</span>
                <span className="oc-icon">{cat.icon}</span>
                <div className="oc-title">{t(cat.title)}</div>
                <div className="oc-desc">{t(cat.desc)}</div>
                <div className="oc-val"><CountUp value={v.valueTL} format={moneyShort} /> ₺ <span className="oc-usd">/ <CountUp value={usdNum(v.valueTL)} format={moneyShort} /> $</span></div>
                <div className="oc-count"><CountUp value={v.count} /> {t('active_listing_n')}</div>
              </Link>
            );
          })}
          <Link href="/kadin-melek" className="opp-card" style={{ ['--oc-accent' as any]: '#c43f77' }}>
            <span className="oc-arrow">→</span>
            <span className="oc-icon">👩‍💼</span>
            <div className="oc-title">{t('nav_women_angel')}</div>
            <div className="oc-desc">{t('opp_wa_d')}</div>
            <div className="oc-val"><CountUp value={c.women || 0} /> <span className="oc-usd">{t('opp_wa_unit')}</span></div>
            <div className="oc-count">{t('opp_wa_sub')}</div>
          </Link>
        </div>
      </div>

      <div className="wrap section-tight">
        <div className="eyebrow">{t('h_struct_eb')}</div>
        <h2 className="sec">{t('h_struct_t')}</h2>
        <div className="grid4">
          {structures.map(([i, h]) => (
            <div className="audience-card" key={h}><span className="icon">{i}</span><h4>{h}</h4></div>
          ))}
        </div>
      </div>

      {featured.length > 0 && (
        <div className="wrap section-tight">
          <div className="listing-head" style={{ paddingTop: 0 }}>
            <div><div className="eyebrow">{t('h_feat_eb')}</div><h2 className="sec">{t('h_feat_t')}</h2></div>
            <Link href="/ortak-arayanlar" className="btn btn-ghost btn-sm">{t('btn_all')}</Link>
          </div>
          <div className="idea-list-grid" style={{ marginTop: 20 }}>
            {featured.map((l) => <ListingCard key={l.id} l={l} />)}
          </div>
        </div>
      )}

      <ContinentListings />

      <div className="wrap section-tight">
        <div className="eyebrow">{t('h_eco_eb')}</div>
        <h2 className="sec">{t('h_eco_t')}</h2>
        <div className="grid3">
          {audiences.map(([i, h, p]) => (
            <div className="audience-card" key={h}><span className="icon">{i}</span><h4>{h}</h4><p>{p}</p></div>
          ))}
        </div>
      </div>

      <div className="wrap section-tight">
        <div className="cta-band">
          <h2>{t('h_cta_t')}</h2>
          <p>{t('h_cta_s')}</p>
          <Link href="/paylas" className="btn btn-primary">{t('btn_start_now')}</Link>
        </div>
      </div>
    </>
  );
}
