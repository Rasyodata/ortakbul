'use client';
import { useEffect, useRef, useState } from 'react';
import { LANGS, useI18n } from '@/lib/i18n';

export default function LangSwitcher() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const cur = LANGS.find((l) => l.code === lang) || LANGS[0];

  // Dışarı tıklayınca / Esc ile kapan — hover boşluğunda kaybolma sorunu yok.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div className="lang-switch" ref={ref}>
      <button className="lang-btn" onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open}>
        <span>{cur.flag}</span>
        <span>{cur.code.toUpperCase()}</span>
        <span>▾</span>
      </button>
      {open && (
        <div className="lang-menu" role="listbox">
          {LANGS.map((l) => (
            <button
              key={l.code}
              className={l.code === lang ? 'active' : ''}
              onClick={() => { setLang(l.code); setOpen(false); }}
            >
              <span>{l.flag}</span>
              {l.name}
              <span style={{ marginLeft: 'auto', color: 'var(--text-faint)', fontSize: 11 }}>
                {l.code.toUpperCase()}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
