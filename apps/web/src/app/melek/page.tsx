'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ListingCard, Listing as L2 } from '@/components/ListingGrid';
import PagedGrid from '@/components/PagedGrid';
import { useI18n } from '@/lib/i18n';

export default function Page() {
  const { t } = useI18n();
  const [investors, setInvestors] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [fx, setFx] = useState<number>(41);
  const [opps, setOpps] = useState<L2[]>([]);

  useEffect(() => {
    api.get('/listings?type=INVESTOR_CAPITAL').then(setInvestors).catch(() => {});
    api.get('/agent/reports').then((r) => setReports(r.slice(0, 3))).catch(() => {});
    api.get('/fx').then((r) => setFx(r.usdTry)).catch(() => {});
    // 500.000 ₺ altı ilanlar → melek yatırımcı fırsatı olarak otomatik listelenir
    api.get<L2[]>('/listings?maxAmountTL=500000').then(setOpps).catch(() => {});
  }, []);

  const tiers = [
    { label: '0 – 500.000 ₺', usd: `$0 – $${Math.round(500000 / fx).toLocaleString()}` },
    { label: '500.000 – 1.000.000 ₺', usd: `$${Math.round(500000 / fx).toLocaleString()} – $${Math.round(1000000 / fx).toLocaleString()}` },
    { label: '1.000.000 ₺ +', usd: `$${Math.round(1000000 / fx).toLocaleString()} +` },
  ];

  return (
    <div className="wrap">
      <div className="special-hero angel">
        <div className="eyebrow">{t('angel_eb')}</div>
        <h1>{t('angel_t')}</h1>
        <p>{t('angel_hero_p')}</p>
        <div className="hero-actions">
          <Link href="/kayit" className="btn btn-primary">{t('angel_join')}</Link>
          <Link href="/ortak-arayanlar" className="btn btn-ghost">{t('angel_browse')}</Link>
        </div>
      </div>

      <div className="section-tight">
        <div className="eyebrow">{t('angel_tiers_eb')}</div>
        <h2 className="sec">{t('angel_tiers_t')}</h2>
        <div className="grid3">
          {tiers.map((tr) => (
            <div className="idea-card" style={{ borderLeftColor: 'var(--gold)' }} key={tr.label}>
              <div style={{ fontSize: 19, fontWeight: 700, fontFamily: 'var(--disp-font)' }}>{tr.label}</div>
              <div style={{ fontSize: 13, color: 'var(--gold)', marginTop: 4 }}>{tr.usd}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 10 }}>{t('angel_fx_note')} {fx} ₺</p>
      </div>

      <div className="section-tight">
        <div className="eyebrow">{t('angel_opps_eb')}</div>
        <h2 className="sec">{t('angel_opps_t')}</h2>
        <p className="kicker">{t('angel_opps_s')}</p>
        {opps.length ? (
          <PagedGrid<L2>
            items={opps}
            gated
            gateLabel={t('gate_title')}
            toText={(l) => [l.title, l.short, l.category, l.sector, l.city].filter(Boolean).join(' ')}
            render={(l) => <ListingCard l={l} />}
          />
        ) : <div className="empty-state" style={{ marginTop: 20 }}>{t('angel_opps_empty')}</div>}
      </div>

      {investors.length > 0 && (
        <div className="section-tight">
          <h2 className="sec">{t('angel_investors_t')}</h2>
          <div className="idea-list-grid" style={{ marginTop: 20 }}>
            {investors.map((i) => (
              <div className="idea-card" key={i.id}><span className="icon">😇</span><h3>{i.title}</h3><p>{i.short}</p></div>
            ))}
          </div>
        </div>
      )}

      <div className="section-tight">
        <div className="eyebrow">{t('angel_radar_eb')}</div>
        <h2 className="sec">{t('angel_radar_t')}</h2>
        <div style={{ marginTop: 20 }}>
          {reports.map((r) => (
            <div className="idea-card" style={{ marginBottom: 16 }} key={r.id}>
              <span className="tag struct">{r.tag}</span>
              <h3 style={{ marginTop: 10 }}>{r.title}</h3>
              <p style={{ marginTop: 8 }}>{r.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
