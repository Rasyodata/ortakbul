'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { ListingCard, Listing, moneyShort } from './ListingGrid';
import GatedContent from './GatedContent';
import { taxoName, lz } from '@/lib/i18n';
import { usePagedSearch } from '@/lib/usePagedSearch';
import { SearchBox, Paginator } from './SearchControls';

const TIER_W: Record<string, number> = { NORMAL: 1, FEATURED: 2, PRIVILEGED: 3, SHOWCASE: 4 };

// Satılık Şirketler düzeni: analiz tablosu + sektöre gruplu + filtreler + gated.
// Fikirler, Ortak Arayanlar, Franchise, Satılık Şirketler — hepsinde aynı yapı.
export default function GroupedListings({
  type, eyebrow, title, subtitle, addHref, addLabel, payment = false, valueLabel = 'val_total', businessTypes,
}: {
  type?: string; eyebrow: string; title: string; subtitle?: string;
  addHref?: string; addLabel?: string; payment?: boolean; valueLabel?: string; businessTypes?: string[];
}) {
  const { t, lang } = useI18n();
  // eyebrow/title/subtitle/addLabel/valueLabel birer çeviri anahtarıdır (t ile çözülür)
  const tt = (k?: string) => (k ? t(k) : '');
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sector, setSector] = useState('');
  const [pay, setPay] = useState('');
  const [fx, setFx] = useState(41);

  const btKey = businessTypes?.join(',') || '';
  useEffect(() => {
    setLoading(true);
    const q = new URLSearchParams();
    if (type) q.set('type', type);
    if (pay) q.set('salePaymentType', pay);
    api.get<Listing[]>(`/listings?${q.toString()}`)
      .then((data) => setItems(businessTypes ? data.filter((d) => businessTypes.includes(d.details?.businessType)) : data))
      .catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [type, pay, btKey]);

  useEffect(() => { api.get('/fx').then((r) => setFx(r.usdTry || 41)).catch(() => {}); }, []);

  // Sektör filtresi + öne çıkarmaya (pakete) göre sıralı (Vitrin → ... → Standart), grup içinde tutara göre
  const filtered = sector ? items.filter((c) => c.sector === sector || c.category === sector) : items;
  const sorted = [...filtered].sort((a, b) =>
    (TIER_W[b.tier] || 1) - (TIER_W[a.tier] || 1) || (b.amountTL || 0) - (a.amountTL || 0));
  const allSectors = Array.from(new Set(items.map((x) => x.sector || x.category).filter(Boolean))) as string[];

  // Arama + sayfalama (istemci tarafı, hızlı)
  const ps = usePagedSearch<Listing>(
    sorted,
    (l) => [lz(l,'title',lang), lz(l,'short',lang), l.title, l.short, l.category, l.sector, l.city, l.countryCode].filter(Boolean).join(' '),
  );

  const totalTL = items.reduce((s, x) => s + (x.amountTL || 0), 0);
  const secCount = new Set(items.map((x) => x.sector || x.category).filter(Boolean)).size;
  const payCount = { CASH: 0, INSTALLMENT: 0, BARTER: 0 } as Record<string, number>;
  items.forEach((x) => { if (x.salePaymentType && payCount[x.salePaymentType] !== undefined) payCount[x.salePaymentType]++; });

  return (
    <div className="wrap section-tight">
      <div className="listing-head" style={{ paddingTop: 0 }}>
        <div>
          <div className="eyebrow">{tt(eyebrow)}</div>
          <h1 style={{ fontSize: 'clamp(26px,3.4vw,34px)' }}>{tt(title)}</h1>
          {subtitle && <p className="kicker">{tt(subtitle)}</p>}
        </div>
        {addHref && <Link href={addHref} className="btn btn-primary btn-sm">{tt(addLabel)}</Link>}
      </div>

      {!loading && !error && (
        <>
          <div className="stat-strip" style={{ marginTop: 8, textAlign: 'center', gridTemplateColumns: 'repeat(3,1fr)' }}>
            <div style={{ borderRight: '1px solid var(--line)' }}><div className="num">{items.length}</div><div className="lbl">{t('st_total')}</div></div>
            <div style={{ borderRight: '1px solid var(--line)' }}>
              <div className="num" style={{ fontSize: 26 }}>
                {moneyShort(totalTL)} ₺ <span style={{ color: 'var(--gold)' }}>/ {moneyShort(Math.round(totalTL / fx))} $</span>
              </div>
              <div className="lbl">{tt(valueLabel)}</div>
            </div>
            <div><div className="num">{secCount}</div><div className="lbl">{t('st_sector')}</div></div>
          </div>
          {payment && (
            <div className="tag-row" style={{ marginTop: 12, gap: 10, justifyContent: 'center' }}>
              <span className="tag struct">{t('pay_cash')}: {payCount.CASH}</span>
              <span className="tag struct">{t('pay_installment')}: {payCount.INSTALLMENT}</span>
              <span className="tag struct">{t('pay_barter')}: {payCount.BARTER}</span>
            </div>
          )}
        </>
      )}

      <div className="filters" style={{ marginTop: 20 }}>
        <SearchBox value={ps.query} onChange={ps.setQuery} />
        <select value={sector} onChange={(e) => setSector(e.target.value)}>
          <option value="">{t('f_all_sectors')}</option>
          {allSectors.map((s) => <option key={s} value={s}>{taxoName(s, lang)}</option>)}
        </select>
        {payment && (
          <select value={pay} onChange={(e) => setPay(e.target.value)}>
            <option value="">{t('f_all_pay')}</option>
            <option value="CASH">{t('pay_cash')}</option>
            <option value="INSTALLMENT">{t('pay_installment')}</option>
            <option value="BARTER">{t('pay_barter')}</option>
          </select>
        )}
      </div>

      {loading ? (
        <div className="spinner">{t('loading')}</div>
      ) : error ? (
        <div className="empty-state">{t('empty_api')}: {error}</div>
      ) : (
        <GatedContent label={t('gate_title')}>
          <Paginator page={ps.page} pageCount={ps.pageCount} total={ps.total} size={ps.size} onPage={ps.setPage} onSize={ps.setPageSize} />
          {ps.total ? (
            <div className="idea-list-grid" style={{ paddingBottom: 0 }}>
              {ps.pageItems.map((l) => <ListingCard key={l.id} l={l} />)}
            </div>
          ) : <div className="empty-state">{ps.query ? t('search_no_results') : t('empty_none')}</div>}
        </GatedContent>
      )}
    </div>
  );
}
