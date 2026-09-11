'use client';
import { useMemo, useState } from 'react';

// Hızlı, istemci-tarafı arama + sayfalama. Büyük veride takılmaması için:
//  - arama string'i normalize edilip önceden hesaplanmış "haystack" üzerinde eşleştirilir
//  - yalnızca aktif sayfa dilimi render edilir (slice), tüm liste DOM'a basılmaz
export const PAGE_SIZES = [10, 20, 50, 100];

export function usePagedSearch<T>(
  items: T[],
  toText: (item: T) => string,
  opts?: { initialSize?: number },
) {
  const [query, setQuery] = useState('');
  const [size, setSize] = useState(opts?.initialSize ?? 20);
  const [page, setPage] = useState(1);

  // Her öğe için aranabilir metni bir kez hesapla (küçük harfe indirilmiş)
  const indexed = useMemo(
    () => items.map((it) => ({ it, hay: toText(it).toLocaleLowerCase('tr') })),
    [items, toText],
  );

  const q = query.trim().toLocaleLowerCase('tr');
  const terms = q ? q.split(/\s+/) : [];
  const filtered = useMemo(
    () => (terms.length ? indexed.filter(({ hay }) => terms.every((t) => hay.includes(t))).map((x) => x.it) : items),
    [indexed, items, q],
  );

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / size));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * size;
  const pageItems = filtered.slice(start, start + size);

  const setQ = (v: string) => { setQuery(v); setPage(1); };
  const setPageSize = (s: number) => { setSize(s); setPage(1); };

  return { query, setQuery: setQ, size, setPageSize, page: safePage, setPage, pageCount, total, pageItems, start };
}
