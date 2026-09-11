'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import LangSwitcher from './LangSwitcher';
import { useSiteSettings } from '@/lib/siteSettings';
import { SocialIcon, SOCIAL_CHANNELS, SOCIAL_LABEL } from './SocialIcons';

const ITEMS: [string, string][] = [
  ['/', 'nav_home'],
  ['/kadin-melek', 'nav_women_angel'],
  ['/ortak-arayanlar', 'nav_seekers'],
  ['/sirketler', 'nav_companies'],
  ['/franchise', 'nav_franchise'],
  ['/eticaret', 'nav_ecom'],
  ['/bana-uygun', 'nav_whatcanido'],
  ['/danismanlar', 'nav_consultants'],
  ['/fiyatlandirma', 'nav_pricing'],
];

export default function Nav() {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const settings = useSiteSettings();
  const links = settings?.socialLinks || {};
  const social = SOCIAL_CHANNELS.filter((c) => links[c.key]);

  return (
    <>
    {social.length > 0 && (
      <div className="topbar">
        <span className="tb-left">{t('nav_slogan')}</span>
        <div className="topbar-social">
          {social.map((c) => (
            <a key={c.key} href={links[c.key]} target="_blank" rel="noopener noreferrer" className="social-ico sm" title={SOCIAL_LABEL[c.provider]} aria-label={SOCIAL_LABEL[c.provider]}>
              <SocialIcon p={c.provider} size={16} />
            </a>
          ))}
        </div>
      </div>
    )}
    <nav className="nav">
      <Link href="/" className="brand">
        <span className="brand-mark" />
        ortakbul.org
      </Link>
      <button className="nav-toggle" onClick={() => setOpen((o) => !o)}>☰</button>
      <div className={`nav-links${open ? ' open' : ''}`} onClick={() => setOpen(false)}>
        {ITEMS.map(([href, key]) => (
          <Link key={href} href={href}>{t(key)}</Link>
        ))}
      </div>
      <div className="nav-right">
        <LangSwitcher />
        {user ? (
          <>
            <Link href="/profil" className="nav-user">
              <span className="avatar">{user.fullName.slice(0, 2).toUpperCase()}</span>
              <span>{user.fullName.split(' ')[0]}</span>
            </Link>
            <button className="btn btn-ghost btn-sm" onClick={() => logout()}>{t('nav_logout')}</button>
          </>
        ) : (
          <>
            <Link href="/giris" className="btn btn-ghost btn-sm">{t('nav_login')}</Link>
            <Link href="/paylas" className="btn nav-cta">{t('nav_share')}</Link>
          </>
        )}
      </div>
    </nav>
    </>
  );
}
