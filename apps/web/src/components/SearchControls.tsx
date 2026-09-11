'use client';
import { useI18n } from '@/lib/i18n';
import { PAGE_SIZES } from '@/lib/usePagedSearch';

export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const { t } = useI18n();
  return (
    <div className="searchbox">
      <span className="searchbox-ico" aria-hidden>🔍</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || t('search_ph')} aria-label={placeholder || t('search_ph')} />
      {value && <button type="button" className="searchbox-clear" onClick={() => onChange('')} aria-label={t('search_clear')}>✕</button>}
    </div>
  );
}

export function Paginator({
  page, pageCount, total, size, onPage, onSize,
}: { page: number; pageCount: number; total: number; size: number; onPage: (p: number) => void; onSize: (s: number) => void }) {
  const { t } = useI18n();
  if (total === 0) return null;
  // Görünecek sayfa numaraları (kompakt): 1 … p-1 p p+1 … son
  const nums: (number | '…')[] = [];
  const add = (n: number | '…') => nums.push(n);
  const win = 1;
  for (let i = 1; i <= pageCount; i++) {
    if (i === 1 || i === pageCount || (i >= page - win && i <= page + win)) add(i);
    else if (nums[nums.length - 1] !== '…') add('…');
  }
  return (
    <div className="paginator">
      <div className="pg-left">
        <span className="pg-total"><b>{total.toLocaleString('tr-TR')}</b> {t('results_n')}</span>
        <label className="pg-size">
          {t('per_page')}:
          <select value={size} onChange={(e) => onSize(Number(e.target.value))}>
            {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      </div>
      {pageCount > 1 && (
        <div className="pg-nav">
          <button className="pg-btn" disabled={page <= 1} onClick={() => onPage(page - 1)}>{t('pg_prev')}</button>
          {nums.map((n, i) => n === '…'
            ? <span key={`e${i}`} className="pg-ellipsis">…</span>
            : <button key={n} className={`pg-btn${n === page ? ' active' : ''}`} onClick={() => onPage(n)}>{n}</button>)}
          <button className="pg-btn" disabled={page >= pageCount} onClick={() => onPage(page + 1)}>{t('pg_next')}</button>
        </div>
      )}
    </div>
  );
}
