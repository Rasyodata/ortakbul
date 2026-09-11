'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';

// Giriş yapılmadan içerik tam görünmez: guest için bulanık + giriş kapısı.
export default function GatedContent({
  children,
  label,
}: {
  children: React.ReactNode;
  label?: string;
}) {
  const { user, ready } = useAuth();
  const { t } = useI18n();
  if (!ready || user) return <>{children}</>;

  return (
    <div className="gate-wrap">
      <div className="gate-blur" aria-hidden>{children}</div>
      <div className="gate-overlay">
        <div className="gate-box">
          <h3>🔒 {label || t('gate_title')}</h3>
          <p>{t('gate_desc')}</p>
          <div className="hero-actions" style={{ justifyContent: 'center' }}>
            <Link href="/giris" className="btn btn-primary">{t('btn_login')}</Link>
            <Link href="/kayit" className="btn btn-ghost">{t('btn_register_free')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
