'use client';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="wrap" style={{ minHeight: '62vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ maxWidth: 480 }}>
        <div style={{ fontSize: 'clamp(72px,14vw,120px)', fontWeight: 800, fontFamily: 'var(--disp-font)', lineHeight: 1, background: 'linear-gradient(135deg,#0f3d34,#bd9a44)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>404</div>
        <h1 style={{ fontSize: 24, marginTop: 12 }}>{t('nf_title')}</h1>
        <p style={{ color: 'var(--text-dim)', marginTop: 10, fontSize: 15 }}>{t('nf_desc')}</p>
        <div className="hero-actions" style={{ justifyContent: 'center', marginTop: 26 }}>
          <Link href="/" className="btn btn-primary">{t('nf_home')}</Link>
          <Link href="/ortak-arayanlar" className="btn btn-ghost">{t('nf_explore')}</Link>
        </div>
      </div>
    </div>
  );
}
