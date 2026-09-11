'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { SocialIcon, SOCIAL_LABEL } from '@/components/SocialIcons';

const PRIMARY = ['GOOGLE', 'APPLE'];
const MINI = ['FACEBOOK', 'INSTAGRAM', 'TIKTOK'];

export default function Page() {
  const { login, social } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(true);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await login(String(fd.get('email')), String(fd.get('password')), remember);
      router.push('/profil');
    } catch (err: any) { setError(err.message); }
  };

  const doSocial = async (p: string) => {
    const email = prompt(`${p} e-postan (demo):`) || '';
    if (!email) return;
    try { await social(p, email); router.push('/profil'); } catch (err: any) { setError(err.message); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2 style={{ fontSize: 22, marginBottom: 6 }}>{t('nav_login')}</h2>
        <p style={{ color: 'var(--text-faint)', fontSize: 13.5, marginBottom: 20 }}>{t('login_sub')}</p>
        <div className="social-primary">
          {PRIMARY.map((k) => (
            <button key={k} className="social-btn-lg" onClick={() => doSocial(k)}>
              <SocialIcon p={k} size={20} />
              <span>{SOCIAL_LABEL[k]} {t('social_continue')}</span>
            </button>
          ))}
        </div>
        <div className="social-mini-row">
          {MINI.map((k) => (
            <button key={k} className="social-btn" title={`${SOCIAL_LABEL[k]} ${t('social_continue')}`} onClick={() => doSocial(k)}>
              <SocialIcon p={k} size={20} />
            </button>
          ))}
        </div>
        <div className="divider">{t('or_email')}</div>
        {error && <div className="approval-banner" style={{ marginTop: 0, marginBottom: 12 }}>{error}</div>}
        <form onSubmit={submit}>
          <div className="field"><label>{t('f_email')}</label><input required type="email" name="email" placeholder="ornek@eposta.com" /></div>
          <div className="field"><label>{t('f_password')}</label><input required type="password" name="password" placeholder="••••••••" /></div>
          <label className="remember-row">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            <span>{t('remember_me')}</span>
            <span className="remember-hint">{remember ? t('remember_on') : t('remember_off')}</span>
          </label>
          <button className="btn btn-primary btn-block" type="submit">{t('nav_login')}</button>
        </form>
        <div className="auth-switch">{t('no_account')} <Link href="/kayit">{t('create_account')}</Link></div>
      </div>
    </div>
  );
}
