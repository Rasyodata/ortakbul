'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';

export default function CookieBanner() {
  const { t } = useI18n();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('cookieConsent')) {
      const timer = setTimeout(() => setShow(true), 700);
      return () => clearTimeout(timer);
    }
  }, []);

  const save = async (analytics: boolean, marketing: boolean) => {
    const consent = { necessary: true, analytics, marketing };
    localStorage.setItem('cookieConsent', JSON.stringify(consent));
    setShow(false);
    try {
      let anonId = localStorage.getItem('anonId');
      if (!anonId) { anonId = 'anon_' + Math.random().toString(36).slice(2); localStorage.setItem('anonId', anonId); }
      await api.post('/consent', { ...consent, anonId });
    } catch {
      /* KVKK kaydı arka planda; hata sessiz geçilir */
    }
  };

  if (!show) return null;
  return (
    <div className="cookie-banner">
      <p>
        {t('cookie_text')}{' '}
        <a href="/yasal/cerez" style={{ color: 'var(--accent-a)' }}>{t('cookie_details')}</a>
      </p>
      <div className="cookie-actions">
        <button className="btn btn-ghost btn-sm" onClick={() => save(false, false)}>{t('cookie_only')}</button>
        <button className="btn btn-primary btn-sm" onClick={() => save(true, true)}>{t('cookie_all')}</button>
      </div>
    </div>
  );
}
