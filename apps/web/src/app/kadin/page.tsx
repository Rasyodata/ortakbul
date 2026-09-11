'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ListingCard, Listing as L2 } from '@/components/ListingGrid';
import PagedGrid from '@/components/PagedGrid';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';

export default function Page() {
  const [items, setItems] = useState<L2[]>([]);
  const { user } = useAuth();
  const { t } = useI18n();
  const ben = user?.benefits;

  useEffect(() => {
    api.get<L2[]>('/listings?ownerGender=FEMALE').then(setItems).catch(() => {});
  }, []);

  const cards: [string, string, string][] = [
    ['⭐', t('feat_freq'), t('post_women_disc')],
    ['👭', t('opp_wa_sub'), t('opp_wa_d')],
  ];

  return (
    <div className="wrap">
      <div className="women-hero">
        <div className="eyebrow">{t('women_eb')}</div>
        <h1>{t('women_t')}</h1>
        <p>{t('women_hero_p')}</p>
        <div className="hero-actions">
          <Link href="/kayit" className="btn btn-women">{t('women_join')}</Link>
          <Link href="/paylas" className="btn btn-ghost">{t('women_share')}</Link>
        </div>
      </div>

      <div className="section-tight" style={{ paddingTop: 32 }}>
        <div className="women-pack">
          <div className="eyebrow" style={{ marginBottom: 4 }}>{t('women_pack_eb')}</div>
          {ben?.program && (
            <div className="women-perk">
              ✅ <b>{t('women_perk_active')}, {user?.fullName?.split(' ')[0]}!</b>{' '}
              {t('women_c1_t')}: {ben.accountingFree ? <b>{ben.accountingDaysLeft} {t('women_days_left')}</b> : t('women_acc_expired')};{' '}
              {t('women_c2_t')}: {ben.consultancyFree ? <b>{ben.consultancyDaysLeft} {t('women_days_left')}</b> : '—'};{' '}
              {ben.auditDiscountPct > 0 ? <b>%{ben.auditDiscountPct}</b> : '—'}.
            </div>
          )}
          <div className="perk-grid">
            <div className="perk-card">
              <div className="perk-ico">🧾</div>
              <span className="perk-tag">{t('women_pk1_tag')}</span>
              <h3>{t('women_c1_t')}</h3>
              <p>{t('women_c1_d')}</p>
            </div>
            <div className="perk-card">
              <div className="perk-ico">👔</div>
              <span className="perk-tag">{t('women_pk2_tag')}</span>
              <h3>{t('women_c2_t')}</h3>
              <p>{t('women_c2_d')}</p>
            </div>
            <div className="perk-card">
              <div className="perk-ico">🛡️</div>
              <span className="perk-tag">{t('women_pk3_tag')}</span>
              <h3>{t('women_c3_t')}</h3>
              <p>{t('women_c3_d')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="section-tight">
        <div className="grid3">
          {cards.map(([i, h, p]) => (
            <div className="idea-card women-card" key={h}>
              <span className="icon">{i}</span><h3>{h}</h3><p>{p}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="section-tight">
        <div className="listing-head" style={{ paddingTop: 0 }}>
          <div><div className="eyebrow women-eyebrow">{t('women_showcase_eb')}</div><h2 className="sec" style={{ color: '#8e2f63' }}>{t('women_listings_t')}</h2></div>
        </div>
        {items.length ? (
          <PagedGrid<L2>
            items={items}
            gated
            toText={(l) => [l.title, l.short, l.category, l.sector, l.city].filter(Boolean).join(' ')}
            render={(l) => <ListingCard l={l} />}
          />
        ) : (
          <div className="empty-state" style={{ marginTop: 20 }}>{t('women_empty')} → <Link href="/kayit" style={{ color: '#c43f77', fontWeight: 600 }}>{t('women_join')}</Link></div>
        )}
      </div>
    </div>
  );
}
