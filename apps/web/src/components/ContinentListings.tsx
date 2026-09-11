'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { tryShort, usdShort, Listing } from './ListingGrid';
import { useI18n, lz } from '@/lib/i18n';

// Kıta anahtarı (koddan) — etiket t() ile çevrilir
const CONT_KEY: Record<string, string> = {
  TR: 'cont_tr',
  GB: 'cont_europe', DE: 'cont_europe', FR: 'cont_europe', ES: 'cont_europe', NL: 'cont_europe', IT: 'cont_europe', PT: 'cont_europe', RU: 'cont_europe',
  US: 'cont_america',
  SA: 'cont_mideast', AE: 'cont_mideast', QA: 'cont_mideast', IR: 'cont_mideast',
  AZ: 'cont_asia',
};
const CONT_EMOJI: Record<string, string> = { cont_tr: '🇹🇷', cont_europe: '🌍', cont_america: '🌎', cont_mideast: '🕌', cont_asia: '🌏', cont_other: '🌍' };
const ORDER = ['cont_tr', 'cont_europe', 'cont_america', 'cont_mideast', 'cont_asia'];
const FLAG: Record<string, string> = {
  TR: '🇹🇷', US: '🇺🇸', GB: '🇬🇧', DE: '🇩🇪', FR: '🇫🇷', ES: '🇪🇸', PT: '🇵🇹',
  RU: '🇷🇺', SA: '🇸🇦', AE: '🇦🇪', QA: '🇶🇦', IR: '🇮🇷', AZ: '🇦🇿', NL: '🇳🇱', IT: '🇮🇹',
};
const TIER_W: Record<string, number> = { NORMAL: 1, FEATURED: 2, PRIVILEGED: 3, SHOWCASE: 4 };

export default function ContinentListings() {
  const { t, lang } = useI18n();
  const [items, setItems] = useState<Listing[]>([]);
  const [fx, setFx] = useState(41);

  useEffect(() => {
    api.get<Listing[]>('/listings').then(setItems).catch(() => {});
    api.get('/fx').then((r) => setFx(r.usdTry || 41)).catch(() => {});
  }, []);

  if (!items.length) return null;

  const groups: Record<string, Listing[]> = {};
  items.forEach((l) => {
    const key = CONT_KEY[l.countryCode || 'TR'] || 'cont_other';
    (groups[key] = groups[key] || []).push(l);
  });
  const conts = ORDER.filter((c) => groups[c]);

  const amount = (l: Listing) => {
    const foreign = l.countryCode && l.countryCode !== 'TR';
    if (foreign && l.amountTL) return usdShort(l.amountTL, fx);
    if (l.amountTL) return tryShort(l.amountTL);
    return l.price || l.amountText || '';
  };

  return (
    <div className="wrap section-tight">
      <div className="eyebrow">{t('cont_eb')}</div>
      <h2 className="sec">{t('cont_t')}</h2>
      <p className="kicker">{t('cont_s')}</p>

      {conts.map((key) => {
        const arr = [...groups[key]].sort((a, b) => (TIER_W[b.tier] || 1) - (TIER_W[a.tier] || 1)).slice(0, 4);
        const foreign = key !== 'cont_tr';
        return (
          <div className="sector-group" key={key}>
            <h3>{CONT_EMOJI[key]} {t(key)} <span className="cnt">· {groups[key].length} {t('lc_count')}{foreign ? ' · $' : ''}</span></h3>
            <div className="idea-list-grid" style={{ paddingBottom: 0 }}>
              {arr.map((l) => (
                <Link href={`/ilan/${l.id}`} key={l.id} className={`compact-card tier-${l.tier}`}>
                  <div className="compact-row">
                    <span className="compact-title">{lz(l, 'title', lang)}</span>
                    <span className="compact-sub">{FLAG[l.countryCode || 'TR'] || ''} {l.city || ''}</span>
                  </div>
                  <div className="compact-row">
                    <span className="compact-value">{amount(l)}</span>
                    <span className="compact-sub">{l.sector || l.category || ''}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
