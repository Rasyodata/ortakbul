'use client';
import React from 'react';
import { useI18n } from '@/lib/i18n';
import { usePagedSearch } from '@/lib/usePagedSearch';
import { SearchBox, Paginator } from './SearchControls';
import GatedContent from './GatedContent';

// Genel: arama + sayfa boyutu + sayfalama olan grid. items her yerde (ilan/danışman) kullanılır.
export default function PagedGrid<T extends { id?: string }>({
  items, toText, render, gridClass = 'idea-list-grid', searchPlaceholder, gated, gateLabel, initialSize = 12,
}: {
  items: T[];
  toText: (item: T) => string;
  render: (item: T) => React.ReactNode;
  gridClass?: string;
  searchPlaceholder?: string;
  gated?: boolean;
  gateLabel?: string;
  initialSize?: number;
}) {
  const { t } = useI18n();
  const ps = usePagedSearch<T>(items, toText, { initialSize });

  const body = (
    <>
      <div className="filters" style={{ marginTop: 12 }}>
        <SearchBox value={ps.query} onChange={ps.setQuery} placeholder={searchPlaceholder} />
      </div>
      <Paginator page={ps.page} pageCount={ps.pageCount} total={ps.total} size={ps.size} onPage={ps.setPage} onSize={ps.setPageSize} />
      {ps.total ? (
        <div className={gridClass} style={{ paddingBottom: 0 }}>
          {ps.pageItems.map((it, i) => <React.Fragment key={(it.id as string) || i}>{render(it)}</React.Fragment>)}
        </div>
      ) : (
        <div className="empty-state">{ps.query ? t('search_no_results') : t('empty_none')}</div>
      )}
    </>
  );

  return gated ? <GatedContent label={gateLabel}>{body}</GatedContent> : body;
}
