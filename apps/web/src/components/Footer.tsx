'use client';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { useSiteSettings } from '@/lib/siteSettings';
import { SocialIcon, SOCIAL_CHANNELS, SOCIAL_LABEL } from './SocialIcons';

export default function Footer() {
  const { t } = useI18n();
  const settings = useSiteSettings();
  const links = settings?.socialLinks || {};
  const active = SOCIAL_CHANNELS.filter((c) => links[c.key]);
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <Link href="/" className="brand"><span className="brand-mark" />ortakbul.org</Link>
            <p style={{ color: 'var(--text-faint)', fontSize: 13.5, marginTop: 14, maxWidth: 280 }}>
              {t('footer_tagline')}
            </p>
            {active.length > 0 && (
              <div className="social-links" style={{ marginTop: 16 }}>
                {active.map((c) => (
                  <a key={c.key} href={links[c.key]} target="_blank" rel="noopener noreferrer" className="social-ico" title={SOCIAL_LABEL[c.provider]} aria-label={SOCIAL_LABEL[c.provider]}>
                    <SocialIcon p={c.provider} size={18} />
                  </a>
                ))}
              </div>
            )}
          </div>
          <div>
            <h5>{t('foot_platform')}</h5>
            <Link href="/ortak-arayanlar">{t('nav_seekers')}</Link>
            <Link href="/sirketler">{t('nav_companies')}</Link>
            <Link href="/franchise">{t('nav_franchise')}</Link>
            <Link href="/eticaret">{t('nav_ecom')}</Link>
            <Link href="/fiyatlandirma">{t('nav_pricing')}</Link>
          </div>
          <div>
            <h5>{t('foot_community')}</h5>
            <Link href="/bana-uygun">{t('nav_whatcanido')}</Link>
            <Link href="/danismanlar">{t('nav_consultants')}</Link>
            <Link href="/kadin-melek">{t('nav_women_angel')}</Link>
          </div>
          <div>
            <h5>{t('foot_legal')}</h5>
            <Link href="/yasal/gizlilik">{t('foot_privacy')}</Link>
            <Link href="/yasal/kosullar">{t('foot_terms')}</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 ortakbul.org — {t('foot_rights')}</span>
          <span>{t('foot_slogan')}</span>
        </div>
      </div>
    </footer>
  );
}
