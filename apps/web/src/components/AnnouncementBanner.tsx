'use client';
import { useEffect, useState } from 'react';
import { useSiteSettings } from '@/lib/siteSettings';

// Yönetici panelinden açılıp kapatılabilen duyuru. Konum (ortada modal / köşe) ve
// görsel panelden ayarlanır. Kullanıcı kapatırsa o sürüm (version) hatırlanır.
export default function AnnouncementBanner() {
  const settings = useSiteSettings();
  const a = settings?.announcement;
  const [closed, setClosed] = useState(true);

  useEffect(() => {
    if (!a?.enabled) { setClosed(true); return; }
    const dismissed = localStorage.getItem('annDismissed');
    setClosed(dismissed === (a.version || '1'));
  }, [a?.enabled, a?.version]);

  if (!a?.enabled || closed) return null;

  const dismiss = () => {
    localStorage.setItem('annDismissed', a.version || '1');
    setClosed(true);
  };

  const position = a.position || 'center';
  const isCenter = position === 'center';

  const card = (
    <div className={`announce-pop pos-${position}`} role="dialog" aria-label="Duyuru" onClick={(e) => e.stopPropagation()}>
      <button className="announce-x" onClick={dismiss} aria-label="Kapat">✕</button>
      {a.imageUrl ? (
        <div className="announce-media" style={{ backgroundImage: `url(${a.imageUrl})` }} />
      ) : null}
      <div className="announce-body">
        <div className="announce-badge">📣 Duyuru</div>
        <h4 className="announce-title">{a.title}</h4>
        <p className="announce-msg">{a.message}</p>
        <div className="announce-stores">
          <span className="store-pill"> App Store</span>
          <span className="store-pill">▶ Google Play</span>
        </div>
        {a.ctaText && (
          a.ctaLink ? (
            <a href={a.ctaLink} className="btn btn-primary btn-sm btn-block" style={{ marginTop: 14 }} target="_blank" rel="noopener noreferrer">{a.ctaText}</a>
          ) : (
            <button className="btn btn-primary btn-sm btn-block" style={{ marginTop: 14 }} onClick={dismiss}>{a.ctaText}</button>
          )
        )}
      </div>
    </div>
  );

  // Ortada gösterim → arka planı karartan modal
  if (isCenter) {
    return <div className="announce-backdrop" onClick={dismiss}>{card}</div>;
  }
  return card;
}
